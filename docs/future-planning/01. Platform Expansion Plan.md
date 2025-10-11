# WhatsFlow Platform Expansion Plan

**Created:** October 10, 2025  
**Status:** Phase 1 - Planning  
**Repository Structure:** Monorepo approach

---

## Overview

This document outlines the complete implementation plan for expanding WhatsFlow from a single-app platform into a comprehensive multi-app ecosystem with:
- Marketing/landing page (`whatsflow.ai`)
- Main application (`app.whatsflow.ai`)
- Admin panel (`admin.whatsflow.ai`)
- Plans & billing system
- Deployment infrastructure

---

## Repository Structure

```
whatsflow/
├── landing/                    # NEW - Marketing/Landing Page App
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.js
│
├── admin/                      # NEW - Master Admin Panel
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.js
│
├── frontend/                   # EXISTING - Main App (app.whatsflow.ai)
│   └── ...
│
├── whatsflow/backend/          # EXISTING - Backend API
│   └── ...
│
├── shared/                     # NEW - Shared types, components, utils
│   ├── types/
│   ├── components/
│   └── utils/
│
└── docs/
    └── PLATFORM_EXPANSION_PLAN.md  # This file
```

---

# PHASE 1: Landing Page & Admin Panel Setup

**Goal:** Create foundational Next.js applications for landing page and admin panel within the monorepo.

## Status: 🟡 Ready to Implement

---

## 1.1 Shared Dependencies & Types

### Tasks:
- [ ] Create `/shared` directory structure
- [ ] Set up shared TypeScript configuration
- [ ] Define shared types (User, Plan, Subscription, etc.)
- [ ] Create shared UI components library
- [ ] Set up shared utilities (date formatting, validation, etc.)

### Files to Create:
```
shared/
├── types/
│   ├── user.ts
│   ├── subscription.ts
│   ├── billing.ts
│   └── index.ts
├── components/
│   └── ui/
├── utils/
│   ├── formatting.ts
│   └── validation.ts
├── package.json
└── tsconfig.json
```

---

## 1.2 Landing Page Application

### Tasks:
- [ ] Initialize Next.js 15 app in `/landing`
- [ ] Set up Tailwind CSS configuration
- [ ] Configure TypeScript
- [ ] Set up environment variables
- [ ] Create landing page sections
- [ ] Create signup flow integration
- [ ] Set up SEO metadata
- [ ] Add analytics tracking setup

### Page Structure:
```
landing/
└── src/
    ├── app/
    │   ├── page.tsx                 # Home/Landing
    │   ├── features/page.tsx        # Features page
    │   ├── pricing/page.tsx         # Pricing page
    │   ├── about/page.tsx           # About page
    │   ├── contact/page.tsx         # Contact page
    │   ├── terms/page.tsx           # Terms of Service
    │   ├── privacy/page.tsx         # Privacy Policy
    │   └── layout.tsx
    ├── components/
    │   ├── landing/
    │   │   ├── Hero.tsx
    │   │   ├── Features.tsx
    │   │   ├── Pricing.tsx
    │   │   ├── Testimonials.tsx
    │   │   ├── CTA.tsx
    │   │   └── FAQ.tsx
    │   ├── layout/
    │   │   ├── Header.tsx
    │   │   ├── Footer.tsx
    │   │   └── Navigation.tsx
    │   └── ui/
    │       └── Button.tsx
    ├── lib/
    │   └── api.ts
    └── styles/
        └── globals.css
```

### Key Features:
1. **Hero Section** - Compelling headline, CTA, demo/video
2. **Features Section** - Core platform features with icons
3. **Pricing Section** - Plan comparison (to be defined in Phase 2)
4. **Testimonials** - Social proof
5. **FAQ Section** - Common questions
6. **Footer** - Links, legal, social media
7. **Responsive Design** - Mobile-first approach
8. **Fast Loading** - Optimized images, lazy loading

### Environment Variables:
```env
NEXT_PUBLIC_APP_URL=http://localhost:2153
NEXT_PUBLIC_API_URL=http://localhost:2152
NEXT_PUBLIC_ADMIN_URL=http://localhost:5153
```

