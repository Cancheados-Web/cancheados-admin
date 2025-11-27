# 🚀 Quick Start Guide - Cancheados Admin

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Backend API running on `http://localhost:3001`
- ✅ PostgreSQL database with migrations applied
- ✅ At least one admin user in the database

---

## Step 1: Create Admin User

### Option A: Using SQL (Recommended for testing)

```sql
-- Connect to your database and run:
INSERT INTO users (
  email, 
  nombre, 
  password_hash, 
  is_admin, 
  email_verified,
  created_at,
  updated_at
)
VALUES (
  'admin@cancheados.com',
  'Admin User',
  -- Password: 'admin123' (hashed with bcrypt)
  '$2b$10$rOvHPz8fGNkMELtBfPQ3/.X8yF7qPQZKJ7LwJ0vZ5nYxKqYqGqK4G',
  true,
  true,
  NOW(),
  NOW()
);
```

### Option B: Register via API then promote to admin

```bash
# 1. Register a new user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cancheados.com",
    "nombre": "Admin User",
    "password": "admin123"
  }'

# 2. Update user to admin in database
UPDATE users SET is_admin = true WHERE email = 'admin@cancheados.com';
```

---

## Step 2: Install Dependencies

```bash
cd cancheados-admin
npm install
```

---

## Step 3: Configure Environment

Create `.env` file (if not exists):

```env
VITE_API_URL=http://localhost:3001
```

---

## Step 4: Start Development Server

```bash
npm run dev
```

The app will start on `http://localhost:5173`

---

## Step 5: Login

1. Open browser to `http://localhost:5173`
2. You'll be redirected to `/login`
3. Enter credentials:
   - **Email**: `admin@cancheados.com`
   - **Password**: `admin123`
4. Click "Sign in"
5. You should be redirected to the dashboard

---

## 🎯 What You Can Do Now

### ✅ Available Features

1. **Dashboard** (`/`)
   - View placeholder stats
   - Navigate to other sections

2. **Users Management** (`/users`)
   - View all users in a table
   - See user details (name, email, phone, created date)
   - Total user count

3. **Disputes** (`/disputes`)
   - Placeholder page (Phase 2)

4. **Authentication**
   - Login/Logout
   - Protected routes
   - Admin-only access

### 🔐 Test Authentication

- **Logout**: Click "Logout" button in header
- **Token Persistence**: Refresh page while logged in (should stay logged in)
- **Protected Routes**: Try accessing `/users` without login (should redirect to `/login`)
- **Non-Admin Access**: Try logging in with non-admin user (should show error)

---

## 🧪 Testing Checklist

- [ ] Can access login page
- [ ] Can login with admin credentials
- [ ] Redirected to dashboard after login
- [ ] Can see user name in header
- [ ] Can navigate to Users page
- [ ] Users page shows data from API
- [ ] Can logout successfully
- [ ] Redirected to login after logout
- [ ] Token persists across page refresh
- [ ] Non-admin users cannot login
- [ ] Protected routes redirect to login when not authenticated

---

## 🐛 Common Issues

### Issue: "Cannot connect to API"
**Solution**: Ensure backend is running on `http://localhost:3001`
```bash
cd cancheados-backend
npm run dev
```

### Issue: "Admin privileges required"
**Solution**: Check user has `is_admin = true` in database
```sql
SELECT email, is_admin FROM users WHERE email = 'admin@cancheados.com';
```

### Issue: "Invalid credentials"
**Solution**: 
- Verify email and password are correct
- Check password hash in database matches
- Try resetting password in database

### Issue: CORS errors
**Solution**: Backend should allow `http://localhost:5173` origin
Check `cancheados-backend/src/app.js` for CORS configuration

### Issue: "Network Error"
**Solution**: 
- Check backend is running
- Verify API_URL in `.env` is correct
- Check browser console for detailed error

---

## 📁 Project Structure

```
cancheados-admin/
├── src/
│   ├── components/
│   │   ├── common/           # Reusable UI components
│   │   ├── Layout.tsx        # Main layout with nav
│   │   └── ProtectedRoute.tsx # Auth guard
│   ├── contexts/
│   │   └── AuthContext.tsx   # Auth state management
│   ├── lib/
│   │   ├── api.ts           # API client with auth
│   │   └── types.ts         # TypeScript definitions
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── UsersPage.tsx
│   └── App.tsx              # Main app with routing
├── .env                     # Environment variables
└── package.json
```

---

## 🔜 Next Steps

After confirming Phase 1 works:

1. **Phase 2**: Implement Disputes Management
   - Disputes list page
   - Dispute detail page
   - Resolution workflow

2. **Phase 3**: Implement Team & Venue Management
   - Teams list and detail pages
   - Venues list and detail pages
   - Admin actions (suspend, activate)

3. **Phase 4**: Implement Reports & Analytics
   - Dashboard with real data
   - Reports page
   - Audit logs viewer

---

## 📞 Need Help?

- Check `PHASE1_IMPLEMENTATION_SUMMARY.md` for detailed implementation info
- Check `ADMIN_IMPLEMENTATION_RESEARCH.md` for architecture details
- Review backend API docs at `http://localhost:3001/documentation`

---

**Happy Testing! 🎉**