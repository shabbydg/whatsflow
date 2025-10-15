# WhatsFlow Deployment Setup

## Quick Start

1. **Create the environment file with your API keys:**
   ```bash
   cp scripts/deploy-env.sh.example scripts/deploy-env.sh
   # Edit scripts/deploy-env.sh with your actual API keys
   ```

2. **Run the deployment:**
   ```bash
   bash scripts/deploy-single-server.sh
   ```

## API Keys Required

You need to set these environment variables in `scripts/deploy-env.sh`:

- **GOOGLE_API_KEY**: Your Google Gemini API key
- **ANTHROPIC_API_KEY**: Your Anthropic Claude API key  
- **OPENAI_API_KEY**: Your OpenAI API key (optional)
- **EMAIL_PASSWORD**: Your Gmail App Password for accounts@digitalarc.lk

## Security Notes

- `scripts/deploy-env.sh` is **NOT committed to git** (added to .gitignore)
- Contains sensitive API keys and passwords
- Keep this file secure and never share it publicly

## What the Script Does

1. Updates system and installs required software (Node.js, MySQL, Redis, Nginx, PM2, Certbot)
2. Sets up MySQL with secure configuration
3. Clones the WhatsFlow repository
4. Creates database and runs all migrations
5. Configures backend and frontend applications
6. Builds all applications
7. Starts applications with PM2
8. Configures Nginx with SSL certificates
9. Sets up firewall and creates admin user

## After Deployment

Your WhatsFlow will be available at:
- Landing: https://whatsflow.digitalarc.lk
- Main App: https://app.whatsflow.digitalarc.lk  
- Admin: https://admin.whatsflow.digitalarc.lk
- API: https://api.whatsflow.digitalarc.lk

Admin login:
- Email: admin@whatsflow.digitalarc.lk
- Password: reacher53#Jack