---

## 1.3 Admin Panel Application

### Tasks:
- [ ] Initialize Next.js 15 app in `/admin`
- [ ] Set up Tailwind CSS configuration
- [ ] Configure TypeScript
- [ ] Set up environment variables
- [ ] Create admin authentication system
- [ ] Create admin layout with sidebar
- [ ] Set up admin routing
- [ ] Create dashboard overview

### Page Structure:
```
admin/
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   └── login/page.tsx       # Admin login
    │   ├── (dashboard)/
    │   │   ├── layout.tsx           # Admin dashboard layout
    │   │   ├── dashboard/page.tsx   # Overview
    │   │   ├── users/               # User management
    │   │   │   ├── page.tsx         # List users
    │   │   │   └── [id]/page.tsx    # User details
    │   │   ├── subscriptions/       # Subscription management
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   ├── payments/            # Payment tracking
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   ├── analytics/           # Platform analytics
    │   │   │   └── page.tsx
    │   │   ├── settings/            # System settings
    │   │   │   └── page.tsx
    │   │   └── billing-config/      # Configure plans
    │   │       └── page.tsx
    │   └── layout.tsx
    ├── components/
    │   ├── admin/
    │   │   ├── Sidebar.tsx
    │   │   ├── Header.tsx
    │   │   ├── StatsCard.tsx
    │   │   └── DataTable.tsx
    │   └── ui/
    ├── lib/
    │   ├── api.ts
    │   └── utils.ts
    └── stores/
        └── adminAuthStore.ts
```

### Key Features:
1. **Admin Authentication** - Separate from user auth
2. **Dashboard Overview** - Key metrics, charts
3. **User Management** - View, search, suspend, delete users
4. **Subscription Management** - View plans, modify subscriptions
5. **Payment Tracking** - View transactions, dues, failed payments
6. **Analytics** - Platform usage, revenue, growth metrics
7. **System Settings** - Configure platform settings
8. **Billing Configuration** - Manage plan features and pricing

### Environment Variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:2152
NEXT_PUBLIC_APP_URL=http://localhost:2153
NEXT_PUBLIC_LANDING_URL=http://localhost:5253
```

---

## 1.4 Development Ports

- **Backend API:** `2152` (existing)
- **Frontend App:** `2153` (existing)
- **Admin Panel:** `5153` (new)
- **Landing Page:** `5253` (new)

### Package.json Scripts:
```json
{
  "scripts": {
    "dev:backend": "cd whatsflow/backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:admin": "cd admin && npm run dev",
    "dev:landing": "cd landing && npm run dev",
    "dev:all": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\" \"npm run dev:admin\" \"npm run dev:landing\""
  }
}
```

---

## 1.5 Phase 1 Implementation Checklist

### Setup Tasks:
- [ ] Create `/shared` directory with types and utilities
- [ ] Initialize `/landing` Next.js application
- [ ] Initialize `/admin` Next.js application
- [ ] Configure development ports
- [ ] Set up root-level package.json with workspace scripts
- [ ] Install `concurrently` for running all apps

### Landing Page Tasks:
- [ ] Create landing page layout and navigation
- [ ] Build Hero section
- [ ] Build Features section
- [ ] Build Pricing section (placeholder for Phase 2)
- [ ] Build Testimonials section
- [ ] Build FAQ section
- [ ] Build Footer with legal links
- [ ] Create signup flow that redirects to main app
- [ ] Add responsive design
- [ ] Test all links and navigation

### Admin Panel Tasks:
- [ ] Create admin authentication pages
- [ ] Build admin dashboard layout with sidebar
- [ ] Create overview/dashboard page
- [ ] Create users management pages
- [ ] Create subscriptions management pages (basic UI)
- [ ] Create payments tracking pages (basic UI)
- [ ] Create analytics page (basic UI)
- [ ] Test admin authentication flow
- [ ] Test navigation and routing

---

# PHASE 2: Plans & Billing System

**Goal:** Implement comprehensive subscription and billing management.

## Status: 🟢 Ready for Implementation

**Payment Provider:** PayHere.lk  
**Billing Cycles:** Monthly + Annual (15% discount)  
**Trial:** 7 days, 100 messages, 10 AI replies  
**Profitability:** 80-90% gross margin ✅

📋 **See PHASE2_BILLING_PLAN.md for detailed implementation plan**

---

## 2.1 Decisions Made

### 2.1.1 Payment Provider
**Options:**
- **Stripe** (Recommended) - Most popular, excellent docs, supports most countries
- **PayPal** - Good for international
- **Razorpay** - Good for India/Asia
- **Paddle** - Merchant of record (handles tax/VAT)

**Questions:**
- [ ] Which payment provider?
- [ ] Primary target markets/countries?
- [ ] Need to handle VAT/tax automatically?

---

### 2.1.2 Plan Structure

**Typical SaaS Plan Tiers:**

#### Option A: Usage-Based Tiers
```
FREE
├── 1 WhatsApp device
├── 100 contacts
├── 500 messages/month
├── Basic support
└── $0/month

