# AWS Lambda Deployment Guide - WhatsFlow

**Architecture:** Serverless with AWS Lambda  
**Cost Model:** Pay-per-use  
**Complexity:** High

---

## 🤔 Can WhatsFlow Run on Lambda?

### Short Answer: **Partially Yes** ⚠️

Lambda is great for some parts of WhatsFlow, but **not all parts**. Here's why:

### ✅ What Works on Lambda:
- REST API endpoints
- Webhook handlers
- Background jobs (email sending, invoice generation)
- Scheduled tasks (trial expiration checks)
- One-off processing functions

### ❌ What Doesn't Work on Lambda:
- **WhatsApp Connection** - Requires persistent WebSocket connection
- **Real-time messaging** - Socket.IO needs persistent connections
- **Long-running processes** - Lambda has 15-minute timeout
- **Stateful operations** - Lambda is stateless

---

## 🏗️ Hybrid Architecture: Best of Both Worlds

### Recommended: Lambda + EC2 Hybrid

```
┌─────────────────────────────────────────────────┐
│           CloudFront (CDN)                      │
│  whatsflow.digitalarc.lk distribution          │
└──────────────┬──────────────────────────────────┘
               │
    ┌──────────┴──────────┬───────────────┐
    │                     │               │
┌───▼────┐         ┌──────▼─────┐   ┌────▼─────┐
│ S3     │         │  Lambda    │   │  EC2     │
│ Static │         │  Backend   │   │ WhatsApp │
│ Sites  │         │  APIs      │   │ Service  │
└────────┘         └────────────┘   └──────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    ┌───▼────┐      ┌────▼────┐     ┌────▼────┐
    │  RDS   │      │ ElastiCache│   │   S3   │
    │ MySQL  │      │   Redis   │   │ Uploads│
    └────────┘      └───────────┘   └─────────┘
```

---

## 💡 Three Lambda Deployment Options

### Option 1: Full Serverless (⚠️ Limitations)

**What it is:**
- Frontend: Vercel (Lambda under the hood)
- Backend APIs: AWS Lambda + API Gateway
- WhatsApp: **Won't work** (needs persistent connection)

**Cost:** ~$30-50/month

**Verdict:** ❌ Not recommended - WhatsApp won't work

---

### Option 2: Hybrid (✅ Recommended if using AWS)

**What it is:**
- Frontend: CloudFront + S3 (or Vercel)
- Backend APIs: Lambda + API Gateway
- WhatsApp Service: Small EC2 instance (t3.micro)
- Database: RDS MySQL
- Redis: ElastiCache

**Architecture:**

```
Frontend Apps (S3 + CloudFront)
├── Landing Page
├── Main App
└── Admin Panel

Backend (Lambda Functions)
├── Auth APIs → Lambda
├── Billing APIs → Lambda
├── User Management → Lambda
├── Webhook Handler → Lambda
└── Background Jobs → Lambda

WhatsApp Service (EC2)
├── WhatsApp Connection → EC2 t3.micro
├── Message Queue → SQS
└── Real-time Events → EventBridge

Data Layer
├── Database → RDS MySQL
├── Cache → ElastiCache Redis
└── Files → S3
```

**Cost Breakdown:**
```
CloudFront:          $5-10/month
S3 Storage:          $1-3/month
Lambda:              $0-20/month (pay per use)
EC2 (t3.micro):      $8/month
RDS (t3.micro):      $15/month
ElastiCache:         $13/month
S3 (uploads):        $2/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:               ~$44-71/month
```

**Verdict:** ✅ Good option if you want AWS + serverless benefits

---

### Option 3: Lambda for Specific Functions Only

**What it is:**
- Main app: Single server (our current plan)
- Specific tasks: Lambda functions

**Use Lambda for:**
1. **Invoice PDF Generation**
   - Triggered when payment succeeds
   - Uses puppeteer in Lambda layer
   - Saves PDF to S3

2. **Email Sending**
   - Async email delivery
   - Triggered by SQS queue
   - Uses AWS SES

