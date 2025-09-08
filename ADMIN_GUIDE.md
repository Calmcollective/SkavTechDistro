# Skavtech Admin Guide

## Admin User Setup

The application includes a default admin user that is automatically seeded when you run the database migrations and seeding process.

### Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123!@#`
- **Email**: `admin@skavtech.co.ke`
- **Role**: `admin`

### How to Access Admin Features

1. **Start the Application**:
   ```bash
   npm run dev
   ```

2. **Navigate to Login Page**:
   - Open your browser and go to `http://localhost:5000`
   - Click on "Sign In" or navigate to `/login`

3. **Login as Admin**:
   - **Username**: `admin`
   - **Password**: `admin123!@#`
   - Click "Sign In"

4. **Access Admin Routes**:
   Once logged in as admin, you can access the following protected routes:

   - **Device Management**: `GET/POST /api/admin/devices`
   - **Device Updates**: `PATCH /api/admin/devices/:id`
   - **Dashboard Stats**: `GET /api/admin/stats`

### Admin API Endpoints

All admin endpoints require authentication with admin role:

#### Device Management
```http
GET /api/admin/devices
```
- **Description**: Get all devices with optional filtering
- **Query Parameters**:
  - `status`: Filter by device status (received, diagnosed, repaired, qc, ready)
  - `technician`: Filter by assigned technician
- **Response**: Array of device objects

```http
POST /api/admin/devices
```
- **Description**: Create a new device
- **Body**: Device object (see schema)
- **Response**: Created device object

```http
PATCH /api/admin/devices/:id
```
- **Description**: Update an existing device
- **Body**: Partial device object with updates
- **Response**: Updated device object

#### Dashboard Statistics
```http
GET /api/admin/stats
```
- **Description**: Get dashboard statistics
- **Response**:
```json
{
  "received": 5,
  "in_repair": 3,
  "qc": 2,
  "ready": 8,
  "total": 18
}
```

### Testing Admin Access

You can test admin access using curl or any HTTP client:

```bash
# 1. Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123!@#"}'

# 2. Use the returned token to access admin routes
curl -X GET http://localhost:5000/api/admin/devices \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Security Notes

- **Change Default Password**: After first login, change the default admin password
- **Environment Variables**: In production, ensure `SESSION_SECRET` and `JWT_SECRET` are properly configured
- **HTTPS**: Use HTTPS in production for secure cookie transmission
- **Rate Limiting**: Admin endpoints are subject to the same rate limiting as regular endpoints

### Creating Additional Admin Users

To create additional admin users programmatically:

```typescript
import bcrypt from "bcrypt";
import { db } from "./server/storage";
import { users } from "./shared/schema";

const createAdminUser = async () => {
  const hashedPassword = await bcrypt.hash("newadminpassword", 12);

  await db.insert(users).values({
    username: "newadmin",
    password: hashedPassword,
    role: "admin",
    email: "newadmin@skavtech.co.ke",
    firstName: "New",
    lastName: "Admin",
    phoneNumber: "+254700000001",
    countryCode: "+254",
    city: "Nairobi",
    accountType: "business",
    companyName: "Skavtech Solutions Ltd",
    jobTitle: "Administrator",
    primaryInterest: "Fleet Management",
    communicationPreferences: ["email"],
  });
};
```

### Troubleshooting

**403 Forbidden Error**:
- Ensure you're logged in as a user with `role: "admin"`
- Check that the JWT token is valid and not expired
- Verify the session is active

**401 Unauthorized Error**:
- Ensure you're logged in first
- Check that the Authorization header is properly set
- Verify the token hasn't expired

**Database Connection Issues**:
- Ensure the database is properly migrated: `npm run db:migrate`
- Check that the `DATABASE_URL` environment variable is set
- Verify the database file exists and is accessible

### Development Notes

- Admin middleware is located in `server/routes.ts`
- User roles are defined in `shared/schema.ts`
- Password hashing uses bcrypt with 12 salt rounds
- Session management uses connect-pg-simple for PostgreSQL or memory store for development