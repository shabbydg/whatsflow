-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 15, 2025 at 03:14 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `whatsflow`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_activity_logs`
--

CREATE TABLE `admin_activity_logs` (
  `id` varchar(36) NOT NULL,
  `admin_user_id` varchar(36) NOT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(50) NOT NULL,
  `target_id` varchar(36) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` enum('super_admin','support_admin','finance_admin','read_only') NOT NULL DEFAULT 'read_only',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `email`, `password_hash`, `full_name`, `role`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
('fd9bf1e3-5291-4813-835d-ae89d1ef0e7c', 'admin@whatsflow.ai', '$2a$10$.pxIU8cZq/q1fp2UXoA1feO0g0TAYBihJIy8kztGUcWJVL.bDgBD6', 'System Administrator', 'super_admin', 1, '2025-10-11 07:56:41', '2025-10-11 07:08:01', '2025-10-11 07:56:41');

-- --------------------------------------------------------

--
-- Table structure for table `ai_conversations`
--

CREATE TABLE `ai_conversations` (
  `id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `contact_id` varchar(36) NOT NULL,
  `persona_id` varchar(36) DEFAULT NULL,
  `user_message` text DEFAULT NULL COMMENT 'The user message that prompted the AI response',
  `ai_response` text DEFAULT NULL COMMENT 'The AI-generated response',
  `input_tokens` int(11) DEFAULT 0 COMMENT 'Tokens used in the input/prompt',
  `output_tokens` int(11) DEFAULT 0 COMMENT 'Tokens used in the AI response',
  `device_id` varchar(36) DEFAULT NULL COMMENT 'WhatsApp device/connection that handled this conversation',
  `message_id` varchar(36) DEFAULT NULL COMMENT 'Reference to the original WhatsApp message that triggered the AI response',
  `role` enum('user','assistant','system') NOT NULL,
  `content` text NOT NULL,
  `tokens_used` int(11) DEFAULT 0 COMMENT 'Total tokens used (input + output) for cost tracking',
  `model` varchar(50) DEFAULT NULL COMMENT 'AI model used (e.g., gemini-2.5-flash, claude-3-5-haiku)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ai_conversations`
--

INSERT INTO `ai_conversations` (`id`, `business_profile_id`, `contact_id`, `persona_id`, `user_message`, `ai_response`, `input_tokens`, `output_tokens`, `device_id`, `message_id`, `role`, `content`, `tokens_used`, `model`, `created_at`) VALUES
('15b73948-9748-4239-9f2f-71ff644cb5c9', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'e0516fde-a358-11f0-aaa1-6ed35d08214f', 'Yes rinnai brand', 'Great! Let me check our *Rinnai single burner* models for you.\n\nI apologize, but after carefully reviewing our product catalog, it seems M Abdulally currently stocks *two-burner* Rinnai models like the `RT-902MM(G)` and `GF-216K`, but not single burner options.\n\nWould you be interested in seeing our *two-burner* gas cookers? They\'re compact and efficient.', 1245, 105, 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '4262e980-650b-42e4-ba31-f02feae2c712', 'assistant', 'Great! Let me check our *Rinnai single burner* models for you.\n\nI apologize, but after carefully reviewing our product catalog, it seems M Abdulally currently stocks *two-burner* Rinnai models like the `RT-902MM(G)` and `GF-216K`, but not single burner options.\n\nWould you be interested in seeing our *two-burner* gas cookers? They\'re compact and efficient.', 1350, 'claude-3-5-haiku-20241022', '2025-10-09 07:09:02'),
('17f242e5-cb67-4f79-add3-5dd5d2d9c787', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'e0516fde-a358-11f0-aaa1-6ed35d08214f', 'Single burner', '', 1205, 0, 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '93e644e8-ed5b-45fb-94d5-7033c8a53f97', 'assistant', '', 1205, 'gemini-1.5-flash-latest', '2025-10-09 07:08:19'),
('21a5a368-f162-45e8-8af3-982b3f3184d3', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'efa79058-f38d-4145-a0d1-1d284ee883b6', 'e0516fde-a358-11f0-aaa1-6ed35d08214f', 'This appears to be a bank deposit slip or banking form from a Commercial Bank. The form is printed in green ink and has various fields for recording transaction details. There\'s what looks like a \"PAID\" or validation stamp marked on the form in black ink. The form includes sections for recording deposits, reference numbers, and other banking information. Some numbers appear to be handwritten on the form in blue ink. The form appears to be a standard banking document used for recording financial transactions or deposits.', '', 1175, 0, 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'dad87012-8f40-4b29-8266-716010138eab', 'assistant', '', 1175, 'gemini-1.5-flash-latest', '2025-10-10 07:07:15'),
('31b4b54b-abc3-49db-85b8-9ca30a27a464', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '8008e36f-98a5-4078-a21c-bdb22bc5bb58', 'e0516fde-a358-11f0-aaa1-6ed35d08214f', '603 cooker price?', 'I apologize, but I cannot find a specific product model \"603\" in our current product catalog. Our current gas cooker models include:\n\n1. Two Burner with Glass Top RT-902MM(G) - Price: රු47,200.00\n2. GF-216K Two Burner Gas Cooker - Price: රු52,510.00\n\nWould you like more information about these models? Or could you confirm the exact model number you\'re interested in? I\'m here to help you find the right product.', 1138, 119, 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'e9853628-866e-4d3f-82f7-417152139ff8', 'assistant', 'I apologize, but I cannot find a specific product model \"603\" in our current product catalog. Our current gas cooker models include:\n\n1. Two Burner with Glass Top RT-902MM(G) - Price: රු47,200.00\n2. GF-216K Two Burner Gas Cooker - Price: රු52,510.00\n\nWould you like more information about these models? Or could you confirm the exact model number you\'re interested in? I\'m here to help you find the right product.', 1257, 'claude-3-5-haiku-20241022', '2025-10-09 06:52:17'),
('3fadd8be-9330-45e6-9521-54f661cb9d54', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'e0516fde-a358-11f0-aaa1-6ed35d08214f', 'User sent a voice note (transcription not available - please ask them to send text)', 'I apologize, but I\'m unable to process voice notes at the moment. Could you please type out your message? I\'m here to help you find the *perfect kitchen appliance* or *gas equipment* for your needs!', 1129, 47, 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'af3ee0af-0348-48e4-a878-c58dcf66134a', 'assistant', 'I apologize, but I\'m unable to process voice notes at the moment. Could you please type out your message? I\'m here to help you find the *perfect kitchen appliance* or *gas equipment* for your needs!', 1176, 'gemini-1.5-flash-latest', '2025-10-09 07:02:35'),
('43efdb80-7a53-4ae7-a2a7-436ffc54fbac', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '8008e36f-98a5-4078-a21c-bdb22bc5bb58', 'e0516fde-a358-11f0-aaa1-6ed35d08214f', 'Hi. Can you tell me aboyt your products?', 'Hello! I\'d be happy to tell you about our products. M Abdulally specializes in Rinnai branded kitchen appliances and gas equipment. We offer a range of products including:\n\n1. Table Top Cookers:\n- Two Burner with Glass Top RT-902MM(G)\n- GF-216K Two Burner Gas Cooker\n\n2. Water Heaters:\n- Pearl 450P Electric Instant Water Heater\n- REU-VCM2837FFC-GEN Gas Powered Water Heater\n\nWould you like more details about any specific type of appliance? I can help you find the right product for your needs.', 880, 153, 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3b623319-c728-4aec-9eac-8a6ab80e6ede', 'assistant', 'Hello! I\'d be happy to tell you about our products. M Abdulally specializes in Rinnai branded kitchen appliances and gas equipment. We offer a range of products including:\n\n1. Table Top Cookers:\n- Two Burner with Glass Top RT-902MM(G)\n- GF-216K Two Burner Gas Cooker\n\n2. Water Heaters:\n- Pearl 450P Electric Instant Water Heater\n- REU-VCM2837FFC-GEN Gas Powered Water Heater\n\nWould you like more details about any specific type of appliance? I can help you find the right product for your needs.', 1033, 'claude-3-5-haiku-20241022', '2025-10-09 06:51:26'),
('72299fe6-5c48-48c4-a1cf-a64ebf755491', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'e0516fde-a358-11f0-aaa1-6ed35d08214f', 'Yes I want information about a Rinnai double burner', 'Great! We have several two-burner gas cooker options from Rinnai. Let me share details about three models:\n\n1. RT-902MM(G) Two Burner with Glass Top\n- Price: රු47,200.00\n- Features: Glass top design, modern look\n\n2. GF-216K Two Burner Gas Cooker\n- Price: රු52,510.00\n- Standard model with reliable performance\n\n3. RI-524E Two Burner Gas Cooker with Grill\n- Price: රු33,040.00\n- Includes additional grill functionality\n\nWould you like more specific details about any of these models? I can help you understand their features and which might best suit your kitchen needs.', 876, 170, NULL, NULL, 'assistant', 'Great! We have several two-burner gas cooker options from Rinnai. Let me share details about three models:\n\n1. RT-902MM(G) Two Burner with Glass Top\n- Price: රු47,200.00\n- Features: Glass top design, modern look\n\n2. GF-216K Two Burner Gas Cooker\n- Price: රු52,510.00\n- Standard model with reliable performance\n\n3. RI-524E Two Burner Gas Cooker with Grill\n- Price: රු33,040.00\n- Includes additional grill functionality\n\nWould you like more specific details about any of these models? I can help you understand their features and which might best suit your kitchen needs.', 1046, NULL, '2025-10-09 04:38:07'),
('7d0f8026-4667-4a36-b59b-70b37adaa782', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'e0516fde-a358-11f0-aaa1-6ed35d08214f', 'Sorry?', '*Single burner* gas cookers are available! I\'ll help you find the right one.\n\nWould you prefer to know about our *most affordable* single burner options? I can share pricing and details.', 1237, 47, 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '73de5300-69bc-47be-9b1c-5f4ae2a9ad25', 'assistant', '*Single burner* gas cookers are available! I\'ll help you find the right one.\n\nWould you prefer to know about our *most affordable* single burner options? I can share pricing and details.', 1284, 'claude-3-5-haiku-20241022', '2025-10-09 07:08:36'),
('8e9faad2-d571-4995-bd47-5cd7a2df763f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'e0516fde-a358-11f0-aaa1-6ed35d08214f', 'Can I see pictures of each?', 'I apologize, but I cannot actually show you pictures directly. As a sales representative, I can describe the products in detail, but image sharing isn\'t possible in this conversation. \n\nHowever, I recommend a few ways you can see the product images:\n1. Visit M Abdulally\'s showroom\n2. Check their Instagram page\n3. Contact their sales team directly for product brochures\n\nWould you like me to describe the appearance of the two-burner models in more detail? I can tell you about their design, color, and key visual features.', 1034, 122, NULL, NULL, 'assistant', 'I apologize, but I cannot actually show you pictures directly. As a sales representative, I can describe the products in detail, but image sharing isn\'t possible in this conversation. \n\nHowever, I recommend a few ways you can see the product images:\n1. Visit M Abdulally\'s showroom\n2. Check their Instagram page\n3. Contact their sales team directly for product brochures\n\nWould you like me to describe the appearance of the two-burner models in more detail? I can tell you about their design, color, and key visual features.', 1156, NULL, '2025-10-09 04:38:53'),
('a6899722-ccdc-4222-93f2-04fb8c32ac6f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '8008e36f-98a5-4078-a21c-bdb22bc5bb58', 'e0516fde-a358-11f0-aaa1-6ed35d08214f', '603?', 'I apologize, but I\'m not sure what you mean by \"603\". Could you please clarify? Are you asking about a specific product model or looking for more information? \n\nI\'d be happy to help you if you can provide more details. Are you interested in a particular type of appliance like a gas cooker, water heater, or something else? Please let me know, and I\'ll assist you with the most accurate information.', 1029, 95, 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '96a91ddf-2a71-4972-8104-e716c013cf3d', 'assistant', 'I apologize, but I\'m not sure what you mean by \"603\". Could you please clarify? Are you asking about a specific product model or looking for more information? \n\nI\'d be happy to help you if you can provide more details. Are you interested in a particular type of appliance like a gas cooker, water heater, or something else? Please let me know, and I\'ll assist you with the most accurate information.', 1124, 'claude-3-5-haiku-20241022', '2025-10-09 06:51:52'),
('ab4c1b5a-10ca-4496-a781-5ae372f0d22e', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'efa79058-f38d-4145-a0d1-1d284ee883b6', 'e0516fde-a358-11f0-aaa1-6ed35d08214f', 'This image shows an invoice header or address section for a company called \"JETWING KADURUKETHA (PVT) LTD\" located at \"Jetwing House, 46/28 Navam Mawatha, Colombo 02\" in Sri Lanka. The VAT number shown is 174890013-7000. The text appears to be displayed on a grayish background, possibly a computer screen or document.', 'Hello! Welcome to M. Abdulally.\n\nHow can I assist you today with your kitchen or home appliance needs?', 1168, 24, 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'f89f3d55-a999-4f78-8a3b-d1d31357c8e2', 'assistant', 'Hello! Welcome to M. Abdulally.\n\nHow can I assist you today with your kitchen or home appliance needs?', 1192, 'gemini-1.5-flash-latest', '2025-10-10 07:18:22'),
('b1f9b423-939e-450a-9993-521cb0730b13', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'e0516fde-a358-11f0-aaa1-6ed35d08214f', 'Hi, I wanted to get some information on what M Abdulally does', 'Hello! M Abdulally is a 75-year-old family-owned business in Sri Lanka that specializes in kitchen appliances and gas products. We started as coffee roasters and have been an authorized Rinnai dealer since 1975, offering a wide range of home and commercial kitchen appliances like gas cookers, water heaters, and more. \n\nIs there a specific type of product you\'re interested in learning more about? I\'d be happy to provide more details about our product range.', 759, 110, NULL, NULL, 'assistant', 'Hello! M Abdulally is a 75-year-old family-owned business in Sri Lanka that specializes in kitchen appliances and gas products. We started as coffee roasters and have been an authorized Rinnai dealer since 1975, offering a wide range of home and commercial kitchen appliances like gas cookers, water heaters, and more. \n\nIs there a specific type of product you\'re interested in learning more about? I\'d be happy to provide more details about our product range.', 869, NULL, '2025-10-09 04:37:04'),
('e589c1fa-2d93-487e-a9c0-106791a15fae', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'e0516fde-a358-11f0-aaa1-6ed35d08214f', 'Mata one gas cooker', 'Ah, you\'re looking for a *gas cooker*! Excellent choice.\n\nFor your home, are you looking for a *two-burner* model?', 1171, 33, 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '17420b89-64d4-48a2-8adc-962785bcf3e1', 'assistant', 'Ah, you\'re looking for a *gas cooker*! Excellent choice.\n\nFor your home, are you looking for a *two-burner* model?', 1204, 'gemini-1.5-flash-latest', '2025-10-09 07:07:58'),
('f3f9ae60-fde6-4f24-acfd-3f9a154fd088', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '8008e36f-98a5-4078-a21c-bdb22bc5bb58', 'e0516fde-a358-11f0-aaa1-6ed35d08214f', '603e', 'I apologize, but I cannot find a specific model \"603e\" in our current product catalog. Our current gas cooker models include:\n\n1. Two Burner with Glass Top RT-902MM(G) - Price: රු47,200.00\n2. GF-216K Two Burner Gas Cooker - Price: රු52,510.00\n\nCould you please confirm the exact model number or provide more details about the cooker you\'re interested in? I\'d be happy to help you find the right product or get the precise information you need.', 1259, 126, 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'edd2e99d-9b15-43a6-9672-b56c63281acd', 'assistant', 'I apologize, but I cannot find a specific model \"603e\" in our current product catalog. Our current gas cooker models include:\n\n1. Two Burner with Glass Top RT-902MM(G) - Price: රු47,200.00\n2. GF-216K Two Burner Gas Cooker - Price: රු52,510.00\n\nCould you please confirm the exact model number or provide more details about the cooker you\'re interested in? I\'d be happy to help you find the right product or get the precise information you need.', 1385, 'claude-3-5-haiku-20241022', '2025-10-09 06:52:44');

-- --------------------------------------------------------

--
-- Table structure for table `api_keys`
--

CREATE TABLE `api_keys` (
  `id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `key_hash` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `scopes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of permission scopes' CHECK (json_valid(`scopes`)),
  `rate_limit_tier` varchar(20) DEFAULT 'standard' COMMENT 'Rate limit tier for this key',
  `environment` varchar(10) DEFAULT 'live' COMMENT 'live or test',
  `requests_count` int(11) DEFAULT 0 COMMENT 'Total requests made with this key',
  `last_request_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `api_request_logs`
--

CREATE TABLE `api_request_logs` (
  `id` varchar(36) NOT NULL,
  `api_key_id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `endpoint` varchar(255) NOT NULL,
  `method` varchar(10) NOT NULL,
  `status_code` int(11) DEFAULT NULL,
  `response_time_ms` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `request_body` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`request_body`)),
  `response_body` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`response_body`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `broadcasts`
--

