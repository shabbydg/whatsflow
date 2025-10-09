/**
 * Business Profile Scraper Service
 * Extracts business information from websites using AI
 */

import puppeteer from 'puppeteer';
import { aiManager } from './ai-manager.service.js';
import logger from '../../utils/logger.js';
import pool from '../../config/database.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface Product {
  name: string;
  description?: string;
  price?: string;
  category?: string;
  features?: string[];
}

interface Service {
  name: string;
  description?: string;
  pricing?: string;
  duration?: string;
}

interface Offer {
  title: string;
  description?: string;
  discount?: string;
  validUntil?: string;
}

interface BusinessProfileData {
  business_name?: string;
  industry?: string;
  description?: string;
  products?: Product[];
  services?: Service[];
  offers?: Offer[];
  pricing_info?: string;
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  business_hours?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  faq?: Array<{ question: string; answer: string }>;
  key_features?: string[];
}

interface ScrapingProgress {
  status: 'pending' | 'scraping' | 'analyzing' | 'completed' | 'failed';
  currentPage: number;
  totalPages: number;
  message: string;
  error?: string;
}

export class ProfileScraperService {
  private maxPages = 10; // Limit to prevent excessive crawling
  private visitedUrls = new Set<string>();
  private progressMap = new Map<string, ScrapingProgress>();

