# WhatsFlow Admin Panel

Master administrative control panel for WhatsFlow platform.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5153](http://localhost:5153) with your browser.

## Features

- Admin authentication
- User management
- Subscription management (Phase 2)
- Payment tracking (Phase 2)
- Analytics dashboard (Phase 3)
- System settings (Phase 3)

## Default Admin Credentials

**Note:** These will be configured in the backend during Phase 2-3 implementation.

## Environment Variables

The admin panel connects to the same backend API:

```env
NEXT_PUBLIC_API_URL=http://localhost:2152
NEXT_PUBLIC_APP_URL=http://localhost:2153
NEXT_PUBLIC_LANDING_URL=http://localhost:5253
```

## Production

```bash
npm run build
npm start
```


