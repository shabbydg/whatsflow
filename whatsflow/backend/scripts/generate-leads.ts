/**
 * Script to manually generate leads from existing conversations
 */

import { leadIntelligenceService } from '../src/services/lead-intelligence.service.js';
import { query } from '../src/config/database.js';
import logger from '../src/utils/logger.js';

async function generateLeads() {
  try {
    logger.info('🚀 Starting lead generation for existing contacts...');

    // Get contacts with AI conversations
    const contacts: any = await query(`
      SELECT DISTINCT 
        c.id, 
        c.name, 
        c.phone_number,
        c.business_profile_id,
        COUNT(ac.id) as ai_conv_count
      FROM contacts c
      JOIN ai_conversations ac ON c.id = ac.contact_id
      GROUP BY c.id
      ORDER BY ai_conv_count DESC
    `);

    if (!Array.isArray(contacts) || contacts.length === 0) {
      logger.info('❌ No contacts with AI conversations found');
      return;
    }

    logger.info(`📊 Found ${contacts.length} contacts with AI conversations`);

    // Generate leads for each contact
    for (const contact of contacts) {
      logger.info(`\n🔍 Generating lead for: ${contact.name} (${contact.phone_number})`);
      logger.info(`   AI Conversations: ${contact.ai_conv_count}`);

      try {
        const leadProfile = await leadIntelligenceService.generateLeadProfile(
          contact.id,
          contact.business_profile_id
        );

        logger.info(`✅ Lead generated successfully!`);
        logger.info(`   Lead Score: ${leadProfile.lead_score}/100`);
        logger.info(`   Temperature: ${leadProfile.lead_temperature}`);
        logger.info(`   Decision Stage: ${leadProfile.decision_stage}`);
        
        if (leadProfile.company_name) {
          logger.info(`   Company: ${leadProfile.company_name}`);
        }
        if (leadProfile.conversation_summary) {
          logger.info(`   Summary: ${leadProfile.conversation_summary?.substring(0, 100)}...`);
        }
      } catch (error: any) {
        logger.error(`❌ Error generating lead for ${contact.name}: ${error.message}`);
      }
    }

    logger.info('\n🎉 Lead generation complete!');
    logger.info(`\n📍 View leads at: http://localhost:3000/leads`);
    
    process.exit(0);
  } catch (error: any) {
    logger.error('❌ Error in lead generation script:', error);
    process.exit(1);
  }
}

generateLeads();