  /**
   * Scrape and analyze a business website (multi-page)
   */
  async scrapeWebsite(
    url: string,
    businessProfileId: string,
    crawlFullSite: boolean = true
  ): Promise<BusinessProfileData> {
    try {
      logger.info(`Starting website scrape: ${url}, fullSite: ${crawlFullSite}`);

      // Update database scraping status
      await this.updateScrapingStatus(businessProfileId, 'in_progress');

      // Initialize progress tracking
      this.progressMap.set(businessProfileId, {
        status: 'scraping',
        currentPage: 0,
        totalPages: crawlFullSite ? this.maxPages : 1,
        message: 'Starting website scraping...',
      });

      this.visitedUrls.clear();

      // Crawl multiple pages if requested
      const pages = crawlFullSite
        ? await this.crawlWebsiteWithProgress(url, businessProfileId)
        : [await this.fetchWebsiteContent(url)];

      // Update progress: analyzing
      this.progressMap.set(businessProfileId, {
        status: 'analyzing',
        currentPage: pages.length,
        totalPages: pages.length,
        message: `Analyzing ${pages.length} pages with AI...`,
      });

      // Combine all content
      const combinedContent = pages.join('\n\n---PAGE BREAK---\n\n');

      // Extract structured data using AI
      const businessData = await this.extractBusinessInfo(combinedContent, url);

      // Generate knowledge base
      const knowledgeBase = await this.generateKnowledgeBase(businessData);

      // Update business profile in database
      await this.updateBusinessProfile(businessProfileId, businessData, knowledgeBase);

      // Update database scraping status
      await this.updateScrapingStatus(businessProfileId, 'completed');

      // Update progress: completed
      this.progressMap.set(businessProfileId, {
        status: 'completed',
        currentPage: pages.length,
        totalPages: pages.length,
        message: `Successfully scraped ${pages.length} pages`,
      });

      logger.info(`Website scrape completed: ${url}, pages scraped: ${pages.length}`);

      return businessData;
    } catch (error: any) {
      logger.error('Profile scraping error:', error);

      // Update database scraping status
      await this.updateScrapingStatus(businessProfileId, 'failed');

      // Update progress: failed
      this.progressMap.set(businessProfileId, {
        status: 'failed',
        currentPage: 0,
        totalPages: 0,
        message: 'Scraping failed',
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Get scraping progress for a business profile
   */
  getScrapingProgress(businessProfileId: string): ScrapingProgress | null {
    return this.progressMap.get(businessProfileId) || null;
  }

  /**
   * Update scraping status in database
   */
  private async updateScrapingStatus(
    businessProfileId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
  ): Promise<void> {
    await pool.query<ResultSetHeader>(
      `UPDATE business_profiles
       SET scraping_status = ?, last_scraped_at = NOW()
       WHERE id = ?`,
      [status, businessProfileId]
    );
  }

  /**
   * Crawl website with progress tracking
   */
  private async crawlWebsiteWithProgress(startUrl: string, businessProfileId: string): Promise<string[]> {
    const baseUrl = new URL(startUrl);
    const contents: string[] = [];
    const urlsToVisit = [startUrl];

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      while (urlsToVisit.length > 0 && this.visitedUrls.size < this.maxPages) {
        const currentUrl = urlsToVisit.shift()!;

        if (this.visitedUrls.has(currentUrl)) {
          continue;
        }

        this.visitedUrls.add(currentUrl);

        // Update progress
        this.progressMap.set(businessProfileId, {
          status: 'scraping',
          currentPage: this.visitedUrls.size,
          totalPages: Math.min(this.maxPages, this.visitedUrls.size + urlsToVisit.length),
          message: `Scraping page ${this.visitedUrls.size}/${this.maxPages}...`,
        });

        try {
          const page = await browser.newPage();
          await page.setUserAgent(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          );

          await page.goto(currentUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000,
          });

          // Extract content and links
          const result = await page.evaluate(() => {
            // Remove unwanted elements
            const elementsToRemove = document.querySelectorAll(
              'script, style, noscript, iframe, nav, footer, header[role="banner"]'
            );
            elementsToRemove.forEach((el) => el.remove());

            // Get all links
            const links = Array.from(document.querySelectorAll('a[href]'))
              .map((a) => (a as HTMLAnchorElement).href)
              .filter((href) => href && !href.startsWith('#'));

            return {
              content: document.body.innerText,
              links: links,
            };
          });

          contents.push(result.content);

          // Add new URLs to visit (only same domain)
          for (const link of result.links) {
            try {
              const linkUrl = new URL(link);
              if (
                linkUrl.hostname === baseUrl.hostname &&
                !this.visitedUrls.has(link) &&
                !urlsToVisit.includes(link)
              ) {
                // Prioritize pages with relevant keywords
                if (
                  link.includes('product') ||
                  link.includes('service') ||
                  link.includes('pricing') ||
                  link.includes('about') ||
                  link.includes('offer')
                ) {
                  urlsToVisit.unshift(link); // Add to front
                } else {
                  urlsToVisit.push(link);
                }
              }
            } catch (e) {
              // Invalid URL, skip
            }
          }

          await page.close();
        } catch (error) {
          logger.warn(`Failed to scrape ${currentUrl}:`, error);
        }
      }

      return contents;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }


  /**
   * Fetch website content using Puppeteer
   */
  private async fetchWebsiteContent(url: string): Promise<string> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      // Set realistic user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Extract text content
      const content = await page.evaluate(() => {
        // Remove scripts, styles, and unwanted elements
        const elementsToRemove = document.querySelectorAll(
          'script, style, noscript, iframe, nav, footer, header[role="banner"]'
        );
        elementsToRemove.forEach((el) => el.remove());

        // Get visible text
        return document.body.innerText;
      });

      return content;
    } catch (error: any) {
      logger.error('Puppeteer scraping error:', error);
      throw new Error(`Failed to fetch website: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Extract structured business information using AI
   */
  private async extractBusinessInfo(
    content: string,
    url: string
  ): Promise<BusinessProfileData> {
    const prompt = `You are an expert at analyzing business websites and extracting structured information.

Analyze the following website content (which may contain multiple pages) and extract comprehensive business information in JSON format:

{
  "business_name": "The official business name",
  "industry": "The business industry/sector",
  "description": "A detailed 2-3 sentence description of what the business does",
  "products": [
    {
      "name": "Product name",
      "description": "Product description",
      "price": "Price if mentioned (e.g., '$99', 'Starting at $50')",
      "category": "Product category",
      "features": ["Key features"]
    }
  ],
  "services": [
    {
      "name": "Service name",
      "description": "Service description",
      "pricing": "Pricing info if available",
      "duration": "Duration if applicable"
    }
  ],
  "offers": [
    {
      "title": "Offer/promotion title",
      "description": "Offer details",
      "discount": "Discount amount/percentage",
      "validUntil": "Expiry date if mentioned"
    }
  ],
  "pricing_info": "General pricing information or pricing structure",
  "contact_info": {
    "email": "Contact email",
    "phone": "Phone number",
    "address": "Physical address"
  },
  "business_hours": "Operating hours",
  "social_media": {
    "facebook": "Facebook URL",
    "instagram": "Instagram URL",
    "twitter": "Twitter URL",
    "linkedin": "LinkedIn URL"
  },
  "faq": [
    {"question": "Question", "answer": "Answer"}
  ],
  "key_features": ["Main selling points or unique features"]
}

IMPORTANT:
- Extract ALL products/services you find with their prices
- Catalog ALL offers, discounts, and promotions
- Include detailed pricing information
- Only include fields where you find clear information
- Don't make up information - only extract what's explicitly stated`;

    // Truncate content if too long (max ~8000 words)
    const truncatedContent = content.substring(0, 50000);

    try {
      const data = await aiManager.extractStructuredData(
        prompt,
        `Website: ${url}\n\nContent:\n${truncatedContent}`
      );

      return data as BusinessProfileData;
    } catch (error: any) {
      logger.error('AI extraction error:', error);
      throw new Error(`Failed to extract business information: ${error.message}`);
    }
  }

  /**
   * Generate AI knowledge base from extracted data
   */
  private async generateKnowledgeBase(data: BusinessProfileData): Promise<string> {
    let knowledgeBase = '';

    if (data.business_name) {
      knowledgeBase += `# ${data.business_name}\n\n`;
    }

    if (data.description) {
      knowledgeBase += `## About\n${data.description}\n\n`;
    }

    if (data.industry) {
      knowledgeBase += `**Industry:** ${data.industry}\n\n`;
    }

    if (data.products && data.products.length > 0) {
      knowledgeBase += `## Products\n`;
      data.products.forEach((product) => {
        knowledgeBase += `### ${product.name}\n`;
        if (product.description) knowledgeBase += `${product.description}\n`;
        if (product.price) knowledgeBase += `**Price:** ${product.price}\n`;
        if (product.category) knowledgeBase += `**Category:** ${product.category}\n`;
        if (product.features && product.features.length > 0) {
          knowledgeBase += `**Features:**\n`;
          product.features.forEach(f => knowledgeBase += `- ${f}\n`);
        }
        knowledgeBase += '\n';
      });
    }

    if (data.services && data.services.length > 0) {
      knowledgeBase += `## Services\n`;
      data.services.forEach((service) => {
        knowledgeBase += `### ${service.name}\n`;
        if (service.description) knowledgeBase += `${service.description}\n`;
        if (service.pricing) knowledgeBase += `**Pricing:** ${service.pricing}\n`;
        if (service.duration) knowledgeBase += `**Duration:** ${service.duration}\n`;
        knowledgeBase += '\n';
      });
    }

    if (data.offers && data.offers.length > 0) {
      knowledgeBase += `## Current Offers & Promotions\n`;
      data.offers.forEach((offer) => {
        knowledgeBase += `### ${offer.title}\n`;
        if (offer.description) knowledgeBase += `${offer.description}\n`;
        if (offer.discount) knowledgeBase += `**Discount:** ${offer.discount}\n`;
        if (offer.validUntil) knowledgeBase += `**Valid Until:** ${offer.validUntil}\n`;
        knowledgeBase += '\n';
      });
    }

    if (data.pricing_info) {
      knowledgeBase += `## Pricing Information\n${data.pricing_info}\n\n`;
    }

    if (data.key_features && data.key_features.length > 0) {
      knowledgeBase += `## Key Features\n`;
      data.key_features.forEach((feature) => {
        knowledgeBase += `- ${feature}\n`;
      });
      knowledgeBase += '\n';
    }

    if (data.contact_info) {
      knowledgeBase += `## Contact Information\n`;
      if (data.contact_info.email) knowledgeBase += `- Email: ${data.contact_info.email}\n`;
      if (data.contact_info.phone) knowledgeBase += `- Phone: ${data.contact_info.phone}\n`;
      if (data.contact_info.address) knowledgeBase += `- Address: ${data.contact_info.address}\n`;
      knowledgeBase += '\n';
    }

    if (data.business_hours) {
      knowledgeBase += `## Business Hours\n${data.business_hours}\n\n`;
    }

    if (data.faq && data.faq.length > 0) {
      knowledgeBase += `## Frequently Asked Questions\n`;
      data.faq.forEach((faq) => {
        knowledgeBase += `\n**Q: ${faq.question}**\n`;
        knowledgeBase += `A: ${faq.answer}\n`;
      });
      knowledgeBase += '\n';
    }

    if (data.social_media) {
      const socialLinks = Object.entries(data.social_media)
        .filter(([_, url]) => url)
        .map(([platform, url]) => `- ${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${url}`);

      if (socialLinks.length > 0) {
        knowledgeBase += `## Social Media\n${socialLinks.join('\n')}\n\n`;
      }
    }

    return knowledgeBase;
  }

  /**
   * Update business profile with scraped data
   */
  private async updateBusinessProfile(
    businessProfileId: string,
    data: BusinessProfileData,
    knowledgeBase: string
  ): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.business_name) {
      updates.push('business_name = ?');
      values.push(data.business_name);
    }

    if (data.industry) {
      updates.push('industry = ?');
      values.push(data.industry);
    }

    if (data.description) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (knowledgeBase) {
      updates.push('ai_knowledge_base = ?');
      values.push(knowledgeBase);
    }

    if (updates.length === 0) {
      logger.warn('No data to update in business profile');
      return;
    }

    values.push(businessProfileId);

    await pool.query<ResultSetHeader>(
      `UPDATE business_profiles SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    logger.info(`Business profile updated: ${businessProfileId}`);
  }

  /**
   * Get business profile scraping status
   */
  async getScrapingStatus(businessProfileId: string): Promise<{
    hasKnowledgeBase: boolean;
    lastUpdated: string | null;
    businessName: string | null;
  }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT business_name, ai_knowledge_base, updated_at
       FROM business_profiles
       WHERE id = ?`,
      [businessProfileId]
    );

    if (rows.length === 0) {
      return {
        hasKnowledgeBase: false,
        lastUpdated: null,
        businessName: null,
      };
    }

    const profile = rows[0];

    return {
      hasKnowledgeBase: !!profile.ai_knowledge_base,
      lastUpdated: profile.updated_at,
      businessName: profile.business_name,
    };
  }
}

export const profileScraperService = new ProfileScraperService();
