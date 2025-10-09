import { Request, Response } from 'express';
import { profileScraperService } from '../services/ai/profile-scraper.service.js';
import logger from '../utils/logger.js';
import pool from '../config/database.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import pdfExtract from 'pdf-extraction';

/**
 * Scrape business profile from website
 */
export const scrapeProfile = async (req: Request, res: Response) => {
  try {
    const { website_url } = req.body;
    const userId = req.user?.userId;

    if (!website_url) {
      return res.status(400).json({
        success: false,
        error: 'Website URL is required',
      });
    }

    // Validate URL
    try {
      new URL(website_url);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid website URL',
      });
    }

    // Get user's business profile ID
    const businessProfileId = req.user?.businessProfileId;
    if (!businessProfileId) {
      return res.status(404).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    // Scrape website (this may take 10-30 seconds)
    const profileData = await profileScraperService.scrapeWebsite(
      website_url,
      businessProfileId
    );

    res.json({
      success: true,
      data: profileData,
      message: 'Business profile scraped successfully',
    });
  } catch (error: any) {
    logger.error('Profile scraping error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scrape business profile',
    });
  }
};

/**
 * Get scraping status (database info)
 */
export const getScrapingStatus = async (req: Request, res: Response) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    if (!businessProfileId) {
      return res.status(404).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    const status = await profileScraperService.getScrapingStatus(businessProfileId);

    res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    logger.error('Get scraping status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scraping status',
    });
  }
};

/**
 * Get real-time scraping progress
 */
export const getScrapingProgress = async (req: Request, res: Response) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    if (!businessProfileId) {
      return res.status(404).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    const progress = profileScraperService.getScrapingProgress(businessProfileId);

    if (!progress) {
      return res.json({
        success: true,
        data: {
          status: 'pending',
          currentPage: 0,
          totalPages: 0,
          message: 'No scraping in progress',
        },
      });
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    logger.error('Get scraping progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scraping progress',
    });
  }
};

/**
 * Extract text from uploaded file
 */
async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === '.pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfExtract(dataBuffer);
      return data.text || '';
    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (ext === '.txt' || ext === '.md') {
      return await fs.readFile(filePath, 'utf-8');
    }

    throw new Error(`Unsupported file type: ${ext}`);
  } catch (error: any) {
    logger.error(`Error extracting text from file ${filePath}:`, error);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
}

/**
 * Upload knowledge file (PDF, TXT, DOCX)
 */
export const uploadKnowledgeFile = async (req: Request, res: Response) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    if (!businessProfileId) {
      return res.status(404).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const file = req.file;

    // Extract text from file
    const extractedText = await extractTextFromFile(file.path, file.mimetype);

    // Get current uploaded files
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT uploaded_files, manual_knowledge FROM business_profiles WHERE id = ?',
      [businessProfileId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    const profile = rows[0];
    let uploadedFiles = profile.uploaded_files ?
      (typeof profile.uploaded_files === 'string' ? JSON.parse(profile.uploaded_files) : profile.uploaded_files) :
      [];

    // Add new file metadata
    uploadedFiles.push({
      filename: file.originalname,
      path: file.path,
      size: file.size,
      type: path.extname(file.originalname).toLowerCase(),
      uploadedAt: new Date().toISOString(),
    });

    // Append extracted text to manual knowledge
    let manualKnowledge = profile.manual_knowledge || '';
    manualKnowledge += `\n\n## From file: ${file.originalname}\n${extractedText}`;

    // Update database
    await pool.query<ResultSetHeader>(
      `UPDATE business_profiles
       SET uploaded_files = ?, manual_knowledge = ?, updated_at = NOW()
       WHERE id = ?`,
      [JSON.stringify(uploadedFiles), manualKnowledge, businessProfileId]
    );

    logger.info(`Knowledge file uploaded: ${file.originalname} for profile ${businessProfileId}`);

    res.json({
      success: true,
      message: 'File uploaded and processed successfully',
      data: {
        filename: file.originalname,
        extractedLength: extractedText.length,
      },
    });
  } catch (error: any) {
    logger.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload knowledge file',
    });
  }
};

/**
 * Add manual text knowledge
 */
export const addManualKnowledge = async (req: Request, res: Response) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    if (!businessProfileId) {
      return res.status(404).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    const { knowledge, title } = req.body;

    if (!knowledge || knowledge.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Knowledge text is required',
      });
    }

    // Get current manual knowledge
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT manual_knowledge FROM business_profiles WHERE id = ?',
      [businessProfileId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    let manualKnowledge = rows[0].manual_knowledge || '';

    // Append new knowledge with optional title
    if (title && title.trim().length > 0) {
      manualKnowledge += `\n\n## ${title}\n${knowledge}`;
    } else {
      manualKnowledge += `\n\n${knowledge}`;
    }

    // Update database
    await pool.query<ResultSetHeader>(
      'UPDATE business_profiles SET manual_knowledge = ?, updated_at = NOW() WHERE id = ?',
      [manualKnowledge, businessProfileId]
    );

    logger.info(`Manual knowledge added for profile ${businessProfileId}`);

    res.json({
      success: true,
      message: 'Knowledge added successfully',
    });
  } catch (error: any) {
    logger.error('Add manual knowledge error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add manual knowledge',
    });
  }
};