3. **Image Processing**
   - Resize uploaded images
   - S3 trigger → Lambda → resized image

4. **Scheduled Tasks**
   - Trial expiration checks
   - Payment retry logic
   - Usage report generation

5. **Webhook Processing**
   - PayHere webhooks
   - External integrations
   - High-volume endpoints

**Cost:** $0-5/month (very low usage)

**Verdict:** ✅ Best bang for buck - keep single server, add Lambda where it helps

---

## 📊 Detailed Comparison

### Single Server vs. Hybrid Lambda vs. Full Lambda

| Feature | Single Server | Hybrid Lambda | Full Lambda |
|---------|--------------|---------------|-------------|
| **Cost** | $20-30/month | $44-71/month | Not viable |
| **Complexity** | Low | High | Very High |
| **Scalability** | Limited | Excellent | Excellent |
| **Maintenance** | You manage | AWS manages most | AWS manages |
| **Setup Time** | 2-3 hours | 1-2 days | N/A |
| **WhatsApp** | ✅ Works | ✅ Works (EC2) | ❌ Won't work |
| **Real-time** | ✅ Native | ⚠️ Complex | ❌ Limited |
| **Cold Start** | No | Yes (Lambda) | Yes |
| **Best For** | 0-1K users | 1K-10K users | Not suitable |

---

## 🛠️ Implementation: Option 2 (Hybrid)

### Architecture Components

#### 1. Frontend (S3 + CloudFront)

**Deploy Next.js as static:**
```bash
# Landing page
cd landing
npm run build
# Upload .next/static to S3

# Same for frontend and admin
```

**CloudFront Distribution:**
- Origin: S3 bucket
- Custom domains via Route 53
- SSL certificate from ACM
- Edge caching

**Cost:** ~$5-10/month

---

#### 2. Backend APIs (Lambda + API Gateway)

**Convert Express routes to Lambda functions:**

```typescript
// Example: auth.lambda.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import { authService } from './services/auth.service';

export const login: APIGatewayProxyHandler = async (event) => {
  const { email, password } = JSON.parse(event.body || '{}');
  
  try {
    const result = await authService.login(email, password);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

**Deploy with Serverless Framework:**

```yaml
# serverless.yml
service: whatsflow-api

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  environment:
    DB_HOST: ${env:DB_HOST}
    REDIS_HOST: ${env:REDIS_HOST}

functions:
  authLogin:
    handler: src/lambdas/auth.login
    events:
      - httpApi:
          path: /api/v1/auth/login
          method: post
          
  authRegister:
    handler: src/lambdas/auth.register
    events:
      - httpApi:
          path: /api/v1/auth/register
          method: post
          
  billingSub:
    handler: src/lambdas/billing.subscribe
    events:
      - httpApi:
          path: /api/v1/subscription/subscribe
          method: post

  # ... more functions
```

**Cost:** Free tier = 1M requests/month, then $0.20 per 1M requests

---

#### 3. WhatsApp Service (EC2)

**Why EC2 needed:**
- WhatsApp needs persistent WebSocket
- Lambda can't maintain connections
- Small EC2 instance is cheap

**EC2 Setup:**
```bash
# t3.micro instance ($8/month)
# Ubuntu 22.04
# Install Node.js
# Run only WhatsApp service

