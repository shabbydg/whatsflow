-- Update lead_dashboard view to include address fields
CREATE OR REPLACE VIEW lead_dashboard AS
SELECT 
  lp.id,
  lp.contact_id,
  lp.business_profile_id,
  
  -- Company Profile
  lp.company_name,
  lp.job_title,
  lp.industry,
  lp.team_size,
  lp.location,
  lp.email,
  lp.website,
  
  -- Address Fields (NEW)
  lp.street_address,
  lp.city,
  lp.state_province,
  lp.postal_code,
  lp.country,
  
  -- Lead Intelligence
  lp.pain_points,
  lp.interests,
  lp.intent_keywords,
  lp.budget_range,
  lp.timeline,
  lp.decision_stage,
  
  -- Scoring
  lp.lead_score,
  lp.lead_temperature,
  lp.is_qualified,
  lp.qualification_notes,
  
  -- Engagement Metrics
  lp.first_interaction_at,
  lp.last_interaction_at,
  lp.total_interactions,
  lp.avg_response_time,
  
  -- AI Insights
  lp.conversation_summary,
  lp.next_best_action,
  
  -- Assignment
  lp.assigned_to,
  lp.lead_status,
  
  -- Timestamps
  lp.created_at,
  lp.updated_at,
  
  -- Contact Information
  c.name AS contact_name,
  c.phone_number,
  c.profile_pic_url,
  c.last_message_at,
  
  -- Business
  bp.business_name,
  
  -- Computed Metrics
  (SELECT COUNT(*) FROM lead_activities la WHERE la.lead_profile_id = lp.id) AS activity_count,
  (SELECT COUNT(*) FROM messages m WHERE m.contact_id = lp.contact_id AND m.direction = 'inbound') AS messages_received,
  (SELECT COUNT(*) FROM messages m WHERE m.contact_id = lp.contact_id AND m.direction = 'outbound') AS messages_sent,
  
  -- Calculated Temperature
  CASE 
    WHEN lp.lead_score >= 70 THEN 'hot'
    WHEN lp.lead_score >= 40 THEN 'warm'
    ELSE 'cold'
  END AS calculated_temperature
  
FROM lead_profiles lp
JOIN contacts c ON lp.contact_id = c.id
JOIN business_profiles bp ON lp.business_profile_id = bp.id
ORDER BY lp.lead_score DESC, lp.updated_at DESC;

