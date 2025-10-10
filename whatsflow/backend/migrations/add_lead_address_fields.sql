-- Migration: Add Address Fields to Lead Profiles
-- Adds comprehensive address information to lead profiles

ALTER TABLE lead_profiles
ADD COLUMN street_address VARCHAR(255) AFTER website,
ADD COLUMN city VARCHAR(100) AFTER street_address,
ADD COLUMN state_province VARCHAR(100) AFTER city,
ADD COLUMN postal_code VARCHAR(20) AFTER state_province,
ADD COLUMN country VARCHAR(100) AFTER postal_code;

-- Add index for location-based queries
ALTER TABLE lead_profiles
ADD INDEX idx_city (city),
ADD INDEX idx_country (country);