pm2 start whatsapp-service.js
```

**WhatsApp Service communicates via:**
- SQS (message queue)
- EventBridge (events)
- Lambda functions for processing

**Cost:** ~$8/month

---

#### 4. Database (RDS MySQL)

**Why RDS:**
- Managed MySQL
- Automatic backups
- Auto-scaling storage
- Multi-AZ for high availability

**Setup:**
```
Instance: db.t3.micro
Storage: 20GB SSD
Backups: 7 days
Multi-AZ: No (single AZ for cost)
```

**Cost:** ~$15/month

---

#### 5. Cache (ElastiCache Redis)

**Why ElastiCache:**
- Managed Redis
- No server maintenance
- Automatic failover

**Setup:**
```
Instance: cache.t3.micro
Version: Redis 7.x
```

**Cost:** ~$13/month

---

## 💰 Cost Analysis

### Startup Phase (0-100 users)

**Single Server:**
```
VPS:                 $24/month
Total:               $24/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Per User:            $0.24
```

**Hybrid Lambda:**
```
CloudFront:          $5/month
Lambda:              $2/month
EC2 (t3.micro):      $8/month
RDS (t3.micro):      $15/month
ElastiCache:         $13/month
S3:                  $3/month
Total:               $46/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Per User:            $0.46
```

**Winner:** Single Server ($22/month cheaper) 💰

---

### Growth Phase (1000 users)

**Single Server:**
```
VPS (8GB):           $40/month
Total:               $40/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Per User:            $0.04
```

**Hybrid Lambda:**
```
CloudFront:          $10/month
Lambda:              $15/month
EC2 (t3.small):      $17/month
RDS (t3.small):      $30/month
ElastiCache:         $20/month
S3:                  $5/month
Total:               $97/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Per User:            $0.097
```

**Winner:** Still Single Server ($57/month cheaper) 💰

---

### Scale Phase (5000+ users)

**Single Server:**
```
VPS (16GB):          $80/month
Or 2x servers:       $120/month
Total:               $80-120/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Per User:            $0.016-0.024
```

**Hybrid Lambda:**
```
CloudFront:          $20/month
Lambda:              $40/month
EC2 (t3.medium):     $34/month
RDS (t3.medium):     $60/month
ElastiCache:         $40/month
S3:                  $10/month
Total:               $204/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Per User:            $0.041
```

**Winner:** Single Server, but gap narrows

**Break-even point:** ~3000-4000 users

---

## 🎯 Recommendation: When to Use Lambda

### Start with Single Server if:
- ✅ You're just launching (0-1K users)
- ✅ Budget is limited
- ✅ Want simple deployment
- ✅ Don't need global distribution yet

### Add Lambda Functions for:
- ✅ Invoice PDF generation (heavy CPU task)
- ✅ Email sending (async task)
- ✅ Image processing
- ✅ Scheduled jobs
- ✅ Webhook handlers (high volume)

### Move to Hybrid Lambda when:
- ✅ You have 3000+ users
- ✅ Revenue justifies cost ($3-5k+/month)
- ✅ Need better scalability
- ✅ Want AWS managed services
- ✅ Global user base needs CDN

---

## 🚀 Option 3: Best of Both Worlds

**My Recommendation:**

### Phase 1: Start Simple (Now)
```
Single Server:       $24/month
Users:               0-1000
Setup:               2-3 hours
```

### Phase 2: Add Lambda Functions (Month 3-6)
```
Single Server:       $24/month
+ Lambda (specific): $5/month
Total:               $29/month
Users:               1000-3000

Add Lambda for:
- PDF generation
- Email queues
- Image processing
- Scheduled tasks
```

### Phase 3: Hybrid Migration (Month 6-12)
```
Hybrid Lambda:       $50-100/month
Users:               3000-10000
```

---

## 📋 Lambda Use Cases in WhatsFlow

### 1. Invoice PDF Generation

**Problem:** CPU-intensive, blocks main server

**Lambda Solution:**
```typescript
// lambda/generate-invoice.ts
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import AWS from 'aws-sdk';

export const handler = async (event) => {
  const { invoiceId } = event;
  
  // Launch headless Chrome
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
  });
  
  // Generate PDF
  const page = await browser.newPage();
  await page.setContent(invoiceHTML);
  const pdf = await page.pdf({ format: 'A4' });
  
  // Upload to S3
  const s3 = new AWS.S3();
  await s3.putObject({
    Bucket: 'whatsflow-invoices',
    Key: `${invoiceId}.pdf`,
    Body: pdf,
  }).promise();
  
  return { invoiceUrl: `s3://whatsflow-invoices/${invoiceId}.pdf` };
};
```

**Trigger:** Payment success → SQS → Lambda

**Cost:** $0.0001 per invoice

---

### 2. Email Queue Processor

**Problem:** Email sending can be slow

**Lambda Solution:**
```typescript
// lambda/process-emails.ts
import { SES } from 'aws-sdk';

