# WhatsFlow Frontend - Setup Guide

## 📋 Frontend Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** Shadcn/ui
- **Icons:** Lucide React
- **State Management:** Zustand
- **API Client:** Axios
- **Real-time:** Socket.IO Client

---

## 🚀 Quick Setup

### Step 1: Create Frontend Folder

From your main `whatsflow` directory:

```bash
# You should be in: whatsflow/
npx create-next-app@latest frontend
```

When prompted, select:
```
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … Yes
✔ Would you like to use App Router? … Yes
✔ Would you like to customize the default import alias? … No
```

### Step 2: Navigate to Frontend

```bash
cd frontend
```

### Step 3: Install Dependencies

```bash
# Core dependencies
npm install axios zustand socket.io-client date-fns clsx

# UI Components
npm install lucide-react @headlessui/react

# Form handling
npm install react-hook-form zod @hookform/resolvers

# QR Code
npm install qrcode.react

# Development dependencies
npm install -D @types/node
```

### Step 4: Project Structure

Your frontend folder structure will be:

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── contacts/
│   │   │   │   └── page.tsx
│   │   │   ├── messages/
│   │   │   │   └── page.tsx
│   │   │   ├── campaigns/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── contacts/
│   │   ├── messages/
│   │   └── whatsapp/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── socket.ts
│   │   └── utils.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── whatsappStore.ts
│   └── types/
│       └── index.ts
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── package.json
```

### Step 5: Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 📁 File Structure Overview

Now I'll create all the frontend files for you. Let me start with the core configuration and utility files.

### Configuration Files

**`.env.local`** - Environment variables (already shown above)

**`next.config.js`** - Next.js configuration:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
```

**`tailwind.config.ts`** - Updated with custom colors:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
    },
  },
  plugins: [],
}
export default config
```

---

## 🎯 Next Steps

I'll now create all the component files in separate artifacts:

1. **Core Setup Files** (API client, stores, types)
2. **Authentication Pages** (Login, Register)
3. **Dashboard Layout** (Sidebar, Header)
4. **Dashboard Pages** (Overview, Contacts, Messages)
5. **WhatsApp Components** (Connection, QR Code, Send Message)
6. **UI Components** (Buttons, Cards, Modals)

Let me create these now...