/**
 * Get combined knowledge base
 */
export const getKnowledgeBase = async (req: Request, res: Response) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    if (!businessProfileId) {
      return res.status(404).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ai_knowledge_base, manual_knowledge, uploaded_files
       FROM business_profiles WHERE id = ?`,
      [businessProfileId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Business profile not found',
      });
    }

    const profile = rows[0];

    // Combine all knowledge sources
    let combinedKnowledge = '';

    if (profile.ai_knowledge_base) {
      combinedKnowledge += '# AI Scraped Knowledge Base\n\n';
      combinedKnowledge += profile.ai_knowledge_base;
      combinedKnowledge += '\n\n---\n\n';
    }

    if (profile.manual_knowledge) {
      combinedKnowledge += '# Additional Knowledge\n\n';
      combinedKnowledge += profile.manual_knowledge;
    }

    const uploadedFiles = profile.uploaded_files ?
      (typeof profile.uploaded_files === 'string' ? JSON.parse(profile.uploaded_files) : profile.uploaded_files) :
      [];

    res.json({
      success: true,
      data: {
        combined_knowledge: combinedKnowledge,
        sources: {
          scraped: !!profile.ai_knowledge_base,
          manual: !!profile.manual_knowledge,
          files_count: uploadedFiles.length,
        },
        uploaded_files: uploadedFiles,
      },
    });
  } catch (error: any) {
    logger.error('Get knowledge base error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get knowledge base',
    });
  }
};

/**
 * Get business profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    if (!businessProfileId) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        id, business_name, industry, website, description, logo_url,
        address, phone, email, social_media, business_hours,
        products_services, faq, business_type, created_at, updated_at,
        last_scraped_at, scraping_status
       FROM business_profiles WHERE id = ?`,
      [businessProfileId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    const profile = rows[0];

    // Parse JSON fields
    if (profile.social_media && typeof profile.social_media === 'string') {
      profile.social_media = JSON.parse(profile.social_media);
    }
    if (profile.business_hours && typeof profile.business_hours === 'string') {
      profile.business_hours = JSON.parse(profile.business_hours);
    }
    if (profile.products_services && typeof profile.products_services === 'string') {
      profile.products_services = JSON.parse(profile.products_services);
    }
    if (profile.faq && typeof profile.faq === 'string') {
      profile.faq = JSON.parse(profile.faq);
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
};

/**
 * Update business profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    if (!businessProfileId) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    const allowedFields = [
      'business_name', 'industry', 'website', 'description', 'logo_url',
      'address', 'phone', 'email', 'social_media', 'business_hours',
      'products_services', 'faq', 'business_type'
    ];

    const updates: string[] = [];
    const values: any[] = [];

    // Build dynamic UPDATE query
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);

        // Stringify JSON fields
        if (['social_media', 'business_hours', 'products_services', 'faq'].includes(field)) {
          values.push(typeof req.body[field] === 'string' ? req.body[field] : JSON.stringify(req.body[field]));
        } else {
          values.push(req.body[field]);
        }
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
      });
    }

    // Add updated_at
    updates.push('updated_at = NOW()');
    values.push(businessProfileId);

    await pool.query<ResultSetHeader>(
      `UPDATE business_profiles SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    logger.info(`Profile updated for ${businessProfileId}`);

    // Return updated profile
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        id, business_name, industry, website, description, logo_url,
        address, phone, email, social_media, business_hours,
        products_services, faq, business_type, created_at, updated_at
       FROM business_profiles WHERE id = ?`,
      [businessProfileId]
    );

    const profile = rows[0];

    // Parse JSON fields
    if (profile.social_media && typeof profile.social_media === 'string') {
      profile.social_media = JSON.parse(profile.social_media);
    }
    if (profile.business_hours && typeof profile.business_hours === 'string') {
      profile.business_hours = JSON.parse(profile.business_hours);
    }
    if (profile.products_services && typeof profile.products_services === 'string') {
      profile.products_services = JSON.parse(profile.products_services);
    }
    if (profile.faq && typeof profile.faq === 'string') {
      profile.faq = JSON.parse(profile.faq);
    }

    res.json({
      success: true,
      data: profile,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
};

/**
 * Update knowledge base (edit/replace)
 */
export const updateKnowledgeBase = async (req: Request, res: Response) => {
  try {
    const businessProfileId = req.user?.businessProfileId;
    if (!businessProfileId) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    const { ai_knowledge_base, manual_knowledge } = req.body;

    if (ai_knowledge_base === undefined && manual_knowledge === undefined) {
      return res.status(400).json({
        success: false,
        error: 'At least one knowledge field must be provided',
      });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (ai_knowledge_base !== undefined) {
      updates.push('ai_knowledge_base = ?');
      values.push(ai_knowledge_base);
    }

    if (manual_knowledge !== undefined) {
      updates.push('manual_knowledge = ?');
      values.push(manual_knowledge);
    }

    updates.push('updated_at = NOW()');
    values.push(businessProfileId);

    await pool.query<ResultSetHeader>(
      `UPDATE business_profiles SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    logger.info(`Knowledge base updated for profile ${businessProfileId}`);

    res.json({
      success: true,
      message: 'Knowledge base updated successfully',
    });
  } catch (error: any) {
    logger.error('Update knowledge base error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update knowledge base',
    });
  }
};