STARTER
├── 2 WhatsApp devices
├── 1,000 contacts
├── 5,000 messages/month
├── Basic AI replies
├── Email support
└── $29/month

PROFESSIONAL
├── 5 WhatsApp devices
├── 10,000 contacts
├── 50,000 messages/month
├── Advanced AI + knowledge base
├── Broadcasts & campaigns
├── Priority support
└── $99/month

ENTERPRISE
├── Unlimited devices
├── Unlimited contacts
├── Unlimited messages
├── Custom AI training
├── Advanced analytics
├── Dedicated support
├── Custom integrations
└── Custom pricing
```

#### Option B: Simple Feature-Based
```
BASIC - $19/month
├── Core messaging features
└── Limited usage

PRO - $49/month
├── All features
└── Higher limits

ENTERPRISE - Custom
└── Everything + custom needs
```

**Questions:**
- [ ] How many plan tiers? (3-4 recommended)
- [ ] Usage limits per tier (devices, contacts, messages)?
- [ ] Which features are gated by plan?
- [ ] Free tier included?
- [ ] Trial period? (7-14 days typical)

---

### 2.1.3 Billing Features

**Required Features:**
- [ ] Subscription creation/cancellation
- [ ] Plan upgrades/downgrades
- [ ] Payment method management
- [ ] Invoice generation
- [ ] Failed payment handling
- [ ] Dunning (retry failed payments)
- [ ] Proration on plan changes
- [ ] Usage tracking/metering
- [ ] Billing history

**Optional Features:**
- [ ] Annual billing (discount?)
- [ ] Add-ons (extra devices, contacts, etc.)
- [ ] Overage charges
- [ ] Pause subscription
- [ ] Gift codes/coupons
- [ ] Referral credits

**Questions:**
- [ ] Monthly only or monthly + annual?
- [ ] Annual discount percentage?
- [ ] Allow add-ons?
- [ ] Coupon/promo code system?

---

## 2.2 Implementation Tasks (After Decisions)

### Backend Tasks:
- [ ] Create database schema for subscriptions/plans
- [ ] Set up payment provider SDK
- [ ] Create subscription service
- [ ] Create billing service
- [ ] Create webhook handlers
- [ ] Create usage tracking service
- [ ] Add plan enforcement middleware
- [ ] Create invoice generation
- [ ] Set up email notifications

### Frontend Tasks:
- [ ] Create pricing page (landing app)
- [ ] Create subscription settings (main app)
- [ ] Create payment method management
- [ ] Create billing history page
- [ ] Create usage dashboard
- [ ] Add plan upgrade prompts
- [ ] Add usage warnings (approaching limits)

### Admin Tasks:
- [ ] Create plan configuration UI
- [ ] Create subscription management UI
- [ ] Create payment tracking dashboard
- [ ] Create failed payment management
- [ ] Create refund processing
- [ ] Create analytics dashboards

---

### Database Schema (Draft)

```sql
-- Plans table
CREATE TABLE plans (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100),
  price_monthly DECIMAL(10,2),
  price_annual DECIMAL(10,2),
  features JSON,
  limits JSON, -- {devices: 5, contacts: 10000, messages: 50000}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  plan_id VARCHAR(36),
  status ENUM('active', 'past_due', 'canceled', 'trialing', 'paused'),
  billing_cycle ENUM('monthly', 'annual'),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_ends_at TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_provider VARCHAR(50),
  provider_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- Payments table
