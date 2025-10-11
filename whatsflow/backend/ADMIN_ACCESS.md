# Admin Access Guide

## Default Admin Credentials

**📧 Email:** `admin@whatsflow.ai`  
**🔑 Password:** `Admin@123`

> ⚠️ **IMPORTANT:** Change this password immediately after first login for security!

---

## Creating the Admin User

If the admin user doesn't exist yet, create it using:

```bash
cd whatsflow/backend
npm run admin:create
```

This will:
- Check if an admin already exists
- Generate a secure bcrypt password hash
- Create the admin user in the database
- Display the credentials

---

## Resetting Admin Password

If you've forgotten the password or need to reset it:

```bash
cd whatsflow/backend
npm run admin:reset
```

This interactive script will:
1. Ask for the admin email (default: admin@whatsflow.ai)
2. Verify the admin exists
3. Ask for a new password (default: Admin@123)
4. Update the password securely
5. Display the new credentials

---

## Manual Database Reset (If Scripts Don't Work)

If you need to manually reset the password:

1. Generate a bcrypt hash in Node.js:
   ```javascript
   const bcrypt = require('bcryptjs');
   const hash = bcrypt.hashSync('YourNewPassword', 10);
   console.log(hash);
   ```

2. Update the database:
   ```sql
   UPDATE admin_users 
   SET password_hash = 'YOUR_BCRYPT_HASH_HERE'
   WHERE email = 'admin@whatsflow.ai';
   ```

---

## Admin Roles

The system supports four admin roles:

### 🔑 Super Admin
- Full access to everything
- Can create/edit/delete users
- Can modify subscriptions and billing
- Can access all analytics

### 👨‍💼 Support Admin
- View users and their data
- Can assist with user issues
- Cannot modify billing

### 💰 Finance Admin
- View all payments and invoices
- Can issue refunds
- Access financial reports

### 👁️ Read Only
- View-only access to all data
- No modification permissions

---

## Login URL

**Admin Panel:** `http://localhost:3001/login` (development)  
**Production:** `https://admin.whatsflow.ai/login`

---

## Security Best Practices

1. ✅ Change the default password immediately
2. ✅ Use a strong password (12+ characters, mixed case, numbers, symbols)
3. ✅ Never share admin credentials
4. ✅ Create separate admin accounts for team members
5. ✅ Review admin activity logs regularly
6. ✅ Disable unused admin accounts

---

## Troubleshooting

### "Invalid credentials" error
- Verify email is correct: `admin@whatsflow.ai`
- Check if database has the admin user:
  ```sql
  SELECT email, full_name, role, is_active FROM admin_users;
  ```
- Verify the user is active (`is_active = 1`)
- Try resetting the password using `npm run admin:reset`

### "Admin user already exists"
If you get this error when creating:
- The admin user is already in the database
- Try logging in with the default credentials
- If password is forgotten, use `npm run admin:reset`

### Backend connection issues
- Verify backend is running on port 2152
- Check `NEXT_PUBLIC_API_URL` in admin/.env
- Review backend logs for errors

### CORS errors
If you see CORS errors like "Access-Control-Allow-Origin":
- The backend has been configured to allow:
  - `http://localhost:3000` (main frontend)
  - `http://localhost:3001` (admin panel)
  - `http://localhost:5153` (admin panel alternate)
  - `http://localhost:4000` (landing page)
- Restart the backend after CORS configuration changes
- Check the backend logs to see which origins are allowed
- For production, set `CORS_ORIGIN` in .env with comma-separated origins

---

## Need Help?

Check the admin panel documentation:
- `docs/feature-implementations/01. Admin Panel Setup.md`
- `docs/backend/08. API Reference.md`