export const handler = async (event) => {
  const { Records } = event;
  const ses = new SES();
  
  for (const record of Records) {
    const { email, subject, html } = JSON.parse(record.body);
    
    await ses.sendEmail({
      Source: 'noreply@whatsflow.digitalarc.lk',
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } },
      },
    }).promise();
  }
};
```

**Trigger:** SQS queue → Lambda

**Cost:** $0 (AWS SES free tier = 62,000 emails/month)

---

### 3. Usage Report Generator

**Problem:** Heavy database queries

**Lambda Solution:**
```typescript
// lambda/generate-usage-report.ts
export const handler = async (event) => {
  // Run at 1 AM daily
  const users = await db.query('SELECT * FROM users WHERE ...');
  
  for (const user of users) {
    const usage = await calculateUsage(user.id);
    await db.query('INSERT INTO daily_reports ...');
    
    if (usage.percentage > 90) {
      await sendWarningEmail(user);
    }
  }
};
```

**Trigger:** EventBridge (cron) → Lambda

**Schedule:** Daily at 1 AM

**Cost:** $0.001 per day

---

## 🔧 Tools & Frameworks

### Serverless Framework (Recommended)

```bash
# Install
npm install -g serverless

# Initialize
serverless create --template aws-nodejs-typescript

# Deploy
serverless deploy
```

### AWS SAM

```bash
# Install
brew install aws-sam-cli

# Initialize
sam init

# Deploy
sam deploy --guided
```

### CDK (Infrastructure as Code)

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

const fn = new lambda.Function(this, 'WhatsFlowAPI', {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('lambda'),
});
```

---

## ⚠️ Lambda Limitations for WhatsFlow

### 1. Cold Starts
- First request can take 1-3 seconds
- Subsequent requests fast
- **Solution:** Provisioned concurrency ($$$) or keep single server

### 2. Execution Time Limit
- Max 15 minutes
- WhatsApp needs infinite connection
- **Solution:** EC2 for WhatsApp

### 3. Memory Limits
- Max 10GB
- Usually fine, but can be expensive
- **Solution:** Right-size functions

### 4. Stateless
- Can't maintain connections
- Can't store files locally
- **Solution:** Use S3, RDS, ElastiCache

### 5. Complexity
- More moving parts
- IAM permissions
- VPC configuration
- **Solution:** Start simple, add Lambda gradually

---

## ✅ Final Recommendation

### For Your Situation:

**Now (Month 0-3):**
```
✅ Single Server ($24/month)
Reason: Simple, cheap, works perfectly
```

**Soon (Month 3-6):**
```
✅ Single Server + Lambda functions ($29/month)
Add:
- PDF generation → Lambda
- Email queue → Lambda + SES
- Scheduled tasks → Lambda
```

**Later (Month 6-12):**
```
Consider Hybrid Lambda ($50-100/month)
When: 
- 3000+ users
- $5k+/month revenue
- Need better scaling
```

---

## 🎯 Action Plan

### Don't use Lambda yet if:
- Just starting out
- < 1000 users
- Budget conscious
- Want simple deployment

### Add Lambda when:
- Need specific async tasks
- PDF generation is slow
- Want email queues
- Scheduled jobs would help

### Full hybrid when:
- 3000+ users
- Revenue justifies cost
- Need AWS scale
- Want managed services

---

## 📚 Resources

- **AWS Lambda Pricing:** https://aws.amazon.com/lambda/pricing/
- **Serverless Framework:** https://www.serverless.com/
- **AWS Free Tier:** 1M Lambda requests/month free

---

**Bottom Line:** Lambda is powerful, but **start with single server**. Add Lambda for specific tasks later when it makes sense! 

Your current single-server plan is the right choice. 🎯