CREATE TABLE `broadcasts` (
  `id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `device_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `message_content` text NOT NULL,
  `message_type` enum('text','image','file','location') DEFAULT 'text',
  `media_url` varchar(500) DEFAULT NULL,
  `status` enum('draft','scheduled','sending','completed','failed','cancelled') DEFAULT 'draft',
  `send_speed` enum('slow','normal','fast','custom') DEFAULT 'normal',
  `custom_delay` int(11) DEFAULT NULL COMMENT 'Delay in seconds (for custom speed)',
  `total_recipients` int(11) DEFAULT 0,
  `sent_count` int(11) DEFAULT 0,
  `delivered_count` int(11) DEFAULT 0,
  `failed_count` int(11) DEFAULT 0,
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `broadcasts`
--

INSERT INTO `broadcasts` (`id`, `business_profile_id`, `device_id`, `name`, `message_content`, `message_type`, `media_url`, `status`, `send_speed`, `custom_delay`, `total_recipients`, `sent_count`, `delivered_count`, `failed_count`, `scheduled_at`, `started_at`, `completed_at`, `created_at`, `updated_at`) VALUES
('04048099-a16c-4997-8d70-60dd53ea03db', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'Testing the 1st Broadcast', 'Hello [full_name], how are you?', 'text', NULL, 'completed', 'slow', NULL, 3, 3, 0, 0, NULL, '2025-10-09 11:04:43', '2025-10-09 11:06:42', '2025-10-09 11:04:38', '2025-10-09 11:06:42');

-- --------------------------------------------------------

--
-- Table structure for table `broadcast_contact_lists`
--

CREATE TABLE `broadcast_contact_lists` (
  `id` varchar(36) NOT NULL,
  `broadcast_id` varchar(36) NOT NULL,
  `list_id` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `broadcast_contact_lists`
--

INSERT INTO `broadcast_contact_lists` (`id`, `broadcast_id`, `list_id`, `created_at`) VALUES
('9d8849bf-638b-40ec-8ee3-2a120b25df3a', '04048099-a16c-4997-8d70-60dd53ea03db', '3ad7964f-1ebd-41cf-aefb-f2ef961c75ec', '2025-10-09 11:04:38');

-- --------------------------------------------------------

--
-- Table structure for table `broadcast_recipients`
--

CREATE TABLE `broadcast_recipients` (
  `id` varchar(36) NOT NULL,
  `broadcast_id` varchar(36) NOT NULL,
  `contact_id` varchar(36) DEFAULT NULL,
  `phone_number` varchar(50) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `personalized_message` text DEFAULT NULL,
  `status` enum('pending','queued','sending','sent','delivered','failed','skipped') DEFAULT 'pending',
  `message_id` varchar(36) DEFAULT NULL COMMENT 'Reference to messages table',
  `error_message` text DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `broadcast_recipients`
--

INSERT INTO `broadcast_recipients` (`id`, `broadcast_id`, `contact_id`, `phone_number`, `full_name`, `personalized_message`, `status`, `message_id`, `error_message`, `sent_at`, `delivered_at`, `created_at`, `updated_at`) VALUES
('b8db71f5-a02a-408c-8888-4f22306b80fe', '04048099-a16c-4997-8d70-60dd53ea03db', NULL, '+94775999821', 'Sakina', 'Hello Sakina, how are you?', 'sent', 'd1c2b560-4956-4d2d-9b60-fe4e7d5bcad2', NULL, '2025-10-09 11:05:42', NULL, '2025-10-09 11:04:38', '2025-10-09 11:05:42'),
('c1156e0c-b821-47ca-9435-4e2e08636e60', '04048099-a16c-4997-8d70-60dd53ea03db', NULL, '+94764760453', 'Pops', 'Hello Pops, how are you?', 'sent', 'c380cedc-9356-4419-8ac3-31ebcb2c9979', NULL, '2025-10-09 11:06:12', NULL, '2025-10-09 11:04:38', '2025-10-09 11:06:12'),
('d6be987b-c327-4d30-bef1-169b1001bb12', '04048099-a16c-4997-8d70-60dd53ea03db', NULL, '94714515253', 'Shabbir Test', 'Hello Shabbir Test, how are you?', 'sent', '4b426d69-d95a-4c4c-80bf-2be53ab6812f', NULL, '2025-10-09 11:06:42', NULL, '2025-10-09 11:04:38', '2025-10-09 11:06:42');

-- --------------------------------------------------------

--
-- Table structure for table `business_profiles`
--

CREATE TABLE `business_profiles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `website` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `social_media` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`social_media`)),
  `business_hours` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`business_hours`)),
  `products_services` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`products_services`)),
  `faq` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`faq`)),
  `ai_knowledge_base` text DEFAULT NULL,
  `manual_knowledge` text DEFAULT NULL,
  `uploaded_files` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`uploaded_files`)),
  `last_scraped_at` timestamp NULL DEFAULT NULL,
  `business_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `scraping_status` enum('pending','in_progress','completed','failed') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `business_profiles`
--

INSERT INTO `business_profiles` (`id`, `user_id`, `business_name`, `industry`, `website`, `description`, `logo_url`, `address`, `phone`, `email`, `social_media`, `business_hours`, `products_services`, `faq`, `ai_knowledge_base`, `manual_knowledge`, `uploaded_files`, `last_scraped_at`, `business_type`, `created_at`, `updated_at`, `scraping_status`) VALUES
('ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '5a219cf1-44de-4377-904a-9568bcf0a8e9', 'M. Abdulally', 'Kitchen Appliances and Home Products', 'https://mabdulally.lk', 'M Abdulally is a 75-year-old family-owned business in Sri Lanka that specializes in Rinnai branded gas appliances and kitchen equipment. Originally starting as coffee roasters, they introduced Rinnai gas appliances to the market in 1975 and have since become a leading supplier of home and commercial kitchen appliances across Sri Lanka.', NULL, '81, Old Moor Street, Colombo 12', '+94766767674', 'info@mabdulally.lk', 'null', 'null', 'null', 'null', '# M. Abdulally\n\n## About\nM Abdulally is a 75-year-old family-owned business in Sri Lanka that specializes in Rinnai branded gas appliances and kitchen equipment. Originally starting as coffee roasters, they introduced Rinnai gas appliances to the market in 1975 and have since become a leading supplier of home and commercial kitchen appliances across Sri Lanka.\n\n**Industry:** Kitchen Appliances and Home Products\n\n## Products\n### Two Burner with Glass Top RT-902MM(G)\n**Price:** රු47,200.00\n**Category:** TABLE TOP COOKERS\n\n### GF-216K Two Burner Gas Cooker\n**Price:** රු52,510.00\n**Category:** TABLE TOP COOKERS\n\n### Pearl 450P Electric Instant Water Heater\n**Price:** රු54,870.00\n**Category:** ELECTRIC WATER HEATERS\n\n### REU-VCM2837FFC-GEN Heavy Duty Gas Powered Water Heaters (Internal)\n**Price:** රු330,400.00\n**Category:** GAS WATER HEATERS\n**Features:**\n- Installation: Internal\n- Heavy Duty\n\n## Key Features\n- Wide range of gas cookers and water heaters\n- Both home and commercial kitchen appliances\n- Authorized Rinnai dealer since 1975\n- 75+ years of business experience\n- Installment payment options available\n\n## Frequently Asked Questions\n\n**Q: What types of products do you sell?**\nA: The company sells various kitchen appliances including table top cookers, built-in hobs, water heaters, deep fryers, and other gas appliances.\n\n## Social Media\n- Instagram: https://www.instagram.com/mabdulally.lk/\n\n', '\n\n## Warranty\nAll gas cookers come with one year warranty on ignition switches. For all other issues, our company has all parts available in-house, ensuring fast repairs and services.', NULL, '2025-10-09 08:39:40', 'ecommerce, retail', '2025-10-06 10:29:45', '2025-10-09 08:39:40', 'completed');

-- --------------------------------------------------------

--
-- Table structure for table `campaigns`
--

CREATE TABLE `campaigns` (
  `id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `message_content` text NOT NULL,
  `media_url` varchar(500) DEFAULT NULL,
  `target_type` varchar(20) NOT NULL,
  `target_tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`target_tags`)),
  `status` varchar(20) DEFAULT 'draft',
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `total_recipients` int(11) DEFAULT 0,
  `sent_count` int(11) DEFAULT 0,
  `delivered_count` int(11) DEFAULT 0,
  `read_count` int(11) DEFAULT 0,
  `failed_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `campaign_recipients`
--

CREATE TABLE `campaign_recipients` (
  `id` varchar(36) NOT NULL,
  `campaign_id` varchar(36) NOT NULL,
  `contact_id` varchar(36) NOT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `sent_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `last_device_id` varchar(36) DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `profile_pic_url` varchar(500) DEFAULT NULL,
  `is_business` tinyint(1) DEFAULT 0,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `lead_profile_id` varchar(36) DEFAULT NULL,
  `first_message_at` timestamp NULL DEFAULT NULL,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `total_messages` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `business_profile_id`, `last_device_id`, `phone_number`, `name`, `profile_pic_url`, `is_business`, `metadata`, `lead_profile_id`, `first_message_at`, `last_message_at`, `total_messages`, `created_at`, `updated_at`) VALUES
('069260cf-5452-4b44-8833-1d044c145c72', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '94764760453', '94764760453', NULL, 0, NULL, '013df3b0-fabf-4f9e-88f3-4400d8c5a738', '2025-10-08 16:06:54', '2025-10-09 07:09:17', 17, '2025-10-08 16:06:54', '2025-10-09 12:26:09'),
('099427db-0ece-4b53-a1e1-268658d9109d', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '38293995565155', '38293995565155', NULL, 0, NULL, NULL, '2025-10-09 09:24:23', '2025-10-10 09:58:38', 5, '2025-10-09 09:24:23', '2025-10-10 09:58:38'),
('0de5e399-c07f-4ae3-8638-9cea7eeb8ca6', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94777125152', '94777125152', NULL, 0, NULL, NULL, '2025-10-10 07:40:28', '2025-10-10 07:40:28', 1, '2025-10-10 07:40:28', '2025-10-10 07:40:28'),
('18fd539e-2ae7-4f06-8070-a6d705101ec5', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '241518963126319', '241518963126319', NULL, 0, NULL, NULL, '2025-10-10 05:06:27', '2025-10-10 09:38:49', 5, '2025-10-10 05:06:27', '2025-10-10 09:38:49'),
('1d55adfd-0166-4843-9557-9bd6aa5e4b00', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '120435547095117@lid', '120435547095117@lid', NULL, 0, NULL, NULL, '2025-10-08 09:12:05', '2025-10-08 09:12:05', 1, '2025-10-08 09:12:05', '2025-10-08 09:12:05'),
('26445b49-3956-4511-b656-e593f4a4c184', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '+94775999821', NULL, NULL, 0, NULL, NULL, NULL, '2025-10-09 11:05:42', 1, '2025-10-09 11:05:42', '2025-10-09 11:05:42'),
('274e25a9-bfe9-444b-bcad-45bbda4aeed9', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94771087474', '94771087474', NULL, 0, NULL, NULL, '2025-10-09 08:58:30', '2025-10-09 10:15:10', 11, '2025-10-09 08:58:30', '2025-10-09 10:15:10'),
('2d825db2-370f-4fc9-933f-0ff545d745ad', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94766767674', '94766767674', NULL, 0, NULL, NULL, '2025-10-09 09:24:23', '2025-10-10 07:17:05', 2, '2025-10-09 09:24:23', '2025-10-10 07:17:05'),
('321f341d-4337-492e-b9aa-6e43ce25c8bc', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '154163673595964', '154163673595964', NULL, 0, NULL, NULL, '2025-10-10 07:33:11', '2025-10-10 07:33:11', 1, '2025-10-10 07:33:11', '2025-10-10 07:33:11'),
('38e720fc-996e-488c-b8b7-c6307da3af88', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94775999821', '94775999821', NULL, 0, NULL, 'b08a057b-018f-4ad0-b091-e69b4ae2d564', '2025-10-08 15:08:56', '2025-10-10 09:28:27', 110, '2025-10-08 15:08:56', '2025-10-10 09:28:27'),
('39bd3957-aeb8-4288-a4f6-79c371bf99a4', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94705310832', '94705310832', NULL, 0, NULL, NULL, '2025-10-09 05:13:54', '2025-10-09 05:19:29', 6, '2025-10-09 05:13:54', '2025-10-09 05:19:29'),
('3e6082ac-5cab-48ac-acc5-d3778f02ddc6', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '50981362511985@lid', '50981362511985@lid', NULL, 0, NULL, NULL, '2025-10-08 08:18:37', '2025-10-08 09:12:05', 2, '2025-10-08 08:18:37', '2025-10-08 09:12:05'),
('40389e3c-fb94-40b7-ad54-c4e65354a1e0', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94777310921', '94777310921', NULL, 0, NULL, NULL, '2025-10-08 16:21:30', '2025-10-08 16:54:49', 4, '2025-10-08 16:21:30', '2025-10-08 16:54:49'),
('42f78da9-0b01-4068-8275-d67b46d9b657', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '971581245353', '971581245353', NULL, 0, NULL, NULL, '2025-10-07 07:23:34', '2025-10-08 10:01:45', 4, '2025-10-07 07:23:34', '2025-10-08 10:01:45'),
('443de1e4-2015-435f-91e1-c1b8fa8c0b44', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '196524919247084', '196524919247084', NULL, 0, NULL, NULL, '2025-10-09 05:01:48', '2025-10-09 05:01:49', 2, '2025-10-09 05:01:48', '2025-10-09 05:01:49'),
('44f07772-8bad-45bb-85a9-373786c121f5', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94777352907', '94777352907', NULL, 0, NULL, NULL, '2025-10-09 05:01:28', '2025-10-09 09:00:35', 10, '2025-10-09 05:01:28', '2025-10-09 09:00:35'),
('4e9ce6dd-e84c-4d44-a682-4bcadf2200a5', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '+94764760453', NULL, NULL, 0, NULL, NULL, NULL, '2025-10-09 11:06:12', 1, '2025-10-09 11:06:12', '2025-10-09 11:06:12'),
('52d5ed55-29d1-4487-b52c-6db26827412a', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94771630352', '94771630352', NULL, 0, NULL, NULL, '2025-10-09 05:01:28', '2025-10-09 05:01:43', 2, '2025-10-09 05:01:28', '2025-10-09 05:01:43'),
('52e09fba-cff9-4253-94c7-16ef9740f24c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '161001227952251', '161001227952251', NULL, 0, NULL, NULL, '2025-10-09 05:01:49', '2025-10-09 05:01:49', 1, '2025-10-09 05:01:49', '2025-10-09 05:01:49'),
('54610f0d-117a-45bd-817c-d500b130422c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '185718764736533', '185718764736533', NULL, 0, NULL, NULL, '2025-10-09 12:26:43', '2025-10-09 12:26:43', 1, '2025-10-09 12:26:43', '2025-10-09 12:26:43'),
('5764271e-6a62-4f0b-9fdc-9464ee6898ca', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94773577700', '94773577700', NULL, 0, NULL, NULL, '2025-10-08 10:38:58', '2025-10-08 10:38:58', 1, '2025-10-08 10:38:58', '2025-10-08 10:38:58'),
('5885a3e4-b09d-45ca-9a8a-e48a79e99e78', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '37370577567922', '37370577567922', NULL, 0, NULL, NULL, '2025-10-09 07:42:51', '2025-10-09 07:42:51', 1, '2025-10-09 07:42:51', '2025-10-09 07:42:51'),
('59056ebc-9f69-423f-b78f-53c4d812b5da', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '38530302636173', '38530302636173', NULL, 0, NULL, NULL, '2025-10-09 07:43:35', '2025-10-09 07:43:48', 5, '2025-10-09 07:43:35', '2025-10-09 07:43:48'),
('669fb7c7-8c2f-4d4a-924b-e06d639408de', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '94714515253', '94714515253', NULL, 0, NULL, NULL, '2025-10-08 09:12:53', '2025-10-10 07:55:16', 6, '2025-10-08 09:12:53', '2025-10-10 07:55:16'),
('74342c9a-06c8-400a-93ff-ee5b303fb987', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94771606604', '94771606604', NULL, 0, NULL, NULL, '2025-10-08 09:27:45', '2025-10-09 12:26:36', 18, '2025-10-08 09:27:45', '2025-10-09 12:26:36'),
('7973f819-8943-4477-89c8-106c1980c7e2', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94777072472', '94777072472', NULL, 0, NULL, NULL, '2025-10-09 07:48:10', '2025-10-10 06:48:43', 15, '2025-10-09 07:48:10', '2025-10-10 06:48:43'),
('8008e36f-98a5-4078-a21c-bdb22bc5bb58', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '94771120673', '94771120673', NULL, 0, NULL, 'f663620e-cad5-491f-9086-bf72875e12d5', '2025-10-09 06:50:35', '2025-10-09 06:52:49', 9, '2025-10-09 06:50:35', '2025-10-09 12:26:11'),
('819d5a8c-ad22-4de9-a667-81bd65edff8d', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '275715559788747', '275715559788747', NULL, 0, NULL, NULL, '2025-10-08 17:58:21', '2025-10-08 17:58:21', 1, '2025-10-08 17:58:21', '2025-10-08 17:58:21'),
('8229145e-4105-4712-b37c-3c811d5dda87', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94775296221', '94775296221', NULL, 0, NULL, NULL, '2025-10-09 05:01:28', '2025-10-09 05:01:48', 4, '2025-10-09 05:01:28', '2025-10-09 05:01:48'),
('9546e5ce-767b-4289-9278-2c63403a82b3', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '120435547095117', '120435547095117', NULL, 0, NULL, NULL, '2025-10-08 12:02:21', '2025-10-08 15:06:13', 5, '2025-10-08 12:02:21', '2025-10-08 15:06:13'),
('9a1e7c88-2ddf-4df2-ada3-481f9f2e4555', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94777315338', '94777315338', NULL, 0, NULL, NULL, '2025-10-09 11:31:15', '2025-10-09 11:47:03', 2, '2025-10-09 11:31:15', '2025-10-09 11:47:03'),
('9ed5d629-a589-40b2-bcdb-306ed6af4863', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '203719526379723@lid', '203719526379723@lid', NULL, 0, NULL, NULL, '2025-10-08 09:42:49', '2025-10-08 09:42:52', 3, '2025-10-08 09:42:49', '2025-10-08 09:42:52'),
('ba107c0b-c214-4879-85a8-8a1090eaa352', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94777965255', '94777965255', NULL, 0, NULL, NULL, '2025-10-08 01:33:07', '2025-10-10 07:55:16', 13, '2025-10-08 01:33:07', '2025-10-10 07:55:16'),
('bbde3b33-de57-48e2-be5e-94e7d6c88c01', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94773833911', '94773833911', NULL, 0, NULL, NULL, '2025-10-09 07:42:34', '2025-10-09 08:33:10', 8, '2025-10-09 07:42:34', '2025-10-09 08:33:10'),
('bea5d549-9fdb-496b-96bc-da445d3a3f39', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '128204824137908', '128204824137908', NULL, 0, NULL, NULL, '2025-10-09 05:01:48', '2025-10-09 05:01:48', 1, '2025-10-09 05:01:48', '2025-10-09 05:01:48'),
('c32f6237-44d0-4ff6-9d86-a2dcde381268', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '50981362511985', '50981362511985', NULL, 0, NULL, NULL, '2025-10-08 12:02:14', '2025-10-09 08:27:04', 7, '2025-10-08 12:02:14', '2025-10-09 08:27:04'),
('c8854b03-c8bd-4684-891d-1c54a26843d8', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '269492135411761', '269492135411761', NULL, 0, NULL, NULL, '2025-10-10 07:56:40', '2025-10-10 07:56:40', 1, '2025-10-10 07:56:40', '2025-10-10 07:56:40'),
('d69ec9aa-a93d-4b1c-b4b4-1e0188df64a3', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94779444684', '94779444684', NULL, 0, NULL, NULL, '2025-10-09 06:50:41', '2025-10-09 08:12:42', 10, '2025-10-09 06:50:41', '2025-10-09 08:12:42'),
('d6d9b769-905c-4f0b-afa7-18c729a0a71e', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94777340952', '94777340952', NULL, 0, NULL, NULL, '2025-10-09 10:41:33', '2025-10-09 10:41:37', 2, '2025-10-09 10:41:33', '2025-10-09 10:41:37'),
('d7eaa20f-10a6-47a7-b719-bc4ba966d579', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '273387737870386@lid', '273387737870386@lid', NULL, 0, NULL, NULL, '2025-10-08 10:39:09', '2025-10-08 10:39:09', 1, '2025-10-08 10:39:09', '2025-10-08 10:39:09'),
('db978d6a-7c2f-4883-a016-52f46a8afa3f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94779104198', '94779104198', NULL, 0, NULL, NULL, '2025-10-09 07:47:55', '2025-10-09 09:29:46', 27, '2025-10-09 07:47:55', '2025-10-09 09:29:46'),
('dd0aac7b-7439-4dcf-b26a-248f026aed6c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94773871282', '94773871282', NULL, 0, NULL, NULL, '2025-10-10 05:15:34', '2025-10-10 05:16:30', 5, '2025-10-10 05:15:34', '2025-10-10 05:16:30'),
('e59fd553-a467-456a-a672-982d350f47a2', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '94775152151', '94775152151', NULL, 0, NULL, NULL, '2025-10-10 07:28:35', '2025-10-10 07:28:35', 1, '2025-10-10 07:28:35', '2025-10-10 07:28:35'),
('efa79058-f38d-4145-a0d1-1d284ee883b6', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '94707891683', '94707891683', NULL, 0, NULL, NULL, '2025-10-10 07:07:03', '2025-10-10 07:18:30', 6, '2025-10-10 07:07:03', '2025-10-10 07:18:30'),
('fb6b2854-8ea9-4c26-92e9-3027ec3488d1', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '186904108646614', '186904108646614', NULL, 0, NULL, NULL, '2025-10-09 11:31:14', '2025-10-10 10:14:02', 2, '2025-10-09 11:31:14', '2025-10-10 10:14:02');

-- --------------------------------------------------------

--
-- Table structure for table `contact_lists`
--

CREATE TABLE `contact_lists` (
  `id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `total_contacts` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_lists`
--

INSERT INTO `contact_lists` (`id`, `business_profile_id`, `name`, `description`, `total_contacts`, `created_at`, `updated_at`) VALUES
('3ad7964f-1ebd-41cf-aefb-f2ef961c75ec', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'Test List', 'Test', 4, '2025-10-09 10:20:19', '2025-10-10 05:46:17');

-- --------------------------------------------------------

--
-- Table structure for table `contact_list_members`
--

CREATE TABLE `contact_list_members` (
  `id` varchar(36) NOT NULL,
  `list_id` varchar(36) NOT NULL,
  `contact_id` varchar(36) DEFAULT NULL,
  `phone_number` varchar(50) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `custom_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`custom_fields`)),
  `opted_out` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_list_members`
--

INSERT INTO `contact_list_members` (`id`, `list_id`, `contact_id`, `phone_number`, `full_name`, `custom_fields`, `opted_out`, `created_at`) VALUES
('2f227a95-0648-4124-981a-82185f4c45db', '3ad7964f-1ebd-41cf-aefb-f2ef961c75ec', NULL, '+94775999821', 'Sakina', NULL, 0, '2025-10-09 10:47:40'),
('3e324570-98ad-475e-b4f8-11763a6f6472', '3ad7964f-1ebd-41cf-aefb-f2ef961c75ec', NULL, '+94764760453', 'Pops', NULL, 0, '2025-10-09 10:47:25'),
('6efb8033-d38c-4a33-a5b0-ee457748abcc', '3ad7964f-1ebd-41cf-aefb-f2ef961c75ec', NULL, '+94719000100', 'Tasneem Hussain Turabally', '{\"type\":\"SFG Wife\"}', 0, '2025-10-10 05:46:17'),
('fc51d2f1-3484-44b4-935d-2788c5a2203b', '3ad7964f-1ebd-41cf-aefb-f2ef961c75ec', NULL, '‪+971581245353‬', 'Husain Turabally', '{\"type\":\"SFG\"}', 0, '2025-10-10 05:46:16');

-- --------------------------------------------------------

--
-- Table structure for table `contact_tags`
--

CREATE TABLE `contact_tags` (
  `contact_id` varchar(36) NOT NULL,
  `tag_id` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `daily_stats`
--

CREATE TABLE `daily_stats` (
  `id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `messages_sent` int(11) DEFAULT 0,
  `messages_received` int(11) DEFAULT 0,
  `new_contacts` int(11) DEFAULT 0,
  `active_contacts` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `intent_keywords`
--

CREATE TABLE `intent_keywords` (
  `id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `keyword` varchar(100) NOT NULL,
  `category` enum('high_intent','medium_intent','low_intent','negative') NOT NULL,
  `score_value` int(11) DEFAULT 0 COMMENT 'Points to add/subtract from lead score',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `intent_keywords`
--

INSERT INTO `intent_keywords` (`id`, `business_profile_id`, `keyword`, `category`, `score_value`, `is_active`, `created_at`, `updated_at`) VALUES
('50ba98d6-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'price', 'high_intent', 20, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bacec8-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'pricing', 'high_intent', 20, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bacfcc-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'cost', 'high_intent', 20, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad044-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'quote', 'high_intent', 25, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad0f8-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'proposal', 'high_intent', 25, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad166-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'buy', 'high_intent', 30, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad1c0-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'purchase', 'high_intent', 30, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad24c-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'order', 'high_intent', 30, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad2b0-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'demo', 'high_intent', 20, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad30a-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'trial', 'high_intent', 20, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad364-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'contract', 'high_intent', 25, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad3be-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'payment', 'high_intent', 25, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad40e-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'invoice', 'high_intent', 25, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad468-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'features', 'medium_intent', 10, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad4b8-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'how does', 'medium_intent', 10, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad512-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'can it', 'medium_intent', 10, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad56c-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'does it support', 'medium_intent', 10, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad5d0-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'integration', 'medium_intent', 10, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad620-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'setup', 'medium_intent', 10, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad684-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'implementation', 'medium_intent', 10, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad6d4-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'comparison', 'medium_intent', 10, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad72e-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'information', 'low_intent', 5, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad77e-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'learn more', 'low_intent', 5, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad7d8-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'curious', 'low_intent', 5, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad832-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'just browsing', 'negative', -10, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad882-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'not interested', 'negative', -20, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad8dc-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'too expensive', 'negative', -15, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48'),
('50bad940-a507-11f0-a7d4-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'maybe later', 'negative', -10, 1, '2025-10-09 11:58:48', '2025-10-09 11:58:48');

-- --------------------------------------------------------

--
-- Table structure for table `lead_activities`
--

CREATE TABLE `lead_activities` (
  `id` varchar(36) NOT NULL,
  `lead_profile_id` varchar(36) NOT NULL,
  `activity_type` enum('profile_created','message_received','message_sent','score_increased','score_decreased','stage_changed','status_changed','note_added','assigned','intent_detected','qualified','disqualified') NOT NULL,
  `description` text DEFAULT NULL,
  `old_value` varchar(255) DEFAULT NULL,
  `new_value` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Additional activity context' CHECK (json_valid(`metadata`)),
  `created_by` varchar(36) DEFAULT NULL COMMENT 'User ID who triggered the activity',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lead_activities`
--

INSERT INTO `lead_activities` (`id`, `lead_profile_id`, `activity_type`, `description`, `old_value`, `new_value`, `metadata`, `created_by`, `created_at`) VALUES
('36c3fba2-6493-4522-a98b-ee51c5d64d6a', 'b08a057b-018f-4ad0-b091-e69b4ae2d564', 'profile_created', 'AI generated lead profile from conversation analysis', NULL, NULL, '{\"conversations_analyzed\":3,\"score\":12}', NULL, '2025-10-09 12:26:13'),
('808c6126-72dc-4aac-bff0-6456e82be8c7', '013df3b0-fabf-4f9e-88f3-4400d8c5a738', 'profile_created', 'AI generated lead profile from conversation analysis', NULL, NULL, '{\"conversations_analyzed\":5,\"score\":15}', NULL, '2025-10-09 12:26:09'),
('97c21273-e471-4c16-ae3e-7aea100f37c6', 'f663620e-cad5-491f-9086-bf72875e12d5', 'note_added', 'This is cool', NULL, NULL, '{\"user_id\":\"5a219cf1-44de-4377-904a-9568bcf0a8e9\"}', NULL, '2025-10-10 04:19:13'),
('bae081fd-a096-42fb-9bf5-e43fb9a28ea1', 'f663620e-cad5-491f-9086-bf72875e12d5', 'profile_created', 'AI generated lead profile from conversation analysis', NULL, NULL, '{\"conversations_analyzed\":4,\"score\":32}', NULL, '2025-10-09 12:26:11'),
('c397399a-2059-4e69-a2b2-a467571417dd', 'f663620e-cad5-491f-9086-bf72875e12d5', 'qualified', 'Lead marked as qualified', NULL, NULL, '{}', NULL, '2025-10-10 04:19:44');

-- --------------------------------------------------------

--
-- Stand-in structure for view `lead_dashboard`
-- (See below for the actual view)
--
CREATE TABLE `lead_dashboard` (
`id` varchar(36)
,`contact_id` varchar(36)
,`business_profile_id` varchar(36)
,`company_name` varchar(255)
,`job_title` varchar(255)
,`industry` varchar(100)
,`team_size` varchar(50)
,`location` varchar(255)
,`email` varchar(255)
,`website` varchar(255)
,`street_address` varchar(255)
,`city` varchar(100)
,`state_province` varchar(100)
,`postal_code` varchar(20)
,`country` varchar(100)
,`pain_points` longtext
,`interests` longtext
,`intent_keywords` longtext
,`budget_range` varchar(100)
,`timeline` varchar(100)
,`decision_stage` enum('awareness','consideration','decision','purchased')
,`lead_score` int(11)
,`lead_temperature` enum('cold','warm','hot')
,`is_qualified` tinyint(1)
,`qualification_notes` text
,`first_interaction_at` timestamp
,`last_interaction_at` timestamp
,`total_interactions` int(11)
,`avg_response_time` int(11)
,`conversation_summary` text
,`next_best_action` text
,`assigned_to` varchar(36)
,`lead_status` enum('new','contacted','qualified','proposal','negotiation','closed_won','closed_lost')
,`created_at` timestamp
,`updated_at` timestamp
,`contact_name` varchar(255)
,`phone_number` varchar(50)
,`profile_pic_url` varchar(500)
,`last_message_at` timestamp
,`business_name` varchar(255)
,`activity_count` bigint(21)
,`messages_received` bigint(21)
,`messages_sent` bigint(21)
,`calculated_temperature` varchar(4)
);

-- --------------------------------------------------------

--
-- Table structure for table `lead_profiles`
--

CREATE TABLE `lead_profiles` (
  `id` varchar(36) NOT NULL,
  `contact_id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `job_title` varchar(255) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `team_size` varchar(50) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `street_address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state_province` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `pain_points` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of identified customer problems' CHECK (json_valid(`pain_points`)),
  `interests` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Products/services the lead is interested in' CHECK (json_valid(`interests`)),
  `intent_keywords` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'High-intent keywords detected in conversations' CHECK (json_valid(`intent_keywords`)),
  `budget_range` varchar(100) DEFAULT NULL,
  `timeline` varchar(100) DEFAULT NULL,
  `decision_stage` enum('awareness','consideration','decision','purchased') DEFAULT 'awareness',
  `lead_score` int(11) DEFAULT 0 COMMENT 'Score 0-100 based on engagement and intent',
  `lead_temperature` enum('cold','warm','hot') DEFAULT 'cold',
  `is_qualified` tinyint(1) DEFAULT 0,
  `qualification_notes` text DEFAULT NULL,
  `first_interaction_at` timestamp NULL DEFAULT NULL,
  `last_interaction_at` timestamp NULL DEFAULT NULL,
  `total_interactions` int(11) DEFAULT 0,
  `avg_response_time` int(11) DEFAULT NULL COMMENT 'Average response time in seconds',
  `conversation_summary` text DEFAULT NULL COMMENT 'AI-generated summary of conversations',
  `next_best_action` text DEFAULT NULL COMMENT 'AI-suggested next action',
  `assigned_to` varchar(36) DEFAULT NULL COMMENT 'User ID from users table',
  `lead_status` enum('new','contacted','qualified','proposal','negotiation','closed_won','closed_lost') DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lead_profiles`
--

INSERT INTO `lead_profiles` (`id`, `contact_id`, `business_profile_id`, `company_name`, `job_title`, `industry`, `team_size`, `location`, `email`, `website`, `street_address`, `city`, `state_province`, `postal_code`, `country`, `pain_points`, `interests`, `intent_keywords`, `budget_range`, `timeline`, `decision_stage`, `lead_score`, `lead_temperature`, `is_qualified`, `qualification_notes`, `first_interaction_at`, `last_interaction_at`, `total_interactions`, `avg_response_time`, `conversation_summary`, `next_best_action`, `assigned_to`, `lead_status`, `created_at`, `updated_at`) VALUES
('013df3b0-fabf-4f9e-88f3-4400d8c5a738', '069260cf-5452-4b44-8833-1d044c145c72', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[\"gas cooker\",\"single burner\",\"Rinnai brand\"]', '[]', NULL, NULL, 'awareness', 15, 'warm', 0, NULL, '2025-10-08 16:06:54', '2025-10-09 07:09:17', 5, NULL, 'The user is inquiring about a single burner Rinnai gas cooker. They seem to be exploring their options for a gas cooker.', 'Ask the user for clarification about their needs and intended use for the gas cooker to determine appropriate models and provide helpful information.', NULL, 'new', '2025-10-09 12:26:09', '2025-10-09 12:26:09'),
('b08a057b-018f-4ad0-b091-e69b4ae2d564', '38e720fc-996e-488c-b8b7-c6307da3af88', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[\"M Abdulally\",\"Rinnai double burner\"]', '[]', NULL, NULL, 'awareness', 12, 'warm', 0, NULL, '2025-10-08 15:08:56', '2025-10-10 09:28:28', 11, 2627, 'The user is looking for information about M Abdulally and a Rinnai double burner, and wants to see pictures. They are in the early stages of information gathering.', 'Provide information and images of M Abdulally and Rinnai double burners. Offer additional resources or support to further educate the user.', NULL, 'new', '2025-10-09 12:26:13', '2025-10-10 09:28:28'),
('f663620e-cad5-491f-9086-bf72875e12d5', '8008e36f-98a5-4078-a21c-bdb22bc5bb58', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'Test Company', NULL, NULL, NULL, NULL, 'test@example.com', NULL, NULL, 'San Francisco', 'California', '94102', 'USA', '[]', '[\"603 cooker\",\"603e\"]', '[\"price\"]', NULL, NULL, 'consideration', 32, 'warm', 1, NULL, '2025-10-09 06:50:35', '2025-10-09 06:52:49', 4, NULL, 'The user is asking about the price of a 603 cooker and also mentioned 603e, indicating interest in these specific products. They are potentially in the consideration stage, comparing prices.', 'Provide the user with pricing information for the 603 cooker and 603e. Offer additional information or resources about these products to help them make a decision.', NULL, 'new', '2025-10-09 12:26:11', '2025-10-10 04:42:49');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `contact_id` varchar(36) NOT NULL,
  `device_id` varchar(36) DEFAULT NULL,
  `whatsapp_message_id` varchar(255) DEFAULT NULL,
  `direction` enum('inbound','outbound') NOT NULL,
  `message_type` varchar(20) NOT NULL,
  `content` text DEFAULT NULL,
  `media_url` varchar(500) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `is_from_bot` tinyint(1) DEFAULT 0,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `business_profile_id`, `contact_id`, `device_id`, `whatsapp_message_id`, `direction`, `message_type`, `content`, `media_url`, `status`, `is_from_bot`, `metadata`, `created_at`, `updated_at`) VALUES
('00c65dbf-f587-4e9e-ba1b-dad86f3cb889', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'bbde3b33-de57-48e2-be5e-94e7d6c88c01', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A6716B958EF4B95D9EE', 'inbound', 'text', 'I’m not sure if it’s mine 🙈', NULL, 'received', 0, NULL, '2025-10-09 07:45:40', '2025-10-09 07:45:40'),
('04169067-8232-4607-a1e1-4b4c184b8e2a', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC681F798A77300EA6F1A8634255CAA1', 'outbound', 'text', 'No answer. Trying', NULL, 'sent', 0, NULL, '2025-10-10 05:06:32', '2025-10-10 05:06:32'),
('053dbf20-74df-4df0-9d06-c12320f0ba17', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACD2995FFC06ADB20F79A1AA23EEE16A', 'inbound', 'text', '[Document: Full Jaman Debit Note Listing (1446 - 1447).pdf]', NULL, 'received', 0, NULL, '2025-10-09 11:59:19', '2025-10-09 11:59:19'),
('05953e05-ac39-4050-b2bb-98a7a2f8a9da', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd69ec9aa-a93d-4b1c-b4b4-1e0188df64a3', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A5DF7702BBD649775EB', 'inbound', 'text', 'She was uncomfortable for a day but then back to normal', NULL, 'received', 0, NULL, '2025-10-09 06:50:54', '2025-10-09 06:50:54'),
('0814b183-dea5-4fc1-9dca-b78823be356b', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACF0946A6BA75286CE0AB92E902C6C71', 'inbound', 'text', '[Image]', NULL, 'received', 0, NULL, '2025-10-10 08:27:29', '2025-10-10 08:27:29'),
('088c26e9-95e8-46a7-ad39-71e4ee6ecf55', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A842A4365FE18CC2653', 'outbound', 'text', 'Send again pls', NULL, 'sent', 0, NULL, '2025-10-09 04:36:45', '2025-10-09 04:36:45'),
('089eba48-61c8-4592-a3da-5eadb79b7f6c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '40389e3c-fb94-40b7-ad54-c4e65354a1e0', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACB35C40C13A43ABB23878F243E6218B', 'inbound', 'text', 'Ok', NULL, 'received', 0, NULL, '2025-10-08 16:54:44', '2025-10-08 16:54:44'),
('09f9d66b-b180-4237-bfdf-06cfd18f3aa5', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB045E402E93A52FE3FAB', 'outbound', 'text', 'I apologize, but I\'m unable to process voice notes at the moment. Could you please type out your message?', NULL, 'sent', 0, NULL, '2025-10-09 07:02:39', '2025-10-09 07:02:39'),
('0acb81af-7202-4cc0-a17c-e56656278eea', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB02C22C66CB224B029A6', 'outbound', 'text', '*Single burner* gas cookers are available! I\'ll help you find the right one.', NULL, 'sent', 0, NULL, '2025-10-09 07:08:39', '2025-10-09 07:08:39'),
('0af0d233-14e9-46ba-8533-e9572012e566', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACC009E62402FE4BB47BF5DA4B38736F', 'inbound', 'text', 'And then he said he needs some more in his corner also☺️', NULL, 'received', 0, NULL, '2025-10-09 11:25:18', '2025-10-09 11:25:18'),
('0b9bec34-931b-4978-9e66-edf04ddf85d5', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC6EEAA08AE530C272227AE925A4A756', 'inbound', 'text', 'Ok superr', NULL, 'received', 0, NULL, '2025-10-10 05:17:51', '2025-10-10 05:17:51'),
('0cfb6a59-fa8d-41b2-825b-aedd1a5c8de8', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB0EA20E18C8B1DA10350', 'outbound', 'text', 'Great! We have several two-burner gas cooker options from Rinnai. Let me share details about three models:\n\n1. RT-902MM(G) Two Burner with Glass Top\n- Price: රු47,200.00\n- Features: Glass top design, modern look\n\n2. GF-216K Two Burner Gas Cooker\n- Price: රු52,510.00\n- Standard model with reliable performance\n\n3. RI-524E Two Burner Gas Cooker with Grill\n- Price: රු33,040.00\n- Includes additional grill functionality\n\nWould you like more specific details about any of these models? I can help you understand their features and which might best suit your kitchen needs.', NULL, 'sent', 0, NULL, '2025-10-09 04:38:07', '2025-10-09 04:38:07'),
('0dc2a1ea-c37d-44e5-9286-554fa2d7fd36', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC342828DD7FC759C957AE607D62EFE6', 'inbound', 'text', '562418', NULL, 'received', 0, NULL, '2025-10-09 08:26:30', '2025-10-09 08:26:30'),
('0df678fc-06a2-493b-998c-055e19f36e7f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A4A79241FAD4EE98141', 'outbound', 'text', 'What will you get?', NULL, 'sent', 0, NULL, '2025-10-09 06:14:21', '2025-10-09 06:14:21'),
('0eac3920-802d-4b96-b697-5200c9ae4532', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB06964AF22D48A27B311', 'outbound', 'text', 'Hello! M Abdulally is a 75-year-old family-owned business in Sri Lanka that specializes in kitchen appliances and gas products. We started as coffee roasters and have been an authorized Rinnai dealer since 1975, offering a wide range of home and commercial kitchen appliances like gas cookers, water heaters, and more. \n\nIs there a specific type of product you\'re interested in learning more about? I\'d be happy to provide more details about our product range.', NULL, 'sent', 0, NULL, '2025-10-09 04:37:05', '2025-10-09 04:37:05'),
('0ed5955d-b253-4f6e-a796-667612397f94', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '59056ebc-9f69-423f-b78f-53c4d812b5da', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC52C0005B4E6BF2E131621AC8C7B4C5', 'outbound', 'text', 'I don\'t know what\'s happening HostGator', NULL, 'sent', 0, NULL, '2025-10-09 07:43:36', '2025-10-09 07:43:36'),
('0f135e58-0030-4698-a023-6ba00b321cc0', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A1A40C98845A1E4525A', 'outbound', 'text', 'Do you feel like having a kimbula bunis?', NULL, 'sent', 0, NULL, '2025-10-09 09:00:21', '2025-10-09 09:00:21'),
('0f4fbd6c-e731-47da-9a44-17307751a465', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC7D6DD63FB1A8882979AC486CA50BA7', 'inbound', 'text', 'Oh yikes ok I\'ll call anywayyy', NULL, 'received', 0, NULL, '2025-10-09 06:30:18', '2025-10-09 06:30:18'),
('0fb2e144-59ae-4577-ad10-1a787a38e54d', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'bbde3b33-de57-48e2-be5e-94e7d6c88c01', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A4225EEEF58287403C3', 'inbound', 'text', 'Can you check 🫤', NULL, 'received', 0, NULL, '2025-10-09 07:42:41', '2025-10-09 07:42:41'),
('0fc3e52e-8854-42cf-b428-4c4c5d65fa59', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '5764271e-6a62-4f0b-9fdc-9464ee6898ca', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACED3E8DF015DE9A9FC5E6BFF1ED68E3', 'inbound', 'text', 'Brother don\'t wait for me, I don\'t think I\'ll make it to Colombo in time. What time do you\'ll open tomorrow?', NULL, 'received', 0, NULL, '2025-10-08 10:38:58', '2025-10-08 10:38:58'),
('100b6f0d-fae6-4661-8c84-ef125d065fe3', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC44ECE9289F2C323DC2D10F53F70701', 'inbound', 'text', '🤣', NULL, 'received', 0, NULL, '2025-10-09 11:24:24', '2025-10-09 11:24:24'),
('1019e4f5-5350-4271-9c22-b810c4a93ff3', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '8229145e-4105-4712-b37c-3c811d5dda87', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACAF4F14DCC2DC237BE8F9C27A87A729', 'outbound', 'text', '😁', NULL, 'sent', 0, NULL, '2025-10-09 05:01:28', '2025-10-09 05:01:28'),
('10380ae6-4859-49af-a172-ef1fbfd8993f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '39bd3957-aeb8-4288-a4f6-79c371bf99a4', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC7E0FBA461D98BE10A4A914B9D91A59', 'inbound', 'text', 'Plastic 4\" 01 feet  250/=   and  3\"   01 feet, 200/=', NULL, 'received', 0, NULL, '2025-10-09 05:16:18', '2025-10-09 05:16:18'),
('11b7d567-b27d-453b-aa7d-ba4cefaf6d49', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '18fd539e-2ae7-4f06-8070-a6d705101ec5', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC47E990EFF98D94445458F6D4AA1E21', 'outbound', 'text', 'OK', NULL, 'sent', 0, NULL, '2025-10-10 09:38:49', '2025-10-10 09:38:49'),
('11bd1e28-048f-4ac0-8343-0f9ab01ca978', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '40389e3c-fb94-40b7-ad54-c4e65354a1e0', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A83B0C19036F5F5E9AA', 'outbound', 'text', 'Mach. Filling out the indian e-visa form. Port of entry will be ahmedabad', NULL, 'sent', 0, NULL, '2025-10-08 16:21:30', '2025-10-08 16:21:30'),
('1249c307-98c2-40a8-a91b-4ec9b428d8ca', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '7973f819-8943-4477-89c8-106c1980c7e2', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A123B35F7EA81B1251A', 'outbound', 'text', '[Document: Invoice 1886 Aug 10.pdf]', NULL, 'sent', 0, NULL, '2025-10-09 08:12:24', '2025-10-09 08:12:24'),
('12e0dd62-d19f-4144-aa1f-50f666602796', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '9546e5ce-767b-4289-9278-2c63403a82b3', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC5BA18BBEF868D6D317D5E7FF395F09', 'outbound', 'text', 'Hey how are you?', NULL, 'sent', 0, NULL, '2025-10-08 15:06:13', '2025-10-08 15:06:13'),
('13e64b8b-991d-4e33-ae43-d8af4ffcfdc4', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '669fb7c7-8c2f-4d4a-924b-e06d639408de', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'ACF5043D6F9571804F0E6AEB1885401B', 'outbound', 'text', '[Image]', NULL, 'sent', 0, NULL, '2025-10-10 07:55:16', '2025-10-10 07:55:16'),
('1406c713-865d-459d-bc79-eeb26a5ee7a6', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC9986B4A47D2E8C2CEF04DDA6A8757A', 'inbound', 'text', 'Ji bhai', NULL, 'received', 0, NULL, '2025-10-09 04:36:54', '2025-10-09 04:36:54'),
('151ab332-1231-4d75-a8fc-1e5dd1e38591', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AA66F1E2E4155674864', 'outbound', 'text', 'Also now that you have a mac. I expect you to have all passwords and all accesses forever. Otherwise I will run over the macbook. Thanks.', NULL, 'sent', 0, NULL, '2025-10-09 08:17:20', '2025-10-09 08:17:20'),
('153e4dbf-7cfa-4a0a-b824-b9b2cd16e53e', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC08D9B773A2190577B073688C92239A', 'inbound', 'text', 'Lol', NULL, 'received', 0, NULL, '2025-10-09 09:29:46', '2025-10-09 09:29:46'),
('17420b89-64d4-48a2-8adc-962785bcf3e1', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'ACCF844F4A02CC3A6F3DD529EFB1CEC0', 'inbound', 'text', 'Mata one gas cooker', NULL, 'received', 0, NULL, '2025-10-09 07:07:54', '2025-10-09 07:07:54'),
('1aaa136a-ecf2-48cd-a5a9-81e29ecfff9b', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A677029451A50ABFEC7', 'outbound', 'text', 'Soon soon', NULL, 'sent', 0, NULL, '2025-10-09 11:26:17', '2025-10-09 11:26:17'),
('1b08d678-cca0-47ee-a5e5-9dbd0b9e0c57', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '59056ebc-9f69-423f-b78f-53c4d812b5da', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC4A64FA3D05B111DCEDB8FEE33C9DBB', 'outbound', 'text', 'Card got charged for Hostgator', NULL, 'sent', 0, NULL, '2025-10-09 07:43:35', '2025-10-09 07:43:35'),
('1bd30b1c-7dfd-48d4-830d-ac75a296b6fc', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB0A4F857F7EF8A6A37CE', 'outbound', 'text', 'I apologize, but after carefully reviewing our product catalog, it seems M Abdulally currently stocks *two-burner* Rinnai models like the `RT-902MM(G)` and `GF-216K`, but not single burner options.', NULL, 'sent', 0, NULL, '2025-10-09 07:09:12', '2025-10-09 07:09:12'),
('1c16cf29-1e80-4338-b5aa-86572218037d', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AD182D795C89D2401A3', 'outbound', 'text', 'Jaan. For tomorrow, the kurta set that you said there was excess nil stuck on it, is that the suit?', NULL, 'sent', 0, NULL, '2025-10-10 09:25:38', '2025-10-10 09:25:38'),
('1e2d734b-6f75-4ac7-826f-d4921c9971c9', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC266413EE363B3C65825E722506B722', 'inbound', 'text', 'Things to do at office today:\n\n1. Find that big white bag of clothes \n2. Bring cupboard contents\n3. Call Nelfarm guy', NULL, 'received', 0, NULL, '2025-10-09 08:58:10', '2025-10-09 08:58:10'),
('1f7dcca9-987b-4a6f-8af1-a7ae380a4530', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A4A9417BB0607EB9D50', 'outbound', 'text', 'Yes', NULL, 'sent', 0, NULL, '2025-10-09 06:14:18', '2025-10-09 06:14:18'),
('1f803ed8-a228-4a90-a97e-a347ddf43555', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC0EED74DC0C02A914D4160F0197C74A', 'inbound', 'text', 'For which email?', NULL, 'received', 0, NULL, '2025-10-09 08:16:00', '2025-10-09 08:16:00'),
('20acd0b9-bca1-4164-a0f3-79ddee59a0c2', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'bbde3b33-de57-48e2-be5e-94e7d6c88c01', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3ADE25365CD6C2CAE70F', 'inbound', 'text', 'Thanks 🙏🏽', NULL, 'received', 0, NULL, '2025-10-09 08:33:10', '2025-10-09 08:33:10'),
('20fa45a2-ffaf-401f-9f10-8f35831644cb', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC4BF1BAE3940FB4246EE54088ED6224', 'inbound', 'text', 'She and baby have come to the room', NULL, 'received', 0, NULL, '2025-10-09 11:19:23', '2025-10-09 11:19:23'),
('21269638-3f9c-44c2-867e-ba4791201a0e', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC3A150AFF151483191879ED17169CE2', 'inbound', 'text', 'He\'s having sakar n smiling', NULL, 'received', 0, NULL, '2025-10-09 11:23:28', '2025-10-09 11:23:28'),
('2155dd92-5e38-482e-a32c-0a72a23ecc7e', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '099427db-0ece-4b53-a1e1-268658d9109d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC8AEC655ECF7E96BAF7257BFAD57768', 'outbound', 'text', '[Image]', NULL, 'sent', 0, NULL, '2025-10-10 07:55:39', '2025-10-10 07:55:39'),
('21f4fd0e-8e2a-465f-8b55-3241c43d35c1', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '40389e3c-fb94-40b7-ad54-c4e65354a1e0', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC356495D9398BB6E45619D2F112F650', 'inbound', 'text', 'No dont', NULL, 'received', 0, NULL, '2025-10-08 16:54:49', '2025-10-08 16:54:49'),
('23600ed6-98d4-48d0-91bb-f801c87708e6', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC750E6156A0E93F41F5301049765501', 'inbound', 'text', 'I can\'t wait to see him mennnn', NULL, 'received', 0, NULL, '2025-10-09 11:25:56', '2025-10-09 11:25:56'),
('23a9e8e3-c87f-421a-bcd4-ba77875e9b21', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC4C96D3715472BC948B1F0DA2297FD0', 'inbound', 'text', 'The payment?', NULL, 'received', 0, NULL, '2025-10-09 08:59:48', '2025-10-09 08:59:48'),
('23cb4c7e-3200-4a2d-a2fe-1901fb1c8492', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC64B6755F66F60E05AE5C4E29AEC478', 'inbound', 'text', 'Big baby 3.8kg😍🥹... And talll', NULL, 'received', 0, NULL, '2025-10-09 11:20:15', '2025-10-09 11:20:15'),
('25436754-a068-4ab8-bf03-f19810b98880', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '7973f819-8943-4477-89c8-106c1980c7e2', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACC2825286FDC0E22D98140B5B4CA095', 'inbound', 'text', 'What\'s the 35k and 25k amount for?', NULL, 'received', 0, NULL, '2025-10-09 07:48:10', '2025-10-09 07:48:10'),
('255867a0-74ea-44c3-94c7-e1a8607e4e2b', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '7973f819-8943-4477-89c8-106c1980c7e2', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3EB05EAB640DA5E1395F79', 'outbound', 'text', 'Indian stuff ne?', NULL, 'sent', 0, NULL, '2025-10-10 06:48:31', '2025-10-10 06:48:31'),
('263b4643-3d45-4e3c-96f1-7495d1e74fd2', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB058F027C0DB638CCB9F', 'outbound', 'text', 'Ah, you\'re looking for a *gas cooker*! Excellent choice.', NULL, 'sent', 0, NULL, '2025-10-09 07:08:01', '2025-10-09 07:08:01'),
('26842f14-ed6f-4767-a104-8e48a2ef1497', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC843230B8716FCBAA65F004ACF1D500', 'inbound', 'text', 'A0090A - 0777487752 please change this contaceno', NULL, 'received', 0, NULL, '2025-10-08 09:27:45', '2025-10-08 09:27:45'),
('293bda80-3690-4ce7-95a5-8c40cdf349a2', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'e59fd553-a467-456a-a672-982d350f47a2', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A2E638260912F5B289F', 'inbound', 'text', 'Hi no we don’t have a VAT number', NULL, 'received', 0, NULL, '2025-10-10 07:28:35', '2025-10-10 07:28:35'),
('2a1be616-771b-42ff-8fe0-cbfba5652160', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '819d5a8c-ad22-4de9-a667-81bd65edff8d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACC8875027FB1E3E7A73326244CA08DC', 'inbound', 'text', 'BANk : COMMERCIAL BANK \nACCOUNT NAME : KALEEMI KHIDMAT GUZAAR\nACCOUNT NO : 1240010523\nBRANCH - PETTAH\n\nHi Gentle reminder\nPlease share the slip if have already paid.\nShukran', NULL, 'received', 0, NULL, '2025-10-08 17:58:21', '2025-10-08 17:58:21'),
('2a228316-6b12-47e5-a487-c6f4bf2cb02a', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC31343C41DCEA8267391C1E6984FDB4', 'outbound', 'text', 'Ok', NULL, 'sent', 0, NULL, '2025-10-10 05:06:26', '2025-10-10 05:06:26'),
('2ae0694b-7c8e-41b3-8a52-db35e398a4de', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A5BF45AED8829F0F9F7', 'outbound', 'text', '[Document: M0156A.pdf]', NULL, 'sent', 0, NULL, '2025-10-09 08:31:57', '2025-10-09 08:31:57'),
('2b86f343-6e86-47aa-bb35-fa4c1a68a77f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '8008e36f-98a5-4078-a21c-bdb22bc5bb58', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB0EAFD8F76564FF7D669', 'outbound', 'text', 'I apologize, but I\'m not sure what you mean by \"603\". Could you please clarify? Are you asking about a specific product model or looking for more information? \n\nI\'d be happy to help you if you can provide more details. Are you interested in a particular type of appliance like a gas cooker, water heater, or something else? Please let me know, and I\'ll assist you with the most accurate information.', NULL, 'sent', 0, NULL, '2025-10-09 06:51:57', '2025-10-09 06:51:57'),
('2be673af-9ca9-431c-ab7c-4fd628ded73f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'ba107c0b-c214-4879-85a8-8a1090eaa352', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC8A059BDB07EE8DC7F017DB94A1A115', 'inbound', 'text', 'Hi. How are you?', NULL, 'received', 0, NULL, '2025-10-08 12:01:30', '2025-10-08 12:01:30'),
('2bf2c2c4-a108-4cea-9a6e-cbe2c3e74288', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3ACC2556BBCC2718BA27', 'outbound', 'text', '[Document: Invoice 1906 Oct 2.pdf]', NULL, 'sent', 0, NULL, '2025-10-09 08:11:48', '2025-10-09 08:11:48'),
('2c5d17d3-905f-4181-acc1-0e98e13a2d51', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'ba107c0b-c214-4879-85a8-8a1090eaa352', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3EB00A9034A7F46F4382CD', 'outbound', 'text', 'Testing. Where am I coming from?', NULL, 'sent', 0, NULL, '2025-10-08 11:40:34', '2025-10-08 11:40:34'),
('2cf562ed-3a63-4577-ba00-490c7567be18', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AA4A137CE9C6971190B', 'outbound', 'text', 'How much baby weighs?', NULL, 'sent', 0, NULL, '2025-10-09 11:19:32', '2025-10-09 11:19:32'),
('2f9cdd69-1cc8-4056-a968-358057372adb', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB088B52D7C1F5D3A9F18', 'outbound', 'text', 'For your home, are you looking for a *two-burner* model?', NULL, 'sent', 0, NULL, '2025-10-09 07:08:04', '2025-10-09 07:08:04'),
('30f95555-5d1d-4cb0-bad8-e2d2b73851bd', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'bbde3b33-de57-48e2-be5e-94e7d6c88c01', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A9AD72E107DF50C2062', 'inbound', 'text', 'Card got charged for Hostgator', NULL, 'received', 0, NULL, '2025-10-09 07:42:34', '2025-10-09 07:42:34'),
('344eb430-e780-4323-bf3e-7bb88347179a', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A40E291D86472FDA58F', 'outbound', 'text', 'OK awesome. We’re almost there', NULL, 'sent', 0, NULL, '2025-10-09 04:33:02', '2025-10-09 04:33:02'),
('34851a93-2d37-42f3-bd39-c20e4731ca73', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'c8854b03-c8bd-4684-891d-1c54a26843d8', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACF42AE8D5C048F74208B2CD5364AA18', 'outbound', 'text', 'Not yet cleaned. We will inform you when it\'s ready.', NULL, 'sent', 0, NULL, '2025-10-10 07:56:40', '2025-10-10 07:56:40'),
('34861e56-92f7-4305-88a9-d715df7da70c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A797F2BC7F38E8CE019', 'outbound', 'text', 'Heheh', NULL, 'sent', 0, NULL, '2025-10-09 11:26:11', '2025-10-09 11:26:11'),
('34fc94ef-7974-4bc2-95d9-821f41993f82', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '7973f819-8943-4477-89c8-106c1980c7e2', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC83ADF3CE911A797F5952A9732548DF', 'inbound', 'text', 'Noise and boat', NULL, 'received', 0, NULL, '2025-10-10 06:42:00', '2025-10-10 06:42:00'),
('3573ae8e-de54-4c0b-b0da-7d72b0563da5', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '40389e3c-fb94-40b7-ad54-c4e65354a1e0', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A1F484DE6F6BCCD28BF', 'outbound', 'text', 'Also countries travelled last 10 years have to include pakistan also yes?', NULL, 'sent', 0, NULL, '2025-10-08 16:21:42', '2025-10-08 16:21:42'),
('363a5f11-96d9-4fe3-a8fb-956338559525', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd69ec9aa-a93d-4b1c-b4b4-1e0188df64a3', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A4E509852F6351F44CC', 'outbound', 'text', 'Also. 94777965255', NULL, 'sent', 0, NULL, '2025-10-09 06:53:57', '2025-10-09 06:53:57'),
('37155172-e0ef-433d-bbf4-2476a4f55623', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A5F1136AD6055F2F694', 'outbound', 'text', 'Who does he look more like?', NULL, 'sent', 0, NULL, '2025-10-09 11:21:47', '2025-10-09 11:21:47'),
('375b4995-2a00-4872-8367-0ac30441fce3', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AD96396E73AA14542B8', 'outbound', 'text', 'OK', NULL, 'sent', 0, NULL, '2025-10-09 08:58:16', '2025-10-09 08:58:16'),
('38be212e-8a07-45ed-84c0-b57a759a37b3', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '44f07772-8bad-45bb-85a9-373786c121f5', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3ACDB2028EF07B1D1410', 'outbound', 'text', 'Also. What’s up with Pater. Still struggling with the cold and fever?', NULL, 'sent', 0, NULL, '2025-10-09 08:57:53', '2025-10-09 08:57:53'),
('38c7626e-5368-4e34-849b-85d7674b193a', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'efa79058-f38d-4145-a0d1-1d284ee883b6', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB0A2069C48B97D467806', 'outbound', 'text', 'How can I assist you today with your kitchen or home appliance needs?', NULL, 'sent', 0, NULL, '2025-10-10 07:18:30', '2025-10-10 07:18:30'),
('38dbb7a3-9762-435b-8910-2ed5e368efd7', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '8008e36f-98a5-4078-a21c-bdb22bc5bb58', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB060569AE9B98998CAC5', 'outbound', 'text', 'I apologize, but I cannot find a specific model \"603e\" in our current product catalog. Our current gas cooker models include:\n\n1. Two Burner with Glass Top RT-902MM(G) - Price: රු47,200.00\n2. GF-216K Two Burner Gas Cooker - Price: රු52,510.00\n\nCould you please confirm the exact model number or provide more details about the cooker you\'re interested in? I\'d be happy to help you find the right product or get the precise information you need.', NULL, 'sent', 0, NULL, '2025-10-09 06:52:49', '2025-10-09 06:52:49'),
('39622ff8-91f7-4ed1-90e3-e5e40baaa769', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '274e25a9-bfe9-444b-bcad-45bbda4aeed9', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC8E11A29C1E385AD6DF91E82E28584F', 'inbound', 'text', 'Large 50.00\nXL 52.00', NULL, 'received', 0, NULL, '2025-10-09 09:25:59', '2025-10-09 09:25:59'),
('398aa0ac-f27b-4022-a3c2-f0ce580ccf80', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC5FD93193B2A5F539D98F25513E1D2F', 'inbound', 'text', '[Voice Note]', NULL, 'received', 0, NULL, '2025-10-10 09:28:27', '2025-10-10 09:28:27'),
('3a3608d0-8195-4745-ab7a-2e722fc4b480', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACD497A92956FEE30D7394B3D6D33D4D', 'inbound', 'text', 'That\'s why docs were saying normal would have been quite tough', NULL, 'received', 0, NULL, '2025-10-09 11:20:30', '2025-10-09 11:20:30'),
('3a40ed35-5cdd-4ec0-802d-ab31b54eaf34', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A372E8B68E4E1BB9A81', 'outbound', 'text', 'I know you want', NULL, 'sent', 0, NULL, '2025-10-09 09:00:29', '2025-10-09 09:00:29'),
('3b623319-c728-4aec-9eac-8a6ab80e6ede', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '8008e36f-98a5-4078-a21c-bdb22bc5bb58', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC0C5BC1E9DF5E54A0E6734CDF5931E2', 'inbound', 'text', 'Hi. Can you tell me aboyt your products?', NULL, 'received', 0, NULL, '2025-10-09 06:51:23', '2025-10-09 06:51:23'),
('3b64706a-9811-43a7-bbc6-77e8b477b4c5', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '59056ebc-9f69-423f-b78f-53c4d812b5da', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC13CAC6A8535311ED441D62AE352D5E', 'outbound', 'text', 'Can you check 🫤', NULL, 'sent', 0, NULL, '2025-10-09 07:43:35', '2025-10-09 07:43:35'),
('3bb8c5b1-0c14-48ee-b04f-eac2fa3d7268', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AC2B06CC3329713995B', 'outbound', 'text', 'OK nothing for now', NULL, 'sent', 0, NULL, '2025-10-09 04:37:58', '2025-10-09 04:37:58'),
('3df54c5d-9cc1-4f69-b59f-f7b57b86bfb4', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AD83B6263D900F68F8E', 'outbound', 'text', 'OK. Coz of cesar?', NULL, 'sent', 0, NULL, '2025-10-09 11:19:51', '2025-10-09 11:19:51'),
('3e758752-755c-4160-8112-f69b9a3d2713', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AD2365CD4E6F20818EF', 'outbound', 'text', 'At least he is not confused what to do with a boy', NULL, 'sent', 0, NULL, '2025-10-09 11:24:10', '2025-10-09 11:24:10'),
('3ea3c387-299b-4417-9933-a2c000d428d8', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '669fb7c7-8c2f-4d4a-924b-e06d639408de', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC8A059BDB07EE8DC7F017DB94A1A115', 'outbound', 'text', 'Hi. How are you?', NULL, 'sent', 0, NULL, '2025-10-08 12:01:30', '2025-10-08 12:01:30'),
('3f12c8be-6392-4b46-82dd-e2cb0b945dd1', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A2F6B1CA6BDE9D75E30', 'outbound', 'text', 'Mashallah', NULL, 'sent', 0, NULL, '2025-10-09 08:22:37', '2025-10-09 08:22:37'),
('41020291-e4ab-4610-a75c-331c822e3cce', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '1d55adfd-0166-4843-9557-9bd6aa5e4b00', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACF89758A30B42827AB485E45A5391C6', 'outbound', 'text', 'What\'s happening?', NULL, 'sent', 0, NULL, '2025-10-08 09:12:05', '2025-10-08 09:12:05'),
('4163f428-24cd-4e6b-84d8-ef8147224064', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '39bd3957-aeb8-4288-a4f6-79c371bf99a4', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC8582CB0CB01EDF744FE14084FF93E2', 'inbound', 'text', 'Aluminium higit 4\"  01 feet  690/=', NULL, 'received', 0, NULL, '2025-10-09 05:13:54', '2025-10-09 05:13:54'),
('423dec75-529d-44fe-a011-bbc479cb00ab', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '274e25a9-bfe9-444b-bcad-45bbda4aeed9', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A1AE1D7B95A47F4EBBE', 'outbound', 'text', 'Salaam', NULL, 'sent', 0, NULL, '2025-10-09 08:58:30', '2025-10-09 08:58:30'),
('4262e980-650b-42e4-ba31-f02feae2c712', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC945D4B6A227B6D318462A5B305FA4C', 'inbound', 'text', 'Yes rinnai brand', NULL, 'received', 0, NULL, '2025-10-09 07:08:59', '2025-10-09 07:08:59'),
('427cae0e-00ca-44b0-ac13-583ba9c1d6e4', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'bbde3b33-de57-48e2-be5e-94e7d6c88c01', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A2990543E793ECE0C8B', 'inbound', 'text', 'Ok I’ll check', NULL, 'received', 0, NULL, '2025-10-09 08:33:06', '2025-10-09 08:33:06'),
('42a333f9-8f65-41d6-9cc0-d502bdecdeae', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'fb6b2854-8ea9-4c26-92e9-3027ec3488d1', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AE36724C7E5B878B353', 'outbound', 'text', 'Salaams Mustafabhai. Mubarak on becoming a Dada once again. :)', NULL, 'sent', 0, NULL, '2025-10-09 11:31:14', '2025-10-09 11:31:14'),
('43805503-7f8c-4368-9b75-034485df5121', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AC39E23121401314B5E', 'outbound', 'text', 'There are some bugs. I’ll attend to it 1st', NULL, 'sent', 0, NULL, '2025-10-09 04:38:09', '2025-10-09 04:38:09'),
('44a83084-5a15-47c2-98c5-06249898d9d9', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A3EEBF0029FE2A0D004', 'outbound', 'text', 'Yes. SEZ account of course is disabled', NULL, 'sent', 0, NULL, '2025-10-09 09:00:13', '2025-10-09 09:00:13'),
('45adc501-3728-4cc1-a6d2-f4c169a67927', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACBE1F70C53EC24278604A593522E01D', 'inbound', 'text', '😋😋', NULL, 'received', 0, NULL, '2025-10-09 11:24:47', '2025-10-09 11:24:47'),
('47950aea-1900-4ae9-92c1-a1dfe28a7588', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC0F789FC56FC9CE8708B08D689816B5', 'inbound', 'text', 'Okay sent!', NULL, 'received', 0, NULL, '2025-10-09 04:32:13', '2025-10-09 04:32:13'),
('47edc641-3402-4886-845b-93618e697fa9', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A40308DD090CDA38CBA', 'outbound', 'text', 'sez gmail', NULL, 'sent', 0, NULL, '2025-10-09 08:16:14', '2025-10-09 08:16:14'),
('4b426d69-d95a-4c4c-80bf-2be53ab6812f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '669fb7c7-8c2f-4d4a-924b-e06d639408de', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3EB003026BC55A1E7F27C8', 'outbound', 'text', 'Hello Shabbir Test, how are you?', NULL, 'sent', 0, NULL, '2025-10-09 11:06:42', '2025-10-09 11:06:42'),
('4bb27b92-4573-4dac-91b2-9b8094ce061b', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd69ec9aa-a93d-4b1c-b4b4-1e0188df64a3', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A17832D2247C4F295DB', 'inbound', 'text', 'Ha bhai yes its done', NULL, 'received', 0, NULL, '2025-10-09 06:50:41', '2025-10-09 06:50:41'),
('4d1a3e76-10e3-4ec5-a33b-02c0c5510311', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB039113C303B17966EBA', 'outbound', 'text', 'Great! Let me check our *Rinnai single burner* models for you.', NULL, 'sent', 0, NULL, '2025-10-09 07:09:06', '2025-10-09 07:09:06'),
('4d6ccdec-bdbd-425b-b4cd-d950aa83e158', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A647E29D2E3C5329BEA', 'outbound', 'text', 'You miss Sri Lanka ne?', NULL, 'sent', 0, NULL, '2025-10-09 09:00:25', '2025-10-09 09:00:25'),
('4d85f91e-8ec4-416a-9156-f19a13685f5c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'c32f6237-44d0-4ff6-9d86-a2dcde381268', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC6677990C951F10620A0C5B58525DCD', 'outbound', 'text', 'https://www.instagram.com/reel/DOr69KAE_Xk/?igsh=MTB4ZXBsdGR6Z3dtaA==', NULL, 'sent', 0, NULL, '2025-10-09 08:27:04', '2025-10-09 08:27:04'),
('4ddc5571-8fd7-4358-942c-fac8b0154d6e', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC6272AA5DC7C40F9C5AEAA83914976D', 'inbound', 'text', 'Total - 105,100,000/-', NULL, 'received', 0, NULL, '2025-10-09 12:00:37', '2025-10-09 12:00:37'),
('4e6d06b5-03c5-472b-b03b-e1a657343c39', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '8229145e-4105-4712-b37c-3c811d5dda87', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACB9F6D02A93AFB82A3EDE4B8FD683EF', 'outbound', 'text', 'Salaams sir. Hope everything is under control and ppl are keeping calm.', NULL, 'sent', 0, NULL, '2025-10-09 05:01:28', '2025-10-09 05:01:28'),
('4e8d2282-36c0-4015-ae40-cc5c472f6a67', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '3e6082ac-5cab-48ac-acc5-d3778f02ddc6', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'ACF89758A30B42827AB485E45A5391C6', 'inbound', 'text', 'What\'s happening?', NULL, 'received', 0, NULL, '2025-10-08 09:12:05', '2025-10-08 09:12:05'),
('4eb39971-3b50-45c7-bafd-5030e4e4b296', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC10301154C1E35DED1D6A254D762ABD', 'inbound', 'text', 'Nafu was 3.6kgs', NULL, 'received', 0, NULL, '2025-10-09 11:21:10', '2025-10-09 11:21:10'),
('52815b4a-c09a-4e4d-963e-224355e67822', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A0EE21D5ED3FE7C9912', 'outbound', 'text', '[Document: Invoice 1896 Sept 28.pdf]', NULL, 'sent', 0, NULL, '2025-10-09 08:11:48', '2025-10-09 08:11:48'),
('52cc429c-d506-4f91-9b56-5ff9b34680d8', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '52d5ed55-29d1-4487-b52c-6db26827412a', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC61C10D6CB43128B3C16F40966B5BA2', 'outbound', 'text', 'Hi Fatema. Will come now to collect. Should be there within half an hour or so.', NULL, 'sent', 0, NULL, '2025-10-09 05:01:28', '2025-10-09 05:01:28'),
('52cf9016-0305-492f-a8aa-009ae280752b', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'bbde3b33-de57-48e2-be5e-94e7d6c88c01', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A6456C6C4139686DBEE', 'outbound', 'text', 'Don’t think it’s SEZ', NULL, 'sent', 0, NULL, '2025-10-09 08:28:15', '2025-10-09 08:28:15'),
('54202b93-a9f2-42c7-b78a-f79ae9f0c865', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC6024BD39B643C53B13053BBBCA459F', 'inbound', 'text', 'Check chat', NULL, 'received', 0, NULL, '2025-10-09 04:39:08', '2025-10-09 04:39:08'),
('5433da86-2e24-4e8b-a757-3b9001ed9e03', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '44f07772-8bad-45bb-85a9-373786c121f5', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3EB0BB4B0B16435B6614BF', 'inbound', 'text', 'yessss', NULL, 'received', 0, NULL, '2025-10-09 09:00:35', '2025-10-09 09:00:35'),
('549669cc-a189-4c35-b36f-3dfe8871db23', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACE4A801479285CF9E40CE282CE04A64', 'inbound', 'text', 'Hallooooo', NULL, 'received', 0, NULL, '2025-10-09 11:19:04', '2025-10-09 11:19:04'),
('563b1216-5532-4947-8c83-bdd8ac4f1ed1', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AB98287FB534F9B8612', 'outbound', 'text', 'Pls send again', NULL, 'sent', 0, NULL, '2025-10-09 04:31:52', '2025-10-09 04:31:52'),
('5722793b-234d-4310-8b3d-56426a15c661', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '274e25a9-bfe9-444b-bcad-45bbda4aeed9', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A8D45F4D9E3278CC8E1', 'outbound', 'text', 'Can you let me know rates for large/extra large eggs?', NULL, 'sent', 0, NULL, '2025-10-09 08:58:46', '2025-10-09 08:58:46'),
('5b9d3e5b-5e67-4980-a804-6675ff64243d', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC0D814B729D3233DACCD9D8BC81F717', 'inbound', 'text', 'Yes I want information about a Rinnai double burner', NULL, 'received', 0, NULL, '2025-10-09 04:38:02', '2025-10-09 04:38:02'),
('5d146f0a-5563-4e27-89cd-0a7d35495935', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A4490B2F97DC56D8412', 'outbound', 'text', 'Sorry I was praying. Will send all invoices', NULL, 'sent', 0, NULL, '2025-10-09 08:07:38', '2025-10-09 08:07:38'),
('5d7f300b-42c3-4fef-bd67-fb0e01a6e007', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AFF561F04EE83B03A96', 'outbound', 'text', '3950 I thin she said the amount was', NULL, 'sent', 0, NULL, '2025-10-10 05:17:41', '2025-10-10 05:17:41'),
('5d822103-b8cd-497d-a0a9-881e327df935', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACD1BAF0A27C748D811CF35C3DE38D63', 'inbound', 'text', 'You ordered? :)', NULL, 'received', 0, NULL, '2025-10-10 05:06:17', '2025-10-10 05:06:17'),
('5e0db6aa-545f-475e-b12e-6567fd037cfd', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A1E871548A953D5DE0F', 'outbound', 'text', 'That might come later', NULL, 'sent', 0, NULL, '2025-10-09 11:24:18', '2025-10-09 11:24:18'),
('621526f3-95fc-4690-bd63-966ac9703cdf', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'efa79058-f38d-4145-a0d1-1d284ee883b6', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB0B3FEF69792863DBF79', 'outbound', 'text', 'Abdulally.', NULL, 'sent', 0, NULL, '2025-10-10 07:18:26', '2025-10-10 07:18:26'),
('64a40ece-598c-4ea4-9902-f8b801d459db', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC3568EC6CD405039FC2C9AAFA4CAAE7', 'inbound', 'text', '[Voice Note]', NULL, 'received', 0, NULL, '2025-10-09 08:00:01', '2025-10-09 08:00:01'),
('661c11bc-3e91-4676-b05d-119ed17af875', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '7973f819-8943-4477-89c8-106c1980c7e2', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A9A53D30F8807DB6E39', 'outbound', 'text', 'What the shits? Never heard of these', NULL, 'sent', 0, NULL, '2025-10-10 06:43:08', '2025-10-10 06:43:08'),
('67626453-bf39-4d70-b037-5fe4ac3e7b08', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC0900288718832F52259403A6201625', 'inbound', 'text', 'You told Abba? Or shall I call and tell after they finish keeping under observation etc 😊', NULL, 'received', 0, NULL, '2025-10-09 06:29:43', '2025-10-09 06:29:43'),
('68b60409-cdaa-416e-949a-370f51038dfe', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACE2737032E208901141DE8671DF0FCD', 'inbound', 'text', 'Also sabaq is till 6pm this time will 2 hour break', NULL, 'received', 0, NULL, '2025-10-09 08:15:28', '2025-10-09 08:15:28'),
('68f8d81f-c199-4136-9c0b-e239e382e7a1', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A3FC0C887891AB120DD', 'outbound', 'text', 'You will get OTP pls send', NULL, 'sent', 0, NULL, '2025-10-09 08:14:21', '2025-10-09 08:14:21'),
('6ad04619-4299-4a29-8560-2cf6afe73d86', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3ADA9526917CE2CC2460', 'outbound', 'text', 'How are they?', NULL, 'sent', 0, NULL, '2025-10-09 11:19:28', '2025-10-09 11:19:28'),
('6b7f054c-447c-4738-9203-7adfcb0d6d32', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '2d825db2-370f-4fc9-933f-0ff545d745ad', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC6DFB167972A5D490C8F7BB6FB83AC9', 'outbound', 'text', '[Voice Note]', NULL, 'sent', 0, NULL, '2025-10-10 07:17:05', '2025-10-10 07:17:05'),
('6e5040e2-bbc5-4df5-82ad-61e32593b535', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '7973f819-8943-4477-89c8-106c1980c7e2', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACC9E1F3AE6D91502EDD99F644A6C1D3', 'inbound', 'text', 'Send invoice for both of these pls', NULL, 'received', 0, NULL, '2025-10-09 08:06:36', '2025-10-09 08:06:36'),
('6f49a524-fdc9-4e59-885d-e6196671e2f1', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '274e25a9-bfe9-444b-bcad-45bbda4aeed9', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC2C07446188464B8CCBB1BADCAA65FD', 'inbound', 'text', 'No problem', NULL, 'received', 0, NULL, '2025-10-09 10:15:10', '2025-10-09 10:15:10'),
('6f522e8b-d758-4da9-a595-6786ca17f4b2', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '5885a3e4-b09d-45ca-9a8a-e48a79e99e78', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC0AFF984341109DD181902DD688A072', 'outbound', 'text', 'What rubbish', NULL, 'sent', 0, NULL, '2025-10-09 07:42:51', '2025-10-09 07:42:51'),
('6f6719a5-fa14-46d3-b23c-fbe13d1e249d', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AA22D83A136BB8CDAA6', 'outbound', 'text', 'Yes let’s hope', NULL, 'sent', 0, NULL, '2025-10-09 11:24:33', '2025-10-09 11:24:33'),
('714687be-49da-45b3-a94e-d5f1750a3a50', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A286DA4AA26180B7EB8', 'outbound', 'text', 'Hmmmm', NULL, 'sent', 0, NULL, '2025-10-09 04:41:25', '2025-10-09 04:41:25'),
('71bd8104-d3e1-460a-9882-422c76a20979', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACD7EEBE11D992DB05039D605C16CD3E', 'inbound', 'text', 'Khads couldn\'t move from bed so she just turned the phone', NULL, 'received', 0, NULL, '2025-10-09 11:23:02', '2025-10-09 11:23:02'),
('721eb05f-9a36-4566-a2cb-64233cef5ed0', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'ba107c0b-c214-4879-85a8-8a1090eaa352', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC2DDCB160E6C6EE897285E4A401B56C', 'inbound', 'text', 'Nothing much. You tell', NULL, 'received', 0, NULL, '2025-10-08 09:12:53', '2025-10-08 09:12:53'),
('73de5300-69bc-47be-9b1c-5f4ae2a9ad25', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'ACC23791586A4C7ED7F6BD74BE5EA8C9', 'inbound', 'text', 'Sorry?', NULL, 'received', 0, NULL, '2025-10-09 07:08:33', '2025-10-09 07:08:33'),
('752c0d61-fa11-4ee4-9fb1-58fe5b367f9a', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AF3DB3AF169C1138226', 'outbound', 'text', 'Temporary Application Id:-26082119D4VZ7WQ', NULL, 'sent', 0, NULL, '2025-10-08 16:36:47', '2025-10-08 16:36:47'),
('7572fadc-6858-4141-b5a5-4e365e0c9140', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A1426CB618656BCEC9A', 'outbound', 'text', 'Yes pls check it', NULL, 'sent', 0, NULL, '2025-10-09 08:12:52', '2025-10-09 08:12:52'),
('75c32f1e-9ed3-4f75-9f66-9bb87b8cbbbb', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd69ec9aa-a93d-4b1c-b4b4-1e0188df64a3', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A673A36AD8E49853747', 'outbound', 'text', 'LOL', NULL, 'sent', 0, NULL, '2025-10-09 08:12:38', '2025-10-09 08:12:38'),
('762f767d-b208-4f13-a67c-0615af1df75d', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AD25E7FB80433A9FC5B', 'outbound', 'text', 'Ohhh', NULL, 'sent', 0, NULL, '2025-10-09 08:15:40', '2025-10-09 08:15:40'),
('7642fa4d-394b-4ba5-b9fb-b63af9e3d1f0', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACF3AFC00948FB3929A603C651CDC456', 'inbound', 'text', 'When I get there I will see nicelyyyy🥹🥹🥹', NULL, 'received', 0, NULL, '2025-10-09 06:21:28', '2025-10-09 06:21:28'),
('76685cc3-3e0b-4fcb-845a-92251f362516', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A99A407D29B6E687EB5', 'outbound', 'text', '[Document: Invoice 1893 Sept 10.pdf]', NULL, 'sent', 0, NULL, '2025-10-09 08:11:50', '2025-10-09 08:11:50'),
('769bc226-273c-4997-a050-9b50abb7c053', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACDE629BEE8BAEA67A3FEFBB58D792B3', 'inbound', 'text', 'Wait for me to call?', NULL, 'received', 0, NULL, '2025-10-09 06:29:47', '2025-10-09 06:29:47'),
('788fcb97-3316-44ca-a8da-a5482416f1fb', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACF3515E82BE7F75FB64B21CE40D6291', 'inbound', 'text', 'You like this?', NULL, 'received', 0, NULL, '2025-10-10 08:27:32', '2025-10-10 08:27:32'),
('78dfed75-07d7-4643-b40d-5f7a2abbe7e6', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '669fb7c7-8c2f-4d4a-924b-e06d639408de', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC0AB35264E7F73DCDDB573D9C67277D', 'outbound', 'text', 'https://vt.tiktok.com/ZSU6cFC2Q/', NULL, 'sent', 0, NULL, '2025-10-09 06:48:27', '2025-10-09 06:48:27'),
('7a3f1a3b-159f-4705-9743-a3ff7a9df78d', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'efa79058-f38d-4145-a0d1-1d284ee883b6', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB0145A7CC1787BEB064B', 'outbound', 'text', 'Hello! Welcome to M.', NULL, 'sent', 0, NULL, '2025-10-10 07:18:24', '2025-10-10 07:18:24'),
('7ae016d7-8907-4415-9118-b61ecf1fcebf', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AB4D27D3FB634CFBDC3', 'outbound', 'text', 'OK', NULL, 'sent', 0, NULL, '2025-10-09 11:22:30', '2025-10-09 11:22:30'),
('7b55a8c8-eb23-499f-b919-40e5ec97f536', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACE85DDC37F7CEB6E4CD9EFD587C71BC', 'inbound', 'text', 'Have to party. Very little time', NULL, 'received', 0, NULL, '2025-10-09 08:15:08', '2025-10-09 08:15:08'),
('7bccd366-f786-46dc-8c9d-e087096f805c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC693CEDE90194B678C7E2B272B69441', 'inbound', 'text', 'Can I see pictures of each?', NULL, 'received', 0, NULL, '2025-10-09 04:38:49', '2025-10-09 04:38:49'),
('7c9ac941-5b85-402a-9b48-2a486300fc05', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3EB01CD53505DDCF721B33', 'outbound', 'text', 'Getting this?', NULL, 'sent', 0, NULL, '2025-10-10 05:06:02', '2025-10-10 05:06:02'),
('7d4c11bf-f65d-4138-9927-99b7123368a2', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '9546e5ce-767b-4289-9278-2c63403a82b3', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC7CCE7D2295058223CADEF432878B46', 'outbound', 'text', 'What is your business?', NULL, 'sent', 0, NULL, '2025-10-08 12:22:59', '2025-10-08 12:22:59'),
('7d79aa25-e8b5-406e-b6d5-09c46a09a0f9', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A491C65172080E2C0D3', 'outbound', 'text', 'Yes I am seeing. Good start', NULL, 'sent', 0, NULL, '2025-10-09 04:39:30', '2025-10-09 04:39:30'),
('7e2a45dc-bcc1-4c35-b200-f1af1f87f968', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '44f07772-8bad-45bb-85a9-373786c121f5', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3EB0710E5EF0B36F45B08C', 'inbound', 'text', 'not at 100% yet :( will be back to office tomorrow', NULL, 'received', 0, NULL, '2025-10-09 08:59:30', '2025-10-09 08:59:30'),
('7eaecf22-9a03-4268-b73a-fc8558c2cf93', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC6505EF9EDBC6564B3E1BC7AF9C3599', 'inbound', 'text', '?', NULL, 'received', 0, NULL, '2025-10-09 07:28:08', '2025-10-09 07:28:08');
INSERT INTO `messages` (`id`, `business_profile_id`, `contact_id`, `device_id`, `whatsapp_message_id`, `direction`, `message_type`, `content`, `media_url`, `status`, `is_from_bot`, `metadata`, `created_at`, `updated_at`) VALUES
('7f83435b-7933-4fa0-ba7f-92233706500b', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '7973f819-8943-4477-89c8-106c1980c7e2', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A7D48B64B8F862A0919', 'outbound', 'text', 'Have sent the Gaj also', NULL, 'sent', 0, NULL, '2025-10-09 08:12:31', '2025-10-09 08:12:31'),
('81211afd-a19f-44d5-b604-aa3201463c4a', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd69ec9aa-a93d-4b1c-b4b4-1e0188df64a3', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3ABA89B39380CF75F2D6', 'inbound', 'text', '😳', NULL, 'received', 0, NULL, '2025-10-09 07:54:28', '2025-10-09 07:54:28'),
('82ccd8c1-8fa9-46ec-8e24-746a4b49da36', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC8E87EC4672489C412ED72D5C889658', 'inbound', 'text', 'Please please press', NULL, 'received', 0, NULL, '2025-10-09 08:58:13', '2025-10-09 08:58:13'),
('82ff37ef-2244-45f6-b365-968a44247ebd', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '669fb7c7-8c2f-4d4a-924b-e06d639408de', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC2DDCB160E6C6EE897285E4A401B56C', 'outbound', 'text', 'Nothing much. You tell', NULL, 'sent', 0, NULL, '2025-10-08 09:12:53', '2025-10-08 09:12:53'),
('84c77a28-54b5-42a4-ac4e-2cd5c114c99e', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC95EF94D3EDBB279E7B7B8D1EBF4DA0', 'inbound', 'text', 'I haven\'t seen him properly yettt', NULL, 'received', 0, NULL, '2025-10-09 11:21:57', '2025-10-09 11:21:57'),
('85927ab5-6c07-443a-9e55-bea973c20a76', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB07BD6C8417FDB3C53C4', 'outbound', 'text', 'Would you be interested in seeing our *two-burner* gas cookers? They\'re compact and efficient.', NULL, 'sent', 0, NULL, '2025-10-09 07:09:17', '2025-10-09 07:09:17'),
('86cb5a89-43b3-47fa-bd5d-8385ed993487', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '42f78da9-0b01-4068-8275-d67b46d9b657', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC2B82023C6D7E02305C2589CD5BF6E9', 'inbound', 'text', 'Yes yes. Today confirm', NULL, 'received', 0, NULL, '2025-10-08 09:49:50', '2025-10-08 09:49:50'),
('86e5c66f-82da-4959-9c4b-f66386427902', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC384C8C3DF6926200761464924265E1', 'inbound', 'text', 'Hi, I wanted to get some information on what M Abdulally does', NULL, 'received', 0, NULL, '2025-10-09 04:37:01', '2025-10-09 04:37:01'),
('877b2d0f-9c7e-492d-8d51-96fbfefb7b63', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '8008e36f-98a5-4078-a21c-bdb22bc5bb58', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB0298228CFC2FF30F23C', 'outbound', 'text', 'I apologize, but I cannot find a specific product model \"603\" in our current product catalog. Our current gas cooker models include:\n\n1. Two Burner with Glass Top RT-902MM(G) - Price: රු47,200.00\n2. GF-216K Two Burner Gas Cooker - Price: රු52,510.00\n\nWould you like more information about these models? Or could you confirm the exact model number you\'re interested in? I\'m here to help you find the right product.', NULL, 'sent', 0, NULL, '2025-10-09 06:52:23', '2025-10-09 06:52:23'),
('88074a48-c941-40a8-883c-1d26a695cdb2', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACBCAF44B8918119E89DE84EC7F0BC8B', 'inbound', 'text', 'Have on the pc', NULL, 'received', 0, NULL, '2025-10-09 08:22:24', '2025-10-09 08:22:24'),
('8846488c-762b-4568-818e-02b7425c2719', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC0EDCF3FD174EEAECDA88FDC1305109', 'outbound', 'text', 'Ok will check on our system and let you know', NULL, 'sent', 0, NULL, '2025-10-09 12:25:43', '2025-10-09 12:25:43'),
('88ac7228-5e67-4ae8-968d-e60050c45924', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'dd0aac7b-7439-4dcf-b26a-248f026aed6c', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3EB02A3DF7655E46598B3D', 'inbound', 'text', 'oh Genius! :)', NULL, 'received', 0, NULL, '2025-10-10 05:16:09', '2025-10-10 05:16:09'),
('8990c8ca-ff96-4473-aac4-a9054425989c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC59DB07DE32145D58FC3F7E59D5A78E', 'inbound', 'text', 'Hello. Are you there?', NULL, 'received', 0, NULL, '2025-10-08 15:12:38', '2025-10-08 15:12:38'),
('8a5b1fd5-205d-4c5d-97e7-0cce2538b33d', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'dd0aac7b-7439-4dcf-b26a-248f026aed6c', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3EB0B196960AB3AB347BAF', 'inbound', 'text', 'Shabir that workss', NULL, 'received', 0, NULL, '2025-10-10 05:15:34', '2025-10-10 05:15:34'),
('8c11a2e1-566f-4907-8bf4-3281900d3e97', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '274e25a9-bfe9-444b-bcad-45bbda4aeed9', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3ACD780475885EAE5B9B', 'outbound', 'text', 'These are same as Supermarket rates. Can get discounts? 😀', NULL, 'sent', 0, NULL, '2025-10-09 10:07:57', '2025-10-09 10:07:57'),
('8c19b9f0-9747-43be-82bf-9bae4ea269d3', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB01979BA7ACA7FE32877', 'outbound', 'text', 'Would you prefer to know about our *most affordable* single burner options? I can share pricing and details.', NULL, 'sent', 0, NULL, '2025-10-09 07:08:45', '2025-10-09 07:08:45'),
('8c37e293-07e2-4e9b-85e7-b352d451f2d4', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '9a1e7c88-2ddf-4df2-ada3-481f9f2e4555', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC8BEB20B8EB952B30AF5ED8D89DB7A2', 'inbound', 'text', 'Alhamdolillah Shukranlillah 🙏🏻', NULL, 'received', 0, NULL, '2025-10-09 11:47:03', '2025-10-09 11:47:03'),
('8eceae0e-64fb-4044-bb4b-9f497c0ba352', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3ADD392CE51B9FCBB9B7', 'outbound', 'text', '😛', NULL, 'sent', 0, NULL, '2025-10-09 11:24:11', '2025-10-09 11:24:11'),
('8ee0c1e9-98e7-4da7-b7f4-9019b8259922', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACD2995FFC06ADB20F79A1AA23EEE16A', 'inbound', 'text', '[Document: Full Jaman Debit Note Listing (1446 - 1447).pdf]', NULL, 'received', 0, NULL, '2025-10-09 11:59:19', '2025-10-09 11:59:19'),
('90a9a841-e995-472a-bd2f-8f929bb1fb5b', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd69ec9aa-a93d-4b1c-b4b4-1e0188df64a3', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A88A759715C53884158', 'outbound', 'text', 'Testing', NULL, 'sent', 0, NULL, '2025-10-09 08:12:42', '2025-10-09 08:12:42'),
('93e644e8-ed5b-45fb-94d5-7033c8a53f97', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC1ADDA229EAE2A206B03D4FE50C6965', 'inbound', 'text', 'Single burner', NULL, 'received', 0, NULL, '2025-10-09 07:08:15', '2025-10-09 07:08:15'),
('96a91ddf-2a71-4972-8104-e716c013cf3d', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '8008e36f-98a5-4078-a21c-bdb22bc5bb58', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC03F2A9BDD3F8E72577CE77142A56CE', 'inbound', 'text', '603?', NULL, 'received', 0, NULL, '2025-10-09 06:51:49', '2025-10-09 06:51:49'),
('98cd8169-7087-40f9-8b43-3efebb58e63c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC33E71F31F186EFD4CA26844E18C85C', 'inbound', 'text', 'Little while ago', NULL, 'received', 0, NULL, '2025-10-10 07:37:44', '2025-10-10 07:37:44'),
('994798fc-53b4-4904-a14e-bfb531a52ff7', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACD61FFC8E3D3CE8DC84C26F87AD76DC', 'inbound', 'text', 'Won\'t be able to check till tonight', NULL, 'received', 0, NULL, '2025-10-09 07:47:55', '2025-10-09 07:47:55'),
('99481c14-0a47-4fa9-80de-fcba3d1e03e6', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC0061E578AF75C6EABE10ECA56FDB58', 'inbound', 'text', 'Hi, I wanted to get some information on what M Abdulally does', NULL, 'received', 0, NULL, '2025-10-09 04:32:08', '2025-10-09 04:32:08'),
('9aaab94a-140e-4c41-9dcd-def7349b004c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACC49C8EA8E481C90AB4C7BC9C9CFD46', 'inbound', 'text', '🤲🏻🤲🏻🤲🏻', NULL, 'received', 0, NULL, '2025-10-09 06:14:15', '2025-10-09 06:14:15'),
('9ab765e3-5001-4b2c-a497-62b2ea7948db', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC094D89170F5BA5AD3CBA2F84BE0BE0', 'inbound', 'text', 'Hi what\'s up?', NULL, 'received', 0, NULL, '2025-10-08 15:08:56', '2025-10-08 15:08:56'),
('9bef9c49-595a-427a-9b65-ccd8ed7b71d7', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A1A2B89A2C37CE34FB2', 'outbound', 'text', 'OK', NULL, 'sent', 0, NULL, '2025-10-09 06:22:02', '2025-10-09 06:22:02'),
('9ccd78c7-e481-460e-a271-7a5f96ea643b', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '7973f819-8943-4477-89c8-106c1980c7e2', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC5AB2D256EA393E19DE1A45B7A449CE', 'inbound', 'text', 'Hidden gems', NULL, 'received', 0, NULL, '2025-10-10 06:47:55', '2025-10-10 06:47:55'),
('9d237413-7f1f-4ece-9646-f50d2728181d', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC2211CE7504C416F71D95CAF77D8F75', 'inbound', 'text', 'Ok it came immediately', NULL, 'received', 0, NULL, '2025-10-09 04:41:13', '2025-10-09 04:41:13'),
('9e8757a1-633a-4d93-8979-48475ea4d1a9', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC1BEAF986250A1450EC6F7DD5A1FA01', 'inbound', 'text', 'This is muna bhai\'s message', NULL, 'received', 0, NULL, '2025-10-09 07:59:43', '2025-10-09 07:59:43'),
('9fa49c0c-47d6-4aa4-9bf0-6e560c007f2c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '274e25a9-bfe9-444b-bcad-45bbda4aeed9', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A44A0E4A0D37CD1AB23', 'outbound', 'text', 'Reminder about eggs', NULL, 'sent', 0, NULL, '2025-10-09 08:58:33', '2025-10-09 08:58:33'),
('a06784f7-cd5d-4a04-9a70-9a1b1884aa9a', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '39bd3957-aeb8-4288-a4f6-79c371bf99a4', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC856968192509FD270D214FFC3927C3', 'inbound', 'text', 'Correct  \" not   inch    feet \'  ok sir ,', NULL, 'received', 0, NULL, '2025-10-09 05:19:29', '2025-10-09 05:19:29'),
('a2418482-a942-439d-a651-a9c456aca73c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A9A65AFA199CB1C0156', 'outbound', 'text', 'How soon is the response coming?', NULL, 'sent', 0, NULL, '2025-10-09 04:40:08', '2025-10-09 04:40:08'),
('a2a28886-2308-4298-b1be-1c848a0349dd', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A07303C99EF196D6D61', 'outbound', 'text', 'abd****@gma****.com\n\nSent to backup', NULL, 'sent', 0, NULL, '2025-10-09 08:23:00', '2025-10-09 08:23:00'),
('a3152363-36fc-4774-9752-f857e9081e2f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A434BF0FF5EB9A230C7', 'outbound', 'text', 'Too soon is not good. Whatsapp will detect it’s a bot', NULL, 'sent', 0, NULL, '2025-10-09 04:40:27', '2025-10-09 04:40:27'),
('a4701922-8756-4f24-ab77-99fb38595aea', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd6d9b769-905c-4f0b-afa7-18c729a0a71e', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AC8414C6628FC63F013', 'outbound', 'text', 'Hi Mamaji. Hope you are feeling better. If not, there is a Hilton cake that might help 😀', NULL, 'sent', 0, NULL, '2025-10-09 10:41:33', '2025-10-09 10:41:33'),
('a4a3d99a-1d7b-44f8-8868-0ab0e01aee99', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB0B201F4782BBF13FCF9', 'outbound', 'text', 'I\'m here to help you find the *perfect kitchen appliance* or *gas equipment* for your needs!', NULL, 'sent', 0, NULL, '2025-10-09 07:02:44', '2025-10-09 07:02:44'),
('a55d4ed2-cf5d-4f0e-b688-3001b572ee39', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '59056ebc-9f69-423f-b78f-53c4d812b5da', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC5E7ABB3579F3DDC8BD901F7C1F0F1D', 'outbound', 'text', 'Shabab', NULL, 'sent', 0, NULL, '2025-10-09 07:43:39', '2025-10-09 07:43:39'),
('a5649fe0-5867-4645-b4b7-a4aff4bcf3d5', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'c32f6237-44d0-4ff6-9d86-a2dcde381268', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC4CEB1D0DA209ED18CA2AA039F72A26', 'inbound', 'text', 'I am good. What do you sell?', NULL, 'received', 0, NULL, '2025-10-08 12:02:14', '2025-10-08 12:02:14'),
('a5cda135-62a8-43e8-9eac-2feb66dc8579', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A0A9EBD380D2EA36383', 'outbound', 'text', 'OK', NULL, 'sent', 0, NULL, '2025-10-09 06:21:45', '2025-10-09 06:21:45'),
('a63a6fe7-63bf-4e96-aa73-67a6bc17194d', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '18fd539e-2ae7-4f06-8070-a6d705101ec5', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACD179562D6C07D7F4F13AEE0CDD582F', 'outbound', 'text', 'The cylinder came?', NULL, 'sent', 0, NULL, '2025-10-10 07:37:26', '2025-10-10 07:37:26'),
('a63bdddf-5275-43a8-bd4f-c71ed1a04a7b', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '44f07772-8bad-45bb-85a9-373786c121f5', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3EB0D306E6125AFEAEAFD2', 'inbound', 'text', 'file is uploading', NULL, 'received', 0, NULL, '2025-10-09 08:59:38', '2025-10-09 08:59:38'),
('a64ef2ee-8952-4fec-858e-57d212bcdf68', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '44f07772-8bad-45bb-85a9-373786c121f5', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACD3CA79229CF95604BE6E90412F952C', 'outbound', 'text', 'I need this again ma\'am', NULL, 'sent', 0, NULL, '2025-10-09 05:01:28', '2025-10-09 05:01:28'),
('a68b660c-44e6-4604-bf5a-219a390bdb64', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC4D5564A36E715FDFE634F9F12EB4B7', 'inbound', 'text', 'They will be there until Sat some day', NULL, 'received', 0, NULL, '2025-10-09 11:19:31', '2025-10-09 11:19:31'),
('a703f9a1-14b1-4cb9-9bfb-736e8f506d77', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '099427db-0ece-4b53-a1e1-268658d9109d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC029E287816BD41C31F1F8010218623', 'outbound', 'text', '[Image]', NULL, 'sent', 0, NULL, '2025-10-10 09:58:38', '2025-10-10 09:58:38'),
('a7b70865-4424-49ca-97c5-e95f1b3e5b30', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A5A03EAAC694AAD0862', 'outbound', 'text', 'From hostgator. I’ll check and see what I can find', NULL, 'sent', 0, NULL, '2025-10-09 08:16:25', '2025-10-09 08:16:25'),
('aa1ca8e6-12aa-4d79-a3c4-6da57ad05802', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'bbde3b33-de57-48e2-be5e-94e7d6c88c01', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A6EAC3244BCC9089E7E', 'inbound', 'text', 'But can you just check', NULL, 'received', 0, NULL, '2025-10-09 07:45:49', '2025-10-09 07:45:49'),
('aa4ef04e-d131-4f86-8f2e-231b5f1ebce9', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '39bd3957-aeb8-4288-a4f6-79c371bf99a4', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC760AA495DB1D49444CD2981A4B5FD8', 'inbound', 'text', '[Image]', NULL, 'received', 0, NULL, '2025-10-09 05:16:19', '2025-10-09 05:16:19'),
('ac8bc139-3155-4e73-9858-dfd8c1f1e715', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '7973f819-8943-4477-89c8-106c1980c7e2', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AFF44B49D3A2452B6B0', 'outbound', 'text', 'Mach. What’s the smartwatch you have?', NULL, 'sent', 0, NULL, '2025-10-10 06:35:32', '2025-10-10 06:35:32'),
('aca18a93-3432-43cc-ac57-3179ba874302', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC2DCA962C619C364766E16773341947', 'inbound', 'text', 'Just saw his frame in the crib , and some hair, but not as much as nafu\'s hairr', NULL, 'received', 0, NULL, '2025-10-09 11:22:17', '2025-10-09 11:22:17'),
('acd775bf-4d97-4893-a0ea-7a6653723a0c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd69ec9aa-a93d-4b1c-b4b4-1e0188df64a3', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AD48752947B3F866C5C', 'outbound', 'text', 'OK great stuff', NULL, 'sent', 0, NULL, '2025-10-09 06:53:19', '2025-10-09 06:53:19'),
('ae0281e2-e54e-4623-84f7-4ee2cc854e50', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '39bd3957-aeb8-4288-a4f6-79c371bf99a4', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC387E27E73CDD4FFB26BC770CC6FB76', 'inbound', 'text', 'Iron mash  04\'   01 feel  390/=', NULL, 'received', 0, NULL, '2025-10-09 05:17:56', '2025-10-09 05:17:56'),
('af1bcfeb-0de4-418b-ac4a-59649632d874', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACF9C6E192289E1A064DB9ECB9E0AC8F', 'inbound', 'text', 'Ali Asger or Abbas!', NULL, 'received', 0, NULL, '2025-10-09 06:14:11', '2025-10-09 06:14:11'),
('af3ee0af-0348-48e4-a878-c58dcf66134a', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC14C202BF373B746B8148F8E0D96686', 'inbound', 'text', '[Voice Note]', NULL, 'received', 0, NULL, '2025-10-09 07:02:31', '2025-10-09 07:02:31'),
('b068442e-787e-49eb-9c63-913e49418fc9', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '7973f819-8943-4477-89c8-106c1980c7e2', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A49ABEE2E1559DADD76', 'outbound', 'text', '[Document: Invoice 1893 Sept 10.pdf]', NULL, 'sent', 0, NULL, '2025-10-09 08:12:24', '2025-10-09 08:12:24'),
('b0953a81-8c28-48d4-be0a-409718213451', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '274e25a9-bfe9-444b-bcad-45bbda4aeed9', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AC61B32ED339A0B6139', 'outbound', 'text', 'Will revert', NULL, 'sent', 0, NULL, '2025-10-09 10:14:59', '2025-10-09 10:14:59'),
('b11b00e5-f299-43c3-b65e-5ecd56b26ddb', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC0F1E11EED461585E68729E631FB54D', 'inbound', 'text', 'More than kimbula don\'t mind a nice masala kottu', NULL, 'received', 0, NULL, '2025-10-09 09:02:35', '2025-10-09 09:02:35'),
('b444051d-877c-4002-bc27-82ded9c673cb', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'ba107c0b-c214-4879-85a8-8a1090eaa352', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACF5043D6F9571804F0E6AEB1885401B', 'inbound', 'text', '[Image]', NULL, 'received', 0, NULL, '2025-10-10 07:55:16', '2025-10-10 07:55:16'),
('b4544f43-b327-4bb6-946f-f58c36a82c19', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACD3CC83FCD18156A321A09F78332B5D', 'inbound', 'text', 'Yes my love', NULL, 'received', 0, NULL, '2025-10-10 05:06:12', '2025-10-10 05:06:12'),
('b5684fcf-d056-436a-b22f-25c9ba8e8a35', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB0619E5D6197DCFCF9AD', 'outbound', 'text', '', NULL, 'sent', 0, NULL, '2025-10-09 07:08:20', '2025-10-09 07:08:20'),
('b56d63c9-f824-438c-92aa-d70095e64120', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A8FEAF7759A897496F8', 'outbound', 'text', 'Ordered. Will come shortly. Will bring change for 5k', NULL, 'sent', 0, NULL, '2025-10-10 05:17:33', '2025-10-10 05:17:33'),
('b5ff80a2-dfb5-4d02-9b87-d7b5a804eab7', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC057B15CA7BC56243F50F115D0BEB9E', 'inbound', 'text', 'Some cute clothes for suree', NULL, 'received', 0, NULL, '2025-10-09 06:21:54', '2025-10-09 06:21:54'),
('b685a5d8-5837-4fdc-bbc4-de221c94daf5', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB058F55265893082A8DF', 'outbound', 'text', 'I apologize, but I cannot actually show you pictures directly. As a sales representative, I can describe the products in detail, but image sharing isn\'t possible in this conversation. \n\nHowever, I recommend a few ways you can see the product images:\n1. Visit M Abdulally\'s showroom\n2. Check their Instagram page\n3. Contact their sales team directly for product brochures\n\nWould you like me to describe the appearance of the two-burner models in more detail? I can tell you about their design, color, and key visual features.', NULL, 'sent', 0, NULL, '2025-10-09 04:38:53', '2025-10-09 04:38:53'),
('b7cba8ea-a71d-4a1d-b193-39f06241a143', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AF2DDC26A3E7E54C440', 'outbound', 'text', 'Any photos?', NULL, 'sent', 0, NULL, '2025-10-09 11:21:49', '2025-10-09 11:21:49'),
('b7ec7f42-b232-4484-9729-4bcc65e17133', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC62C248D4178983DF06F152095B7F32', 'inbound', 'text', 'Oooh I got a reply! What should I say', NULL, 'received', 0, NULL, '2025-10-09 04:37:25', '2025-10-09 04:37:25'),
('b8a604e9-3e80-4a7d-abbe-068f64324be1', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '274e25a9-bfe9-444b-bcad-45bbda4aeed9', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A65D4C46764203DF2FA', 'outbound', 'text', 'Oh OK', NULL, 'sent', 0, NULL, '2025-10-09 10:14:57', '2025-10-09 10:14:57'),
('b8cf3c51-91db-4d8e-a62b-77fd7c184de7', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC614A20229D3796DA680FF7F1F05AFA', 'inbound', 'text', 'Okay shall I go shoppingggg', NULL, 'received', 0, NULL, '2025-10-09 06:14:20', '2025-10-09 06:14:20'),
('b8dc695a-faae-493c-89c5-96b5faeda5db', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd7eaa20f-10a6-47a7-b719-bc4ba966d579', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A42A7888AA5A37F1517', 'outbound', 'text', '9am', NULL, 'sent', 0, NULL, '2025-10-08 10:39:09', '2025-10-08 10:39:09'),
('b950e545-6223-4dae-a1ae-0af04de27f7c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A54706D875EEEB6D29F', 'outbound', 'text', 'LOL', NULL, 'sent', 0, NULL, '2025-10-09 11:20:57', '2025-10-09 11:20:57'),
('bb06ac71-c338-40d5-82cd-f7be90ccc089', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACEF000ABD41868B1C2AC1EE8D3D966D', 'inbound', 'text', '💙💙', NULL, 'received', 0, NULL, '2025-10-09 11:23:54', '2025-10-09 11:23:54'),
('bb8c280c-2feb-44e1-9239-8c9c24d7ff84', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AB05DA78E017ADF6994', 'outbound', 'text', '[Document: Invoice 1886 Aug 10.pdf]', NULL, 'sent', 0, NULL, '2025-10-09 08:11:49', '2025-10-09 08:11:49'),
('bbf1f053-a282-44e2-92e5-ef5090eb8f9b', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACAA6F8978FA623510F50FBCD41B5A6E', 'inbound', 'text', 'That I don\'t have on the phone', NULL, 'received', 0, NULL, '2025-10-09 08:22:24', '2025-10-09 08:22:24'),
('bc9dffa0-886d-4d7c-a9ab-73caa393a759', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A3F9C8C7E1B31E4572A', 'outbound', 'text', 'Hehehe', NULL, 'sent', 0, NULL, '2025-10-09 11:23:58', '2025-10-09 11:23:58'),
('bd611ef2-2695-4196-a612-aa62631de85f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACFA6180B308CEC16F73863E3C6D7F77', 'inbound', 'text', '😊😁', NULL, 'received', 0, NULL, '2025-10-09 11:22:20', '2025-10-09 11:22:20'),
('becc3baf-352d-4d5a-80ed-26fd31dcb9e1', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '321f341d-4337-492e-b9aa-6e43ce25c8bc', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACA4A65D4EAFCF8DD137AEC325AAA2EF', 'outbound', 'text', 'OK', NULL, 'sent', 0, NULL, '2025-10-10 07:33:11', '2025-10-10 07:33:11'),
('bed6347b-744a-4231-992e-883c075b3958', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACD3D434644CCF02A9C7D628C5E90A1F', 'inbound', 'text', 'Very soon', NULL, 'received', 0, NULL, '2025-10-09 04:40:15', '2025-10-09 04:40:15'),
('bfb784c2-7ab3-48d7-bc80-6bff40fcea80', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '9ed5d629-a589-40b2-bcdb-306ed6af4863', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A84EB068118E7E26861', 'outbound', 'text', 'Bro. reminder about the slash.lk emails OK', NULL, 'sent', 0, NULL, '2025-10-08 09:42:49', '2025-10-08 09:42:49'),
('bff457a5-09ee-4131-8a58-fbe534a59456', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'c32f6237-44d0-4ff6-9d86-a2dcde381268', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC5BA18BBEF868D6D317D5E7FF395F09', 'inbound', 'text', 'Hey how are you?', NULL, 'received', 0, NULL, '2025-10-08 15:06:13', '2025-10-08 15:06:13'),
('c01969eb-1d03-4b55-93e9-909917a0411a', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'c32f6237-44d0-4ff6-9d86-a2dcde381268', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC1B6FF4A4E70315AF2B96E601F6AEB9', 'inbound', 'text', 'What do you sell?', NULL, 'received', 0, NULL, '2025-10-08 12:05:03', '2025-10-08 12:05:03'),
('c028994a-85ad-4978-a485-00b6d5886589', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '44f07772-8bad-45bb-85a9-373786c121f5', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3ADC9B94854A710D2CBA', 'outbound', 'text', 'Send asap OK', NULL, 'sent', 0, NULL, '2025-10-09 08:57:40', '2025-10-09 08:57:40'),
('c0f0c497-9756-4e9b-b2a5-be8107a24667', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACCE858BF2F3C763D5EEE084E1677449', 'inbound', 'text', 'Okay😘', NULL, 'received', 0, NULL, '2025-10-09 04:36:31', '2025-10-09 04:36:31'),
('c24257a8-a769-4e6a-b278-945bc507c762', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AE5D24D67470DE37B63', 'outbound', 'text', 'OK making an order on Uber Eats', NULL, 'sent', 0, NULL, '2025-10-09 09:02:52', '2025-10-09 09:02:52'),
('c380cedc-9356-4419-8ac3-31ebcb2c9979', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '4e9ce6dd-e84c-4d44-a682-4bcadf2200a5', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3EB09AECB1C090BA05E186', 'outbound', 'text', 'Hello Pops, how are you?', NULL, 'sent', 0, NULL, '2025-10-09 11:06:12', '2025-10-09 11:06:12'),
('c407be61-3942-4676-9cb2-e789c646e7b6', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd69ec9aa-a93d-4b1c-b4b4-1e0188df64a3', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A172A89E555DE369726', 'outbound', 'text', 'Send a message to this number. Ask about what M Abdulally does', NULL, 'sent', 0, NULL, '2025-10-09 06:54:11', '2025-10-09 06:54:11'),
('c71c9e17-f2f3-4814-8e9f-3d3509131a9f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '44f07772-8bad-45bb-85a9-373786c121f5', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3EB0E87905EFBAD2A516C1', 'inbound', 'text', '[Document: three-wheel-sticker-2025-print.pdf]', NULL, 'received', 0, NULL, '2025-10-09 08:59:49', '2025-10-09 08:59:49'),
('c7f2e030-a5cc-42c2-8041-e3bacef4679b', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '274e25a9-bfe9-444b-bcad-45bbda4aeed9', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACC55CBA2313328CB64FD6BBC1651301', 'inbound', 'text', 'Supermarket price is\nLarge 52.00\nXL 54.00', NULL, 'received', 0, NULL, '2025-10-09 10:14:36', '2025-10-09 10:14:36'),
('c8ec192f-0dc9-474e-9cb9-d8a7ebb30961', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '44f07772-8bad-45bb-85a9-373786c121f5', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A5081344361827F594E', 'outbound', 'text', 'OK', NULL, 'sent', 0, NULL, '2025-10-09 08:59:41', '2025-10-09 08:59:41'),
('c927b049-22b8-4dc9-830e-e838840ccb65', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACCE696533FD635C3096F23846103EC6', 'inbound', 'text', '[Image]', NULL, 'received', 0, NULL, '2025-10-09 07:56:42', '2025-10-09 07:56:42'),
('c99a9dc0-83db-4088-bacb-413aa84134da', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '7973f819-8943-4477-89c8-106c1980c7e2', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A6FDB1CACDD4F5840A1', 'outbound', 'text', '[Document: Invoice 1906 Oct 2.pdf]', NULL, 'sent', 0, NULL, '2025-10-09 08:12:23', '2025-10-09 08:12:23'),
('ca0207d7-aa1c-447d-9b20-791a729421a2', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '9ed5d629-a589-40b2-bcdb-306ed6af4863', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AA1CCE6DBE49502990C', 'outbound', 'text', 'Let me know by tomorrow latest', NULL, 'sent', 0, NULL, '2025-10-08 09:42:50', '2025-10-08 09:42:50'),
('ca168862-de30-417d-af9c-49ca97cd31fb', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '59056ebc-9f69-423f-b78f-53c4d812b5da', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC3C7A1B660BBE7B63C7273A8E1E42E0', 'outbound', 'text', 'Are you able to check?', NULL, 'sent', 0, NULL, '2025-10-09 07:43:48', '2025-10-09 07:43:48'),
('ca59b617-e6ea-4819-abbf-9ec3f00ba3ab', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3ABCC710108AE4CF033B', 'outbound', 'text', 'Teehee', NULL, 'sent', 0, NULL, '2025-10-09 04:33:03', '2025-10-09 04:33:03'),
('cc50e9af-b4f1-43aa-b8b3-347870d4f998', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A3606069AC2DAB8CCB8', 'outbound', 'text', 'OK', NULL, 'sent', 0, NULL, '2025-10-09 08:15:41', '2025-10-09 08:15:41'),
('cdec3269-fa51-4041-a53b-b3d272202097', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '274e25a9-bfe9-444b-bcad-45bbda4aeed9', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A4B26DCC85295692C80', 'outbound', 'text', 'Thanks', NULL, 'sent', 0, NULL, '2025-10-09 10:15:06', '2025-10-09 10:15:06'),
('ce8158aa-164e-4e9b-9c40-264a0a82555f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '44f07772-8bad-45bb-85a9-373786c121f5', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A1688F54A8386016D48', 'outbound', 'text', 'Get him fully recovered and only send pls', NULL, 'sent', 0, NULL, '2025-10-09 08:59:55', '2025-10-09 08:59:55'),
('ce96401b-357d-42f5-abad-1a740d101ca0', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd6d9b769-905c-4f0b-afa7-18c729a0a71e', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A5613F36645815F53ED', 'outbound', 'text', 'Will drop it off on the way home', NULL, 'sent', 0, NULL, '2025-10-09 10:41:37', '2025-10-09 10:41:37'),
('d0c6e403-5f51-4dcc-9193-b637474e8dff', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC1240FB979D44279F8A1FAD81F7CEFF', 'inbound', 'text', 'Spoke to khads also!', NULL, 'received', 0, NULL, '2025-10-09 11:19:18', '2025-10-09 11:19:18'),
('d1595ecb-fda5-4c5c-8001-435fa783181b', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A6A57971FD6D9FA9E23', 'outbound', 'text', 'Meaning your Dad', NULL, 'sent', 0, NULL, '2025-10-09 11:22:50', '2025-10-09 11:22:50'),
('d1aea5ec-504f-4748-95c8-a1e27aef2587', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '274e25a9-bfe9-444b-bcad-45bbda4aeed9', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A3567E60E036A563663', 'outbound', 'text', 'Otherwise easier to get from Supermarket', NULL, 'sent', 0, NULL, '2025-10-09 10:08:16', '2025-10-09 10:08:16'),
('d1c2b560-4956-4d2d-9b60-fe4e7d5bcad2', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '26445b49-3956-4511-b656-e593f4a4c184', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3EB0114F08404573EC7C1A', 'outbound', 'text', 'Hello Sakina, how are you?', NULL, 'sent', 0, NULL, '2025-10-09 11:05:42', '2025-10-09 11:05:42'),
('d1c65720-1fc2-41db-9e44-6a91a0a0904b', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '8008e36f-98a5-4078-a21c-bdb22bc5bb58', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB0241EBFD352149D5869', 'outbound', 'text', 'Hello! I\'d be happy to tell you about our products. M Abdulally specializes in Rinnai branded kitchen appliances and gas equipment. We offer a range of products including:\n\n1. Table Top Cookers:\n- Two Burner with Glass Top RT-902MM(G)\n- GF-216K Two Burner Gas Cooker\n\n2. Water Heaters:\n- Pearl 450P Electric Instant Water Heater\n- REU-VCM2837FFC-GEN Gas Powered Water Heater\n\nWould you like more details about any specific type of appliance? I can help you find the right product for your needs.', NULL, 'sent', 0, NULL, '2025-10-09 06:51:32', '2025-10-09 06:51:32'),
('d397a852-6f60-42db-81b3-ac1191ce7891', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AA1E3250DF31D3649BB', 'outbound', 'text', 'Inshallah', NULL, 'sent', 0, NULL, '2025-10-09 11:25:48', '2025-10-09 11:25:48'),
('d5983f23-4cdf-414d-bf64-4ddfd164871a', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'efa79058-f38d-4145-a0d1-1d284ee883b6', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '3EB051FDBB5B231F141DCB', 'outbound', 'text', '', NULL, 'sent', 0, NULL, '2025-10-10 07:07:16', '2025-10-10 07:07:16'),
('d6066756-e9a7-430e-8261-9e656a21823f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '18fd539e-2ae7-4f06-8070-a6d705101ec5', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACF436F8940F2D9E1AFD1A8E3113BF46', 'outbound', 'text', 'Ok', NULL, 'sent', 0, NULL, '2025-10-10 07:55:53', '2025-10-10 07:55:53'),
('d6229168-4f0a-49e2-805e-9af021fad5da', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC162945F9986492F8019D82D099462C', 'inbound', 'text', 'Loooool', NULL, 'received', 0, NULL, '2025-10-09 11:19:01', '2025-10-09 11:19:01'),
('d7da402b-4c14-4b2a-8039-5bd8aaeeb266', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '7973f819-8943-4477-89c8-106c1980c7e2', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC92C0D00559B4BE2DCAE73086F04F7E', 'inbound', 'text', 'Ok bro..', NULL, 'received', 0, NULL, '2025-10-09 08:14:57', '2025-10-09 08:14:57'),
('d90c9eb2-83e5-4db4-be1d-02035369b159', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '39bd3957-aeb8-4288-a4f6-79c371bf99a4', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC7B497F67F15A4A5F57FD8520D9C022', 'inbound', 'text', '[Image]', NULL, 'received', 0, NULL, '2025-10-09 05:16:18', '2025-10-09 05:16:18'),
('d996e612-bc43-4e29-9593-2e842f296259', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC049C299EA27EEC3A1200760B004768', 'inbound', 'text', '😂😂', NULL, 'received', 0, NULL, '2025-10-09 09:02:19', '2025-10-09 09:02:19'),
('da14b613-43ea-4aa1-9ec5-578298d97b73', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '8008e36f-98a5-4078-a21c-bdb22bc5bb58', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AF17B32407C6AC4EE33', 'outbound', 'text', '94777965255', NULL, 'sent', 0, NULL, '2025-10-09 06:50:35', '2025-10-09 06:50:35'),
('dad87012-8f40-4b29-8266-716010138eab', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'efa79058-f38d-4145-a0d1-1d284ee883b6', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '2A6B777BDF6B362BF3C9', 'inbound', 'text', '[Image]', NULL, 'received', 0, NULL, '2025-10-10 07:07:03', '2025-10-10 07:07:03'),
('dc133755-2d18-4fce-9c76-b4090eae97f1', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A3049B2728BCD4A5E5F', 'outbound', 'text', 'I already told him', NULL, 'sent', 0, NULL, '2025-10-09 06:30:02', '2025-10-09 06:30:02'),
('dc9f8ae5-5a33-4381-83f9-16aa6207aa44', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3ACACCCBC2B49DB10BFB', 'outbound', 'text', 'Oh yea?', NULL, 'sent', 0, NULL, '2025-10-09 11:19:25', '2025-10-09 11:19:25'),
('dd9d3bb2-d113-475b-9651-0bc2865d6f21', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '0de5e399-c07f-4ae3-8638-9cea7eeb8ca6', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'A54D66FC33E65334E2A12F1337B76933', 'inbound', 'text', 'Good afternoon sir,\nDid you clean the corner store we can\'t come everyday because there are going transport cost 8000 so we can\'t come everyday there for first clean and inform as after that we will start our work also we did extra works so we\'ll charge payment for that also', NULL, 'received', 0, NULL, '2025-10-10 07:40:28', '2025-10-10 07:40:28'),
('dedb0174-27de-41cc-a3b0-92b0ea039026', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '42f78da9-0b01-4068-8275-d67b46d9b657', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3EB06C0523E7B03A0777EB', 'outbound', 'text', 'OK sir', NULL, 'sent', 0, NULL, '2025-10-08 10:01:45', '2025-10-08 10:01:45'),
('e29d04df-0d51-4172-b686-84d314af4d9f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'c32f6237-44d0-4ff6-9d86-a2dcde381268', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC7CCE7D2295058223CADEF432878B46', 'inbound', 'text', 'What is your business?', NULL, 'received', 0, NULL, '2025-10-08 12:22:59', '2025-10-08 12:22:59'),
('e3bd2eec-479f-47e1-a95d-eb1e09c5d486', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACCE1059D0D4357709C12153ABCD5BF5', 'inbound', 'text', 'Hi yess', NULL, 'received', 0, NULL, '2025-10-10 07:37:38', '2025-10-10 07:37:38'),
('e3c3ccbe-603e-4679-b572-9623226440e1', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'dd0aac7b-7439-4dcf-b26a-248f026aed6c', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3EB01A872F17B970590D1C', 'inbound', 'text', 'how did you do it?', NULL, 'received', 0, NULL, '2025-10-10 05:15:38', '2025-10-10 05:15:38'),
('e53c083f-5311-4696-b47f-12e83a0c645e', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '7973f819-8943-4477-89c8-106c1980c7e2', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACB0B7827A30FB964E7ADD980DC62C17', 'inbound', 'text', 'Yes', NULL, 'received', 0, NULL, '2025-10-10 06:48:43', '2025-10-10 06:48:43'),
('e7165bd2-5696-47a0-a0f1-78cdc6792c34', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A088C9E17A58EC10775', 'outbound', 'text', 'Nice', NULL, 'sent', 0, NULL, '2025-10-09 11:21:25', '2025-10-09 11:21:25'),
('e74d059a-c31c-4053-9360-a7ba5b738074', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '2d825db2-370f-4fc9-933f-0ff545d745ad', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC2AAB01A48F41F8562920425154579C', 'outbound', 'text', '[Image]', NULL, 'sent', 0, NULL, '2025-10-09 09:24:23', '2025-10-09 09:24:23'),
('e7d0b958-456f-4114-89a7-118874138e89', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACDA057A16627B71CE5CFA03992D0734', 'inbound', 'text', 'Her anesthesia was wearing off so pain was little coming but not unbearable she said', NULL, 'received', 0, NULL, '2025-10-09 11:20:01', '2025-10-09 11:20:01'),
('e86e2043-937e-4c0c-bd2b-85c82e3abcfc', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A972B6BB53C770ADD60', 'outbound', 'text', 'Checked, it’s not SEZ', NULL, 'sent', 0, NULL, '2025-10-09 08:32:25', '2025-10-09 08:32:25'),
('e900e306-afbd-41e4-a6e3-16b3f9a2969f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACBBC5B45BF78CEC4FE37F0B729048FB', 'inbound', 'text', 'Hahah he said can nicely play some sports', NULL, 'received', 0, NULL, '2025-10-09 11:24:22', '2025-10-09 11:24:22'),
('e92609b8-6d13-41af-b7b3-d83610df9b80', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'db978d6a-7c2f-4883-a016-52f46a8afa3f', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AD0673432C63E265549', 'outbound', 'text', 'Sabaks are till afternoon only. Don’t party so much after that.', NULL, 'sent', 0, NULL, '2025-10-09 08:13:10', '2025-10-09 08:13:10'),
('e9853628-866e-4d3f-82f7-417152139ff8', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '8008e36f-98a5-4078-a21c-bdb22bc5bb58', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC9690F4F3FD1FB173FD942AFB71DFE9', 'inbound', 'text', '603 cooker price?', NULL, 'received', 0, NULL, '2025-10-09 06:52:14', '2025-10-09 06:52:14'),
('eb4ba1c5-9dcd-44aa-acf0-c6287dc5459e', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '9546e5ce-767b-4289-9278-2c63403a82b3', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC587711091B03F567586B9CAB15C607', 'outbound', 'text', 'What\'s your business?', NULL, 'sent', 0, NULL, '2025-10-08 12:25:32', '2025-10-08 12:25:32'),
('eb5864df-35d5-4fb4-a679-c2e1cf2e55f1', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'dd0aac7b-7439-4dcf-b26a-248f026aed6c', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3EB0EF71A2D6A4434A1020', 'inbound', 'text', 'i shall do the same for the rest! thank you! :D', NULL, 'received', 0, NULL, '2025-10-10 05:16:30', '2025-10-10 05:16:30'),
('ec13c183-5480-492d-ab63-f7e5477d0858', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '74342c9a-06c8-400a-93ff-ee5b303fb987', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A036DCAE66B897DAB7A', 'outbound', 'text', 'Done', NULL, 'sent', 0, NULL, '2025-10-08 09:28:55', '2025-10-08 09:28:55'),
('edcc17fe-2373-426a-b0a5-ad72ff1486b6', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC68D4ADAEE1F81245BED3F35A6200B6', 'inbound', 'text', 'But he said girl or boy he wouldn\'t have minded and loves both', NULL, 'received', 0, NULL, '2025-10-09 11:24:44', '2025-10-09 11:24:44'),
('edd2e99d-9b15-43a6-9672-b56c63281acd', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '8008e36f-98a5-4078-a21c-bdb22bc5bb58', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', 'AC5697A5FFB83CA9AE61CF22289D5F80', 'inbound', 'text', '603e', NULL, 'received', 0, NULL, '2025-10-09 06:52:41', '2025-10-09 06:52:41'),
('ef232ad3-721e-4b1d-8086-07059710096c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '099427db-0ece-4b53-a1e1-268658d9109d', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC191A8F821A7C2FBFE0AF81AED32CE6', 'outbound', 'text', 'Pls send saman for delivery', NULL, 'sent', 0, NULL, '2025-10-10 07:17:10', '2025-10-10 07:17:10'),
('f04ebd23-423f-44cd-a8f9-bed9e8aaf5c6', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC4C12D1541FB79F8CDD33607562CCA5', 'inbound', 'text', 'Plus let\'s see what she needss', NULL, 'received', 0, NULL, '2025-10-09 06:21:59', '2025-10-09 06:21:59'),
('f06e3d63-79c5-46bb-aa0b-fbc6f81b3680', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd69ec9aa-a93d-4b1c-b4b4-1e0188df64a3', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A53764E602E4E0E9456', 'outbound', 'text', 'They will be going for salgirah to Surat?', NULL, 'sent', 0, NULL, '2025-10-09 06:53:29', '2025-10-09 06:53:29'),
('f0c9a68c-48cf-4cb5-a869-885c5376c126', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC8BC0DA3226FF8921E3937A8D53401A', 'inbound', 'text', 'This was just after we got the news😁😁', NULL, 'received', 0, NULL, '2025-10-09 11:23:37', '2025-10-09 11:23:37'),
('f1cc7ab4-7c1b-4ae3-bd34-8e8bb1df8792', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '7973f819-8943-4477-89c8-106c1980c7e2', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A61932C62C7049D38AB', 'outbound', 'text', '[Document: Invoice 1896 Sept 28.pdf]', NULL, 'sent', 0, NULL, '2025-10-09 08:12:23', '2025-10-09 08:12:23'),
('f20680be-22ca-4ad9-9a81-53c31cc5717b', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'fb6b2854-8ea9-4c26-92e9-3027ec3488d1', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACC9D298D3AE232F79BF68E586C22258', 'outbound', 'text', '[Image]', NULL, 'sent', 0, NULL, '2025-10-10 10:14:02', '2025-10-10 10:14:02'),
('f3320398-3ec9-4191-974c-d1de536ac271', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AC1ED44DF9504744168', 'outbound', 'text', 'OK', NULL, 'sent', 0, NULL, '2025-10-09 06:30:22', '2025-10-09 06:30:22'),
('f574beec-8720-431f-ac77-fd2b7541df01', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACED5C0E4C1FF6F3E76138FE1DA5067B', 'inbound', 'text', 'And when I video called he had a big smile on his face', NULL, 'received', 0, NULL, '2025-10-09 11:23:48', '2025-10-09 11:23:48'),
('f648be38-c2f0-40f9-b7eb-b542cc0580fb', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'd69ec9aa-a93d-4b1c-b4b4-1e0188df64a3', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A00BD434B0C37B6A575', 'inbound', 'text', 'You made mums no an ai secretary for Ma Abdul ally', NULL, 'received', 0, NULL, '2025-10-09 07:54:25', '2025-10-09 07:54:25'),
('f7d35ad8-336d-4f05-8fa7-fb0c91179b3a', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A9F0739F4688199270F', 'outbound', 'text', 'How’s Abba doing?', NULL, 'sent', 0, NULL, '2025-10-09 11:22:47', '2025-10-09 11:22:47'),
('f89f3d55-a999-4f78-8a3b-d1d31357c8e2', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'efa79058-f38d-4145-a0d1-1d284ee883b6', 'd55b2b92-ed8b-4801-90a3-29633c87cd4a', '2A4B8FF6DAAD37A6CBAB', 'inbound', 'text', '[Image]', NULL, 'received', 0, NULL, '2025-10-10 07:18:13', '2025-10-10 07:18:13'),
('f8da831b-3493-4aca-bb44-0ea55280fbb0', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A910C739B048E950556', 'outbound', 'text', 'Good', NULL, 'sent', 0, NULL, '2025-10-09 11:23:59', '2025-10-09 11:23:59'),
('f9366115-26ce-4344-bf29-d198c3de8817', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '069260cf-5452-4b44-8833-1d044c145c72', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ACABE607F429D85F775F8813C26ED6F0', 'inbound', 'text', 'HAIDERBHAI N VORA\n4-A, PARK PALACE, SARITAKUNJ SOCIETY, RAJNAGAR CHAR RASTA, PALDI, AHMEDABAD, GUJARAT. 380007', NULL, 'received', 0, NULL, '2025-10-08 16:06:54', '2025-10-08 16:06:54'),
('fa04e13a-367c-4c10-8bfa-5fabf1dcb3dd', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC3B4988F95157B644783AF1F610124C', 'inbound', 'text', 'Moiz\'s genesss', NULL, 'received', 0, NULL, '2025-10-09 11:20:35', '2025-10-09 11:20:35'),
('fa2c93c2-94d8-4a9b-bcf1-fe6e8efbb00c', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3AA201C7963A84D26033', 'outbound', 'text', 'OK', NULL, 'sent', 0, NULL, '2025-10-09 11:25:13', '2025-10-09 11:25:13'),
('fbb40143-dbcc-4902-af72-7ec9d1434b3a', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC8CCE9986EEFCB347756B75F1391610', 'inbound', 'text', 'I don\'t know!!!!', NULL, 'received', 0, NULL, '2025-10-09 06:21:11', '2025-10-09 06:21:11'),
('fd0b3150-4ab0-4141-b669-1aa7ef192b84', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC57024CF2B7034996502D2139628098', 'inbound', 'text', 'Oh I asked something and got a replyy', NULL, 'received', 0, NULL, '2025-10-09 04:38:28', '2025-10-09 04:38:28'),
('fdd51639-b4b7-46c3-9e72-3aec3e9d07bd', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A54DBC97953D2645248', 'outbound', 'text', '😀', NULL, 'sent', 0, NULL, '2025-10-09 11:25:25', '2025-10-09 11:25:25'),
('fe5f7bd2-1354-410a-887a-af6f436e35de', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'dd0aac7b-7439-4dcf-b26a-248f026aed6c', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', '3A01CCDB497142737F8E', 'outbound', 'text', 'I asked chatgpt 😆', NULL, 'sent', 0, NULL, '2025-10-10 05:16:01', '2025-10-10 05:16:01'),
('fef325bc-28f1-4347-b3ea-44d549e961d7', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', '38e720fc-996e-488c-b8b7-c6307da3af88', 'f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'AC33C7A420D96E36BF76ACAD18593974', 'inbound', 'text', 'I want to seeeeee himmmmm', NULL, 'received', 0, NULL, '2025-10-09 11:26:03', '2025-10-09 11:26:03');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(36) NOT NULL,
  `subscription_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `status` enum('pending','succeeded','failed','refunded','processing') DEFAULT 'pending',
  `payment_type` enum('subscription','addon','overage','credit_purchase','one_time') DEFAULT 'subscription',
  `description` text DEFAULT NULL,
  `payhere_order_id` varchar(255) DEFAULT NULL,
  `payhere_payment_id` varchar(255) DEFAULT NULL,
  `payhere_method` varchar(50) DEFAULT NULL,
  `payhere_status_code` varchar(10) DEFAULT NULL,
  `payhere_md5sig` varchar(255) DEFAULT NULL,
  `payhere_status_message` text DEFAULT NULL,
  `payhere_card_holder` varchar(255) DEFAULT NULL,
  `payhere_card_no` varchar(20) DEFAULT NULL,
  `invoice_number` varchar(50) DEFAULT NULL,
  `invoice_url` varchar(500) DEFAULT NULL,
  `attempted_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `refund_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personas`
--

CREATE TABLE `personas` (
  `id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `ai_instructions` text DEFAULT NULL,
  `ai_model` varchar(50) DEFAULT 'gpt-4o-mini',
  `tone` varchar(50) DEFAULT NULL,
  `response_style` varchar(50) DEFAULT NULL,
  `is_system` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `preferred_language` varchar(50) DEFAULT NULL COMMENT 'Preferred language for responses (e.g., en, si, ta, auto). NULL means auto-detect from user messages'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `personas`
--

INSERT INTO `personas` (`id`, `business_profile_id`, `name`, `description`, `ai_instructions`, `ai_model`, `tone`, `response_style`, `is_system`, `is_active`, `created_at`, `updated_at`, `preferred_language`) VALUES
('e050e640-a358-11f0-aaa1-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'Sales', 'Handles sales inquiries, product information, and closes deals', 'You are a professional sales representative. Your goal is to understand customer needs, provide product information, and guide them towards a purchase. Be persuasive but not pushy. Always ask qualifying questions and provide relevant solutions.', 'gemini-1.5-flash-latest', NULL, NULL, 1, 1, '2025-10-07 08:37:36', '2025-10-08 05:36:18', NULL),
('e0516fde-a358-11f0-aaa1-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'Support', 'Provides customer support and resolves issues', 'You are a helpful customer support agent. Your goal is to resolve customer issues quickly and effectively. Be empathetic, ask clarifying questions, and provide step-by-step solutions. Escalate to human agents when necessary.', 'gemini-1.5-flash-latest', NULL, NULL, 1, 1, '2025-10-07 08:37:36', '2025-10-08 05:36:18', NULL),
('e051cf4c-a358-11f0-aaa1-6ed35d08214f', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'General', 'General purpose assistant for all inquiries', 'You are a friendly business assistant. Help customers with general inquiries, provide information about the business, and route complex questions appropriately. Be professional yet approachable.', 'gemini-1.5-flash-latest', NULL, NULL, 1, 1, '2025-10-07 08:37:36', '2025-10-08 05:36:18', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `plans`
--

CREATE TABLE `plans` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `price_monthly` decimal(10,2) NOT NULL,
  `price_annual` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Plan features object' CHECK (json_valid(`features`)),
  `limits` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Usage limits object' CHECK (json_valid(`limits`)),
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `plans`
--

INSERT INTO `plans` (`id`, `name`, `slug`, `description`, `price_monthly`, `price_annual`, `currency`, `features`, `limits`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
('04e7ee9c-a66d-11f0-a095-6ed35d08214f', 'Trial', 'trial', '7-day free trial with basic features to test the platform', 0.00, 0.00, 'USD', '{\"ai_replies\": true, \"knowledge_base\": true, \"web_scraping\": true, \"web_scraping_pages\": 10, \"file_uploads\": false, \"broadcasts\": false, \"custom_personas\": 0, \"priority_support\": false, \"advanced_analytics\": false}', '{\"devices\": 1, \"contacts\": 100, \"messages_per_month\": 100, \"ai_messages_per_month\": 10, \"broadcasts_per_month\": 0, \"trial_days\": 7}', 1, 0, '2025-10-11 06:39:21', '2025-10-11 06:39:21'),
('04e81af2-a66d-11f0-a095-6ed35d08214f', 'Starter', 'starter', 'Perfect for small businesses getting started with WhatsApp automation', 29.00, 296.40, 'USD', '{\"ai_replies\": true, \"knowledge_base\": true, \"web_scraping\": true, \"web_scraping_pages\": -1, \"file_uploads\": false, \"broadcasts\": false, \"custom_personas\": 1, \"priority_support\": false, \"advanced_analytics\": false, \"email_support\": true}', '{\"devices\": 2, \"contacts\": 1000, \"messages_per_month\": 5000, \"ai_messages_per_month\": 1000, \"broadcasts_per_month\": 0}', 1, 1, '2025-10-11 06:39:21', '2025-10-11 06:39:21'),
('04e836ae-a66d-11f0-a095-6ed35d08214f', 'Professional', 'professional', 'For growing businesses that need advanced features and higher limits', 99.00, 1009.80, 'USD', '{\"ai_replies\": true, \"knowledge_base\": true, \"web_scraping\": true, \"web_scraping_pages\": -1, \"file_uploads\": true, \"broadcasts\": true, \"custom_personas\": -1, \"priority_support\": true, \"advanced_analytics\": true, \"email_support\": true, \"api_access\": true}', '{\"devices\": 5, \"contacts\": 10000, \"messages_per_month\": 50000, \"ai_messages_per_month\": 15000, \"broadcasts_per_month\": 100}', 1, 2, '2025-10-11 06:39:21', '2025-10-11 06:39:21'),
('04e84efa-a66d-11f0-a095-6ed35d08214f', 'Enterprise', 'enterprise', 'For large organizations requiring unlimited access and premium support', 299.00, 3049.80, 'USD', '{\"ai_replies\": true, \"knowledge_base\": true, \"web_scraping\": true, \"web_scraping_pages\": -1, \"file_uploads\": true, \"broadcasts\": true, \"custom_personas\": -1, \"priority_support\": true, \"advanced_analytics\": true, \"email_support\": true, \"api_access\": true, \"custom_integrations\": true, \"dedicated_support\": true, \"white_label\": true, \"custom_ai_training\": true}', '{\"devices\": -1, \"contacts\": -1, \"messages_per_month\": -1, \"ai_messages_per_month\": -1, \"broadcasts_per_month\": -1}', 1, 3, '2025-10-11 06:39:21', '2025-10-11 06:39:21');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'LKR',
  `sku` varchar(100) DEFAULT NULL,
  `image_url` text DEFAULT NULL,
  `product_url` text DEFAULT NULL,
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`)),
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `plan_id` varchar(36) NOT NULL,
  `status` enum('trial','active','past_due','canceled','paused','expired') DEFAULT 'trial',
  `billing_cycle` enum('monthly','annual') DEFAULT 'monthly',
  `payhere_subscription_id` varchar(255) DEFAULT NULL,
  `payhere_order_id` varchar(255) DEFAULT NULL,
  `payhere_payment_id` varchar(255) DEFAULT NULL,
  `current_price` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `current_period_start` timestamp NULL DEFAULT NULL,
  `current_period_end` timestamp NULL DEFAULT NULL,
  `next_billing_date` timestamp NULL DEFAULT NULL,
  `cancel_at_period_end` tinyint(1) DEFAULT 0,
  `canceled_at` timestamp NULL DEFAULT NULL,
  `is_free` tinyint(1) DEFAULT 0,
  `free_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `plan_id`, `status`, `billing_cycle`, `payhere_subscription_id`, `payhere_order_id`, `payhere_payment_id`, `current_price`, `currency`, `trial_ends_at`, `current_period_start`, `current_period_end`, `next_billing_date`, `cancel_at_period_end`, `canceled_at`, `is_free`, `free_reason`, `created_at`, `updated_at`) VALUES
('4280e4fc-5ce6-4cac-af6a-868de8b98283', '5a219cf1-44de-4377-904a-9568bcf0a8e9', '04e7ee9c-a66d-11f0-a095-6ed35d08214f', 'trial', 'monthly', NULL, NULL, NULL, 0.00, 'USD', '2025-10-18 06:46:52', '2025-10-11 06:46:52', '2025-10-18 06:46:52', NULL, 0, NULL, 0, NULL, '2025-10-11 06:46:52', '2025-10-11 06:46:52');

-- --------------------------------------------------------

--
-- Table structure for table `subscription_addons`
--

CREATE TABLE `subscription_addons` (
  `id` varchar(36) NOT NULL,
  `subscription_id` varchar(36) NOT NULL,
  `addon_type` enum('device') NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `price_per_unit` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `test_accounts_log`
--

CREATE TABLE `test_accounts_log` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `action` enum('enabled','disabled','note_updated') NOT NULL,
  `performed_by` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usage_tracking`
--

CREATE TABLE `usage_tracking` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `subscription_id` varchar(36) NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `devices_used` int(11) DEFAULT 0,
  `contacts_count` int(11) DEFAULT 0,
  `messages_sent` int(11) DEFAULT 0,
  `messages_received` int(11) DEFAULT 0,
  `ai_messages_count` int(11) DEFAULT 0,
  `broadcasts_sent` int(11) DEFAULT 0,
  `web_scraping_pages` int(11) DEFAULT 0,
  `messages_overage` int(11) DEFAULT 0,
  `ai_messages_overage` int(11) DEFAULT 0,
  `overage_credits_used` decimal(10,2) DEFAULT 0.00,
  `last_reset_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usage_tracking`
--

INSERT INTO `usage_tracking` (`id`, `user_id`, `subscription_id`, `period_start`, `period_end`, `devices_used`, `contacts_count`, `messages_sent`, `messages_received`, `ai_messages_count`, `broadcasts_sent`, `web_scraping_pages`, `messages_overage`, `ai_messages_overage`, `overage_credits_used`, `last_reset_at`, `updated_at`) VALUES
('5b600aec-34de-4d09-965b-64059fcde259', '5a219cf1-44de-4377-904a-9568bcf0a8e9', '4280e4fc-5ce6-4cac-af6a-868de8b98283', '2025-10-11', '2025-11-11', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.00, '2025-10-11 06:46:52', '2025-10-11 06:46:52');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `trial_used` tinyint(1) DEFAULT 0,
  `trial_started_at` timestamp NULL DEFAULT NULL,
  `is_test_account` tinyint(1) DEFAULT 0,
  `test_account_notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `created_at`, `updated_at`, `is_active`, `trial_used`, `trial_started_at`, `is_test_account`, `test_account_notes`) VALUES
('5a219cf1-44de-4377-904a-9568bcf0a8e9', 'shabbydg@gmail.com', '$2a$10$YjOV2eo/wRjarEIOGQMHOO.4/dAj0Ftut6u0SG5A5eUAFe0g4TP.6', 'Shabbir Sajjadhusain', '2025-10-06 10:29:45', '2025-10-11 11:05:53', 1, 1, '2025-10-11 06:46:52', 1, 'Owner account - unlimited access for testing and development');

-- --------------------------------------------------------

--
-- Table structure for table `user_broadcast_preferences`
--

CREATE TABLE `user_broadcast_preferences` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `guidelines_acknowledged` tinyint(1) DEFAULT 0,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_broadcast_preferences`
--

INSERT INTO `user_broadcast_preferences` (`id`, `user_id`, `guidelines_acknowledged`, `acknowledged_at`, `created_at`, `updated_at`) VALUES
('2abcacda-e14e-4c90-a323-00a8bc44d287', '5a219cf1-44de-4377-904a-9568bcf0a8e9', 1, '2025-10-09 10:53:01', '2025-10-09 10:53:01', '2025-10-09 10:53:01');

-- --------------------------------------------------------

--
-- Table structure for table `webhooks`
--

CREATE TABLE `webhooks` (
  `id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `url` varchar(500) NOT NULL,
  `secret` varchar(64) NOT NULL COMMENT 'Secret for HMAC signature verification',
  `events` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Array of subscribed events' CHECK (json_valid(`events`)),
  `is_active` tinyint(1) DEFAULT 1,
  `description` varchar(255) DEFAULT NULL,
  `last_triggered_at` timestamp NULL DEFAULT NULL,
  `success_count` int(11) DEFAULT 0,
  `failure_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `webhook_deliveries`
--

CREATE TABLE `webhook_deliveries` (
  `id` varchar(36) NOT NULL,
  `webhook_id` varchar(36) NOT NULL,
  `event_type` varchar(50) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `response_status` int(11) DEFAULT NULL,
  `response_body` text DEFAULT NULL,
  `attempt_number` int(11) DEFAULT 1,
  `delivered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `success` tinyint(1) DEFAULT 0,
  `error_message` text DEFAULT NULL,
  `next_retry_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `whatsapp_connections`
--

CREATE TABLE `whatsapp_connections` (
  `id` varchar(36) NOT NULL,
  `business_profile_id` varchar(36) NOT NULL,
  `device_name` varchar(100) DEFAULT NULL,
  `persona_id` varchar(36) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `phone_number` varchar(20) NOT NULL,
  `connection_mode` varchar(20) DEFAULT 'whatsapp-web',
  `status` enum('qr_pending','connected','disconnected','reconnecting') DEFAULT 'qr_pending',
  `session_data` text DEFAULT NULL,
  `qr_code` text DEFAULT NULL,
  `last_connected_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `auto_reply_enabled` tinyint(1) DEFAULT 0,
  `ai_enabled` tinyint(1) DEFAULT 1,
  `ai_schedule` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ai_schedule`)),
  `working_hours_start` time DEFAULT '09:00:00',
  `working_hours_end` time DEFAULT '17:00:00',
  `working_days` varchar(50) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
  `email_on_disconnect` tinyint(1) DEFAULT 0 COMMENT 'Send email alert when device disconnects'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `whatsapp_connections`
--

INSERT INTO `whatsapp_connections` (`id`, `business_profile_id`, `device_name`, `persona_id`, `is_primary`, `phone_number`, `connection_mode`, `status`, `session_data`, `qr_code`, `last_connected_at`, `created_at`, `updated_at`, `auto_reply_enabled`, `ai_enabled`, `ai_schedule`, `working_hours_start`, `working_hours_end`, `working_days`, `email_on_disconnect`) VALUES
('d55b2b92-ed8b-4801-90a3-29633c87cd4a', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'Second Testing Phone', 'e0516fde-a358-11f0-aaa1-6ed35d08214f', 0, '+94777965255', 'whatsapp-web', 'reconnecting', NULL, NULL, '2025-10-10 10:20:15', '2025-10-08 02:44:05', '2025-10-10 10:21:41', 0, 1, '[]', '09:00:00', '17:00:00', 'Mon,Tue,Wed,Thu,Fri', 0),
('f444c3f4-addd-4b78-85d7-2b6522c7f3eb', 'ec829dc9-a84f-47ad-b7a2-e2c41eea000d', 'Main', 'e051cf4c-a358-11f0-aaa1-6ed35d08214f', 1, '+94714515253', 'whatsapp-web', 'reconnecting', NULL, NULL, '2025-10-10 10:20:14', '2025-10-07 07:23:08', '2025-10-10 10:21:41', 0, 0, '[]', '09:00:00', '17:00:00', 'Mon,Tue,Wed,Thu,Fri', 0);

-- --------------------------------------------------------

--
-- Structure for view `lead_dashboard`
--
DROP TABLE IF EXISTS `lead_dashboard`;

CREATE VIEW `lead_dashboard` AS SELECT `lp`.`id` AS `id`, `lp`.`contact_id` AS `contact_id`, `lp`.`business_profile_id` AS `business_profile_id`, `lp`.`company_name` AS `company_name`, `lp`.`job_title` AS `job_title`, `lp`.`industry` AS `industry`, `lp`.`team_size` AS `team_size`, `lp`.`location` AS `location`, `lp`.`email` AS `email`, `lp`.`website` AS `website`, `lp`.`street_address` AS `street_address`, `lp`.`city` AS `city`, `lp`.`state_province` AS `state_province`, `lp`.`postal_code` AS `postal_code`, `lp`.`country` AS `country`, `lp`.`pain_points` AS `pain_points`, `lp`.`interests` AS `interests`, `lp`.`intent_keywords` AS `intent_keywords`, `lp`.`budget_range` AS `budget_range`, `lp`.`timeline` AS `timeline`, `lp`.`decision_stage` AS `decision_stage`, `lp`.`lead_score` AS `lead_score`, `lp`.`lead_temperature` AS `lead_temperature`, `lp`.`is_qualified` AS `is_qualified`, `lp`.`qualification_notes` AS `qualification_notes`, `lp`.`first_interaction_at` AS `first_interaction_at`, `lp`.`last_interaction_at` AS `last_interaction_at`, `lp`.`total_interactions` AS `total_interactions`, `lp`.`avg_response_time` AS `avg_response_time`, `lp`.`conversation_summary` AS `conversation_summary`, `lp`.`next_best_action` AS `next_best_action`, `lp`.`assigned_to` AS `assigned_to`, `lp`.`lead_status` AS `lead_status`, `lp`.`created_at` AS `created_at`, `lp`.`updated_at` AS `updated_at`, `c`.`name` AS `contact_name`, `c`.`phone_number` AS `phone_number`, `c`.`profile_pic_url` AS `profile_pic_url`, `c`.`last_message_at` AS `last_message_at`, `bp`.`business_name` AS `business_name`, (select count(0) from `lead_activities` `la` where `la`.`lead_profile_id` = `lp`.`id`) AS `activity_count`, (select count(0) from `messages` `m` where `m`.`contact_id` = `lp`.`contact_id` and `m`.`direction` = 'inbound') AS `messages_received`, (select count(0) from `messages` `m` where `m`.`contact_id` = `lp`.`contact_id` and `m`.`direction` = 'outbound') AS `messages_sent`, CASE WHEN `lp`.`lead_score` >= 70 THEN 'hot' WHEN `lp`.`lead_score` >= 40 THEN 'warm' ELSE 'cold' END AS `calculated_temperature` FROM ((`lead_profiles` `lp` join `contacts` `c` on(`lp`.`contact_id` = `c`.`id`)) join `business_profiles` `bp` on(`lp`.`business_profile_id` = `bp`.`id`)) ORDER BY `lp`.`lead_score` DESC, `lp`.`updated_at` DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_activity_logs`
--
ALTER TABLE `admin_activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_user` (`admin_user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_target` (`target_type`,`target_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `persona_id` (`persona_id`),
  ADD KEY `device_id` (`device_id`),
  ADD KEY `message_id` (`message_id`),
  ADD KEY `idx_conversation` (`contact_id`,`created_at`),
  ADD KEY `idx_business_profile` (`business_profile_id`);

--
-- Indexes for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_business_profile` (`business_profile_id`),
  ADD KEY `idx_environment` (`environment`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `api_request_logs`
--
ALTER TABLE `api_request_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_api_key` (`api_key_id`),
  ADD KEY `idx_business_profile` (`business_profile_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_endpoint` (`endpoint`);

--
-- Indexes for table `broadcasts`
--
ALTER TABLE `broadcasts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_business_profile` (`business_profile_id`),
  ADD KEY `idx_device` (`device_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_scheduled_at` (`scheduled_at`);

--
-- Indexes for table `broadcast_contact_lists`
--
ALTER TABLE `broadcast_contact_lists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_broadcast_list` (`broadcast_id`,`list_id`),
  ADD KEY `idx_broadcast` (`broadcast_id`),
  ADD KEY `idx_list` (`list_id`);

--
-- Indexes for table `broadcast_recipients`
--
ALTER TABLE `broadcast_recipients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contact_id` (`contact_id`),
  ADD KEY `idx_broadcast` (`broadcast_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_phone` (`phone_number`);

--
-- Indexes for table `business_profiles`
--
ALTER TABLE `business_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `campaigns`
--
ALTER TABLE `campaigns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_business_profile` (`business_profile_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `campaign_recipients`
--
ALTER TABLE `campaign_recipients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contact_id` (`contact_id`),
  ADD KEY `idx_campaign` (`campaign_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_contact` (`business_profile_id`,`phone_number`),
  ADD KEY `idx_business_profile` (`business_profile_id`),
  ADD KEY `idx_phone` (`phone_number`),
  ADD KEY `idx_last_message` (`last_message_at`),
  ADD KEY `idx_last_device` (`last_device_id`),
  ADD KEY `fk_contact_lead_profile` (`lead_profile_id`);

--
-- Indexes for table `contact_lists`
--
ALTER TABLE `contact_lists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_business_profile` (`business_profile_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `contact_list_members`
--
ALTER TABLE `contact_list_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_list_phone` (`list_id`,`phone_number`),
  ADD KEY `idx_list` (`list_id`),
  ADD KEY `idx_contact` (`contact_id`),
  ADD KEY `idx_opted_out` (`opted_out`);

--
-- Indexes for table `contact_tags`
--
ALTER TABLE `contact_tags`
  ADD PRIMARY KEY (`contact_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Indexes for table `daily_stats`
--
ALTER TABLE `daily_stats`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_stat` (`business_profile_id`,`date`),
  ADD KEY `idx_business_profile` (`business_profile_id`),
  ADD KEY `idx_date` (`date`);

--
-- Indexes for table `intent_keywords`
--
ALTER TABLE `intent_keywords`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_keyword` (`business_profile_id`,`keyword`),
  ADD KEY `idx_business_profile` (`business_profile_id`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `lead_activities`
--
ALTER TABLE `lead_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lead_activity` (`lead_profile_id`,`created_at`),
  ADD KEY `idx_activity_type` (`activity_type`);

--
-- Indexes for table `lead_profiles`
--
ALTER TABLE `lead_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `contact_id` (`contact_id`),
  ADD KEY `idx_lead_score` (`lead_score`),
  ADD KEY `idx_lead_status` (`lead_status`),
  ADD KEY `idx_temperature` (`lead_temperature`),
  ADD KEY `idx_business_profile` (`business_profile_id`),
  ADD KEY `idx_decision_stage` (`decision_stage`),
  ADD KEY `idx_city` (`city`),
  ADD KEY `idx_country` (`country`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_business_profile` (`business_profile_id`),
  ADD KEY `idx_contact` (`contact_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_direction` (`direction`),
  ADD KEY `idx_device_id` (`device_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `idx_user_payments` (`user_id`,`created_at`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_payhere_order` (`payhere_order_id`),
  ADD KEY `idx_invoice` (`invoice_number`),
  ADD KEY `idx_subscription_status` (`subscription_id`,`status`,`created_at`);

--
-- Indexes for table `personas`
--
ALTER TABLE `personas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_business_profile` (`business_profile_id`);

--
-- Indexes for table `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_active` (`is_active`,`display_order`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_business_profile` (`business_profile_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_sku` (`sku`),
  ADD KEY `idx_available` (`is_available`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_status` (`user_id`,`status`),
  ADD KEY `idx_next_billing` (`next_billing_date`),
  ADD KEY `idx_payhere_subscription` (`payhere_subscription_id`);

--
-- Indexes for table `subscription_addons`
--
ALTER TABLE `subscription_addons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_subscription` (`subscription_id`,`is_active`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tag` (`business_profile_id`,`name`),
  ADD KEY `idx_business_profile` (`business_profile_id`);

--
-- Indexes for table `test_accounts_log`
--
ALTER TABLE `test_accounts_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `usage_tracking`
--
ALTER TABLE `usage_tracking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_period` (`user_id`,`period_start`),
  ADD KEY `idx_period` (`period_start`,`period_end`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_users_test_account` (`is_test_account`);

--
-- Indexes for table `user_broadcast_preferences`
--
ALTER TABLE `user_broadcast_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user` (`user_id`);

--
-- Indexes for table `webhooks`
--
ALTER TABLE `webhooks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_business_profile` (`business_profile_id`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `webhook_deliveries`
--
ALTER TABLE `webhook_deliveries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_webhook` (`webhook_id`),
  ADD KEY `idx_event_type` (`event_type`),
  ADD KEY `idx_success` (`success`),
  ADD KEY `idx_delivered_at` (`delivered_at`),
  ADD KEY `idx_next_retry` (`next_retry_at`);

--
-- Indexes for table `whatsapp_connections`
--
ALTER TABLE `whatsapp_connections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_business_profile` (`business_profile_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_business_device` (`business_profile_id`,`device_name`),
  ADD KEY `persona_id` (`persona_id`),
  ADD KEY `idx_email_on_disconnect` (`email_on_disconnect`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_activity_logs`
--
ALTER TABLE `admin_activity_logs`
  ADD CONSTRAINT `admin_activity_logs_ibfk_1` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  ADD CONSTRAINT `ai_conversations_ibfk_1` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ai_conversations_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ai_conversations_ibfk_3` FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ai_conversations_ibfk_4` FOREIGN KEY (`device_id`) REFERENCES `whatsapp_connections` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ai_conversations_ibfk_5` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `api_keys`
--
ALTER TABLE `api_keys`
  ADD CONSTRAINT `api_keys_ibfk_1` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `api_request_logs`
--
ALTER TABLE `api_request_logs`
  ADD CONSTRAINT `api_request_logs_ibfk_1` FOREIGN KEY (`api_key_id`) REFERENCES `api_keys` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `api_request_logs_ibfk_2` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `broadcasts`
--
ALTER TABLE `broadcasts`
  ADD CONSTRAINT `broadcasts_ibfk_1` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `broadcasts_ibfk_2` FOREIGN KEY (`device_id`) REFERENCES `whatsapp_connections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `broadcast_contact_lists`
--
ALTER TABLE `broadcast_contact_lists`
  ADD CONSTRAINT `broadcast_contact_lists_ibfk_1` FOREIGN KEY (`broadcast_id`) REFERENCES `broadcasts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `broadcast_contact_lists_ibfk_2` FOREIGN KEY (`list_id`) REFERENCES `contact_lists` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `broadcast_recipients`
--
ALTER TABLE `broadcast_recipients`
  ADD CONSTRAINT `broadcast_recipients_ibfk_1` FOREIGN KEY (`broadcast_id`) REFERENCES `broadcasts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `broadcast_recipients_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `business_profiles`
--
ALTER TABLE `business_profiles`
  ADD CONSTRAINT `business_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `campaigns`
--
ALTER TABLE `campaigns`
  ADD CONSTRAINT `campaigns_ibfk_1` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `campaign_recipients`
--
ALTER TABLE `campaign_recipients`
  ADD CONSTRAINT `campaign_recipients_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `campaign_recipients_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_contact_lead_profile` FOREIGN KEY (`lead_profile_id`) REFERENCES `lead_profiles` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `contact_lists`
--
ALTER TABLE `contact_lists`
  ADD CONSTRAINT `contact_lists_ibfk_1` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contact_list_members`
--
ALTER TABLE `contact_list_members`
  ADD CONSTRAINT `contact_list_members_ibfk_1` FOREIGN KEY (`list_id`) REFERENCES `contact_lists` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contact_list_members_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `contact_tags`
--
ALTER TABLE `contact_tags`
  ADD CONSTRAINT `contact_tags_ibfk_1` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contact_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `daily_stats`
--
ALTER TABLE `daily_stats`
  ADD CONSTRAINT `daily_stats_ibfk_1` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `intent_keywords`
--
ALTER TABLE `intent_keywords`
  ADD CONSTRAINT `intent_keywords_ibfk_1` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lead_activities`
--
ALTER TABLE `lead_activities`
  ADD CONSTRAINT `lead_activities_ibfk_1` FOREIGN KEY (`lead_profile_id`) REFERENCES `lead_profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lead_profiles`
--
ALTER TABLE `lead_profiles`
  ADD CONSTRAINT `lead_profiles_ibfk_1` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lead_profiles_ibfk_2` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `personas`
--
ALTER TABLE `personas`
  ADD CONSTRAINT `personas_ibfk_1` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tags`
--
ALTER TABLE `tags`
  ADD CONSTRAINT `tags_ibfk_1` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_broadcast_preferences`
--
ALTER TABLE `user_broadcast_preferences`
  ADD CONSTRAINT `user_broadcast_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `webhooks`
--
ALTER TABLE `webhooks`
  ADD CONSTRAINT `webhooks_ibfk_1` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `webhook_deliveries`
--
ALTER TABLE `webhook_deliveries`
  ADD CONSTRAINT `webhook_deliveries_ibfk_1` FOREIGN KEY (`webhook_id`) REFERENCES `webhooks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `whatsapp_connections`
--
ALTER TABLE `whatsapp_connections`
  ADD CONSTRAINT `whatsapp_connections_ibfk_1` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `whatsapp_connections_ibfk_2` FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