CREATE TABLE payments (
  id VARCHAR(36) PRIMARY KEY,
  subscription_id VARCHAR(36),
  user_id VARCHAR(36),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('pending', 'succeeded', 'failed', 'refunded'),
  payment_method VARCHAR(50),
  provider_payment_id VARCHAR(255),
  invoice_url VARCHAR(500),
  attempted_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Usage tracking table
CREATE TABLE usage_tracking (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  period_start DATE,
  period_end DATE,
  devices_used INT DEFAULT 0,
  contacts_count INT DEFAULT 0,
  messages_sent INT DEFAULT 0,
  ai_conversations INT DEFAULT 0,
  broadcasts_sent INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

# PHASE 3: Master Admin Panel Features

**Goal:** Complete admin panel with all management and monitoring features.

## Status: 🔴 Pending Phase 2

---

## 3.1 Core Features

### 3.1.1 User Management
- [ ] List all users with filters (active, inactive, plan type)
- [ ] Search users by email, name, phone
- [ ] View user details and activity
- [ ] Suspend/unsuspend user accounts
- [ ] Delete user accounts (with confirmation)
- [ ] Manually adjust user plan
- [ ] View user's WhatsApp connections
- [ ] View user's messages/usage stats
- [ ] Impersonate user (for support)

### 3.1.2 Subscription Management
- [ ] List all subscriptions with filters
- [ ] View subscription details
- [ ] Manually create subscription
- [ ] Manually upgrade/downgrade subscription
- [ ] Cancel subscription
- [ ] Extend trial period
- [ ] Apply custom pricing/discount
- [ ] View subscription history

### 3.1.3 Payment Management
- [ ] Dashboard with revenue metrics
- [ ] List all payments with filters
- [ ] View payment details
- [ ] Track failed payments
- [ ] Retry failed payments
- [ ] Issue refunds
- [ ] View payment history per user
- [ ] Export payment reports
- [ ] Track MRR (Monthly Recurring Revenue)
- [ ] Track churn rate

### 3.1.4 Analytics & Reporting
- [ ] Platform overview dashboard
- [ ] User growth charts
- [ ] Revenue analytics
- [ ] Churn analytics
- [ ] Feature usage analytics
- [ ] Support ticket metrics
- [ ] WhatsApp connection success rate
- [ ] Export reports (CSV, PDF)

### 3.1.5 System Settings
- [ ] Configure platform settings
- [ ] Manage feature flags
- [ ] Configure email templates
- [ ] Manage system announcements
- [ ] View system logs
- [ ] Monitor background jobs
- [ ] Database backup status

### 3.1.6 Billing Configuration
- [ ] Create/edit plans
- [ ] Set plan features and limits
- [ ] Configure pricing
- [ ] Manage coupons/promo codes
- [ ] Configure payment provider settings
- [ ] Set up webhook endpoints

---

## 3.2 Admin Authentication & Roles

### 3.2.1 Admin User Types
```
SUPER_ADMIN
├── Full access to everything
├── Can create other admins
└── Can modify billing configuration

SUPPORT_ADMIN
├── View users and subscriptions
├── Basic user support actions
└── Cannot modify billing

FINANCE_ADMIN
├── View all payments
├── Issue refunds
└── View financial reports

READ_ONLY
└── View-only access
```

### 3.2.2 Database Schema
```sql
CREATE TABLE admin_users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  full_name VARCHAR(100),
  role ENUM('super_admin', 'support_admin', 'finance_admin', 'read_only'),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE admin_activity_logs (
  id VARCHAR(36) PRIMARY KEY,
  admin_user_id VARCHAR(36),
  action VARCHAR(100),
  target_type VARCHAR(50),
  target_id VARCHAR(36),
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
);
```

---

## 3.3 Implementation Tasks

### Backend Tasks:
- [ ] Create admin authentication endpoints
- [ ] Create admin user management service
- [ ] Create admin authorization middleware
- [ ] Create admin analytics service
- [ ] Create admin logging service
- [ ] Create user management endpoints
- [ ] Create subscription management endpoints
- [ ] Create payment management endpoints
- [ ] Create system settings endpoints
- [ ] Create reporting/export endpoints

### Admin Frontend Tasks:
- [ ] Complete all pages from 3.1
- [ ] Build data tables with sorting/filtering
- [ ] Build charts for analytics
- [ ] Create user detail view
- [ ] Create subscription management interface
- [ ] Create payment processing interface
- [ ] Create settings management interface
- [ ] Add real-time notifications
- [ ] Add activity logs viewer

---

# PHASE 4: Deployment & Domain Setup

**Goal:** Deploy all applications to production with proper domain routing.

## Status: 🔴 Pending Previous Phases

---

## 4.1 Domain Structure

```
whatsflow.ai               → Landing page
app.whatsflow.ai          → Main application
admin.whatsflow.ai        → Admin panel
api.whatsflow.ai          → Backend API
```

---

## 4.2 Hosting Options

### Option 1: Vercel (Recommended for Frontend)

**Pros:**
- Easiest Next.js deployment
- Automatic subdomain routing
- Built-in CDN
- Zero config HTTPS
- Preview deployments
- Excellent performance

**Cons:**
- Backend needs separate hosting
- Can get expensive at scale

**Deployment:**
```bash
# Each Next.js app deploys separately to Vercel
vercel --prod # From landing/, frontend/, admin/
```

**Subdomain Configuration:**
- Add custom domains in Vercel dashboard
- Point DNS to Vercel

---

### Option 2: DigitalOcean/AWS (Full Control)

**Pros:**
- Full control
- Cost-effective at scale
- All apps on same server possible

**Cons:**
- More setup required
- Need to manage servers
- Need to configure SSL

**Stack:**
- DigitalOcean Droplet or AWS EC2
- Nginx for reverse proxy
- PM2 for process management
- Let's Encrypt for SSL

---

### Option 3: Hybrid (Recommended)

**Frontend Apps:** Vercel
- Landing page on Vercel
- Main app on Vercel
- Admin panel on Vercel

**Backend API:** Railway/Render/DigitalOcean
- More cost-effective for Node.js
- Better for WebSocket connections
- Easier background jobs

**Database:** PlanetScale or DigitalOcean Managed MySQL
**Redis:** Redis Cloud or DigitalOcean Managed Redis

---

## 4.3 Infrastructure Requirements

### 4.3.1 Backend API Server
- [ ] Node.js runtime
- [ ] MySQL database
- [ ] Redis instance
- [ ] File storage for uploads (S3 or similar)
- [ ] Background job processing
- [ ] WebSocket support

### 4.3.2 Environment Variables (Production)
```env
# Backend
NODE_ENV=production
PORT=443
DB_HOST=<production-db-host>
DB_NAME=whatsflow_production
DB_USER=<production-db-user>
DB_PASSWORD=<production-db-password>
REDIS_HOST=<production-redis-host>
REDIS_PASSWORD=<production-redis-password>
JWT_SECRET=<strong-production-secret>
STRIPE_SECRET_KEY=<stripe-key>
STRIPE_WEBHOOK_SECRET=<webhook-secret>
CORS_ORIGIN=https://app.whatsflow.ai

# Frontend Apps
NEXT_PUBLIC_API_URL=https://api.whatsflow.ai
NEXT_PUBLIC_SOCKET_URL=https://api.whatsflow.ai
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=<stripe-public-key>
```

---

## 4.4 Deployment Checklist

### Pre-Deployment:
- [ ] Set up domain (whatsflow.ai)
- [ ] Create production database
- [ ] Set up production Redis
- [ ] Set up file storage (S3)
- [ ] Configure payment provider (production mode)
- [ ] Set up email service (production)
- [ ] Create production environment variables
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Set up analytics (Google Analytics, Mixpanel)

### Backend Deployment:
- [ ] Choose hosting provider
- [ ] Deploy backend API
- [ ] Configure reverse proxy (if needed)
- [ ] Set up SSL certificate
- [ ] Configure domain: api.whatsflow.ai
- [ ] Run database migrations
- [ ] Test API endpoints
- [ ] Set up monitoring and logging
- [ ] Configure backups

### Frontend Deployment:
- [ ] Deploy landing page
- [ ] Configure domain: whatsflow.ai
- [ ] Deploy main app
- [ ] Configure domain: app.whatsflow.ai
- [ ] Deploy admin panel
- [ ] Configure domain: admin.whatsflow.ai
- [ ] Test all applications
- [ ] Test subdomain routing
- [ ] Verify SSL certificates
- [ ] Test payment integration
- [ ] Test email notifications

### Post-Deployment:
- [ ] Set up monitoring alerts
- [ ] Configure automatic backups
- [ ] Document deployment process
- [ ] Create rollback plan
- [ ] Set up staging environment
- [ ] Load testing
- [ ] Security audit
- [ ] Set up status page

---

## 4.5 Nginx Configuration Example

For self-hosted option:

```nginx
# Landing page
server {
    listen 443 ssl http2;
    server_name whatsflow.ai;
    
    ssl_certificate /etc/letsencrypt/live/whatsflow.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/whatsflow.ai/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5253;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Main app
server {
    listen 443 ssl http2;
    server_name app.whatsflow.ai;
    
    ssl_certificate /etc/letsencrypt/live/whatsflow.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/whatsflow.ai/privkey.pem;
    
    location / {
        proxy_pass http://localhost:2153;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Admin panel
server {
    listen 443 ssl http2;
    server_name admin.whatsflow.ai;
    
    ssl_certificate /etc/letsencrypt/live/whatsflow.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/whatsflow.ai/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5153;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.whatsflow.ai;
    
    ssl_certificate /etc/letsencrypt/live/whatsflow.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/whatsflow.ai/privkey.pem;
    
    location / {
        proxy_pass http://localhost:2152;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

# Implementation Timeline Estimate

## Phase 1: Landing Page & Admin Panel Setup
**Estimated Time:** 5-7 days
- Shared setup: 1 day
- Landing page: 2-3 days
- Admin panel base: 2-3 days

## Phase 2: Plans & Billing System
**Estimated Time:** 7-10 days
- Decisions & planning: 1 day
- Backend implementation: 3-4 days
- Frontend implementation: 2-3 days
- Testing & debugging: 1-2 days

## Phase 3: Master Admin Panel Features
**Estimated Time:** 7-10 days
- Backend endpoints: 3-4 days
- Admin UI components: 3-4 days
- Testing & refinement: 1-2 days

## Phase 4: Deployment
**Estimated Time:** 3-5 days
- Infrastructure setup: 1-2 days
- Deployment & configuration: 1-2 days
- Testing & monitoring: 1 day

**Total Estimated Time:** 22-32 days

---

# Next Steps

## Immediate Actions:
1. ✅ Review this plan document
2. ⏳ Approve Phase 1 implementation
3. ⏳ Begin Phase 1 development
4. ⏳ Schedule Phase 2 planning discussion

## Phase 2 Planning Session:
Schedule a session to discuss and decide:
- Payment provider selection
- Plan tiers and pricing
- Feature gating strategy
- Billing features needed

---

# Notes & Considerations

## Security Considerations:
- All admin actions should be logged
- Implement rate limiting on all APIs
- Use HTTPS everywhere in production
- Secure payment provider credentials
- Implement CSRF protection
- Regular security audits

## Performance Considerations:
- Implement caching strategies
- Optimize database queries
- Use CDN for static assets
- Monitor API response times
- Implement pagination for large datasets

## User Experience:
- Clear plan comparison on pricing page
- Smooth upgrade/downgrade flow
- Transparent billing information
- Usage warnings before hitting limits
- Easy cancellation process

## Legal Considerations:
- Terms of Service
- Privacy Policy
- Cookie Policy
- GDPR compliance (if targeting EU)
- Refund policy
- Data retention policy

---

**Document Version:** 1.0  
**Last Updated:** October 10, 2025  
**Status:** Ready for Phase 1 Implementation

