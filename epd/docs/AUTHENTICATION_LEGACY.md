# Authentication & Token Management

## Overview

The EPD API uses a secure token-based authentication system with **access tokens** and **refresh tokens** to balance security and user experience.

## Token Strategy

### Access Tokens
- **Lifetime**: 15 minutes
- **Purpose**: Short-lived tokens for API authentication
- **Storage**: Client-side (memory preferred, not localStorage)
- **Type**: JWT (JSON Web Token)
- **Algorithm**: HS256 (explicitly enforced to prevent algorithm confusion attacks)

### Refresh Tokens
- **Lifetime**: 7 days
- **Purpose**: Long-lived tokens to obtain new access tokens
- **Storage**: Secure HTTP-only cookie (recommended) or secure storage
- **Type**: Cryptographically secure random string
- **Database**: Stored in database for revocation capability

## Authentication Flow

### 1. Login/Register
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "a1b2c3d4e5f6...",
  "expiresIn": "15m",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "DOCTOR"
  }
}
```

### 2. API Requests
Include the access token in the Authorization header:

```http
GET /api/patients
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 3. Token Refresh
When the access token expires (15 minutes), use the refresh token to get a new one:

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "15m"
}
```

### 4. Logout
Revoke the refresh token:

```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

### 5. Revoke All Tokens (Security Breach)
If you suspect a security breach, revoke all refresh tokens for the user:

```http
POST /api/auth/revoke-all
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Client Implementation Guide

### Web Application (React/Vue/Angular)

```typescript
class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    
    // Store refresh token securely (e.g., httpOnly cookie)
    return data;
  }

  async apiRequest(url: string, options: RequestInit = {}) {
    // Add access token to request
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`
    };

    let response = await fetch(url, { ...options, headers });

    // If 401, try to refresh token
    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry request with new token
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(url, { ...options, headers });
      }
    }

    return response;
  }

  async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;
        return true;
      }
      
      // Refresh token invalid, redirect to login
      this.logout();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  async logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });
    
    this.accessToken = null;
    this.refreshToken = null;
  }
}
```

### System-to-System Integration (Backend Service)

For automated systems or backend services, you can:

1. **Use service accounts with longer access tokens** (if needed, adjust `ACCESS_TOKEN_EXPIRY`)
2. **Implement automatic token refresh** in your HTTP client
3. **Use API keys** (future feature) for machine-to-machine communication

Example with automatic refresh:

```typescript
class ServiceClient {
  private accessToken: string = '';
  private refreshToken: string = '';
  private tokenExpiry: Date = new Date();

  constructor(private email: string, private password: string) {
    this.authenticate();
  }

  private async authenticate() {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: this.email, 
        password: this.password 
      })
    });

    const data = await response.json();
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    
    // Calculate expiry (15 minutes - 1 minute buffer)
    this.tokenExpiry = new Date(Date.now() + 14 * 60 * 1000);
  }

  private async ensureValidToken() {
    if (new Date() >= this.tokenExpiry) {
      await this.refreshAccessToken();
    }
  }

  private async refreshAccessToken() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      this.accessToken = data.accessToken;
      this.tokenExpiry = new Date(Date.now() + 14 * 60 * 1000);
    } else {
      // Re-authenticate if refresh fails
      await this.authenticate();
    }
  }

  async request(url: string, options: RequestInit = {}) {
    await this.ensureValidToken();
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
  }
}

// Usage
const client = new ServiceClient('service@example.com', 'service-password');
const patients = await client.request('/api/patients');
```

## Security Considerations

### Why Two Token Types?

1. **Short-lived access tokens** minimize the window of vulnerability if a token is compromised
2. **Long-lived refresh tokens** provide good UX without requiring frequent logins
3. **Refresh tokens can be revoked** from the database if suspicious activity is detected
4. **Access tokens are stateless** (JWT) for scalability

### Best Practices

- ✅ **Store access tokens in memory** (not localStorage)
- ✅ **Store refresh tokens in httpOnly cookies** or secure storage
- ✅ **Use HTTPS** in production
- ✅ **Implement token rotation** (generate new refresh token on each refresh)
- ✅ **Set up token cleanup jobs** to remove expired tokens from database
- ✅ **Monitor for suspicious activity** (multiple refresh tokens, unusual locations)
- ✅ **Implement rate limiting** on auth endpoints

### Token Rotation (Future Enhancement)

For enhanced security, consider implementing refresh token rotation where each refresh operation generates a new refresh token and invalidates the old one.

## Database Schema

```prisma
model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
  revokedAt DateTime?
  
  @@index([userId])
  @@index([token])
}
```

## Troubleshooting

### "Token expired" error
- Check system time synchronization
- Verify token expiry settings match between client and server

### "Invalid refresh token"
- Token may have been revoked
- Token may have expired (7 days)
- User should login again

### Frequent logouts
- Check if access token is being stored correctly
- Ensure refresh mechanism is implemented
- Verify network connectivity for refresh requests

## Migration from Old System

The old system used 24-hour access tokens without refresh tokens. To migrate:

1. Update Prisma schema and run migration
2. Update client code to handle two tokens
3. Implement refresh logic in clients
4. Update documentation for API consumers
5. Consider a grace period where both systems work

## Monitoring

Monitor these metrics:
- Failed refresh attempts (potential token theft)
- Token refresh frequency (should be ~every 15 minutes per user)
- Revoked token count (should be low unless security issues)
- Active refresh tokens per user (unusual if >3-5)
