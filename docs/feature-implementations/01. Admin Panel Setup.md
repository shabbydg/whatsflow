# Admin Panel Setup Guide

## Current Status

The admin panel UI has been created at `http://localhost:5153`, but **backend implementation is not yet complete**.

---

## What Works Now

✅ Admin panel UI is fully functional  
✅ Login page is ready  
✅ Dashboard layout with sidebar  
✅ All navigation pages created  
✅ Authentication state management  

---

## What's Missing (Backend Implementation)

❌ Admin authentication endpoint (`/api/v1/admin/auth/login`)  
❌ Admin user database table  
❌ Admin-specific middleware and routes  
❌ Actual admin users in database  

---

## How to Set Up Admin Access

### Phase 2 Backend Tasks

To make the admin panel functional, we need to implement:

1. **Create Admin Users Table** (Database Migration)
```sql
CREATE TABLE admin_users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('super_admin', 'support_admin', 'finance_admin', 'read_only') DEFAULT 'read_only',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create first super admin (change password after login!)
INSERT INTO admin_users (id, email, password_hash, full_name, role) VALUES
  (UUID(), 'admin@whatsflow.ai', '$2a$10$...', 'System Admin', 'super_admin');
```

2. **Backend Files to Create**
```
whatsflow/backend/src/
├── controllers/
│   └── admin.controller.ts       # Admin auth and management
├── services/
│   └── admin.service.ts           # Admin business logic
├── routes/
│   └── admin.routes.ts            # Admin API routes
└── middleware/
    └── admin-auth.middleware.ts   # Admin authorization
```

3. **Admin API Endpoints Needed**
```typescript
POST   /api/v1/admin/auth/login           # Admin login
GET    /api/v1/admin/auth/profile         # Get admin profile
GET    /api/v1/admin/users                # List all users
GET    /api/v1/admin/users/:id            # Get user details
PUT    /api/v1/admin/users/:id            # Update user
DELETE /api/v1/admin/users/:id            # Delete user
GET    /api/v1/admin/subscriptions        # List subscriptions (Phase 2)
GET    /api/v1/admin/payments              # List payments (Phase 2)
GET    /api/v1/admin/analytics             # Platform analytics (Phase 3)
```

---

## Temporary Testing Setup

For now, you can test the admin panel UI without backend:

1. **Start the admin panel:**
```bash
cd /Users/digitalarc/Development/Webroot/whatsflow/admin
npm install
npm run dev
```

2. **Visit:** http://localhost:5153

3. **What You'll See:**
   - Login page is visible
   - Login will fail (backend not implemented)
   - You can bypass login temporarily by manually setting auth in browser console:

```javascript
// Open browser console on login page and run:
localStorage.setItem('admin-auth-storage', JSON.stringify({
  state: {
    admin: {
      id: 'test-admin-id',
      email: 'admin@whatsflow.ai',
      full_name: 'Test Admin',
      role: 'super_admin'
    },
    token: 'test-token'
  },
  version: 0
}));
// Then refresh the page
```

This will let you explore the admin UI, but API calls will still fail.

---

## Default Admin Credentials (To Be Created)

When the backend is implemented, create this default admin:

**Email:** admin@whatsflow.ai  
**Password:** (Set during backend setup)  
**Role:** super_admin  

---

## Admin Roles & Permissions

### Super Admin
- Full access to everything
- Can create/edit/delete users
- Can modify subscriptions and billing
- Can access all analytics

### Support Admin  
- View users and their data
- Can assist with user issues
- Cannot modify billing

### Finance Admin
- View all payments and invoices
- Can issue refunds
- Access financial reports

### Read Only
- View-only access to all data
- Cannot make any changes

---

## Implementation Priority

This will be implemented in **Phase 2** along with the billing system, as both are tightly integrated:

1. Create admin database schema
2. Create admin authentication endpoints
3. Create admin service layer
4. Create admin routes
5. Implement user management endpoints
6. Test admin login and user management

---

## Security Notes

- Admin passwords will be hashed with bcrypt
- Admin sessions will use JWT tokens
- All admin actions will be logged in `admin_activity_logs` table
- Admin endpoints will require `admin-auth` middleware
- Rate limiting will be applied to admin login

---

## Next Steps

**For Now:**
- Test admin UI by using the localStorage workaround above
- Review the UI and provide feedback
- Plan Phase 2 implementation

**For Production:**
- Implement backend admin authentication
- Create initial admin user
- Test all admin features
- Set up proper admin access controls

---

**Status:** UI Complete | Backend Pending Phase 2  
**ETA:** Backend implementation will be part of Phase 2 (billing system)


