# Migration: Remove RefreshToken Model

**Date**: December 23, 2025  
**Type**: Breaking Schema Change  
**Reason**: Auth0 M2M migration - JWT refresh tokens no longer used

## What This Migration Does

This migration removes JWT-based authentication artifacts from the database:

1. **Makes password field optional** in User table (Auth0 handles authentication)
2. **Drops RefreshToken table** and all associated constraints and indexes

### Schema Changes

- **Alters Column**: `User.password` → nullable (String → String?)
- **Drops Table**: `RefreshToken`
- **Drops Foreign Key**: `RefreshToken_userId_fkey` (RefreshToken → User)
- **Drops Indexes**: 
  - `RefreshToken_userId_idx`
  - `RefreshToken_token_idx`

## Breaking Change Impact

⚠️ **WARNING**: This is a destructive operation that will delete all refresh token data.

### Data Loss
- All existing refresh tokens will be permanently deleted
- Users with active sessions using JWT refresh tokens will need to re-authenticate
- No data migration is possible (tokens are incompatible with Auth0)

### Application Impact
- **Backend**: All JWT authentication code has been removed, replaced with Auth0 M2M
- **Frontend**: May need to handle authentication errors for existing sessions
- **Services**: Any M2M clients using old JWT tokens must switch to Auth0

## Pre-Migration Checklist

Before running this migration in production:

- [ ] Verify all services have migrated to Auth0 M2M authentication
- [ ] Confirm no code references `RefreshToken` model (run: `grep -r "RefreshToken" backend/`)
- [ ] Test Auth0 authentication flow in staging environment
- [ ] Plan for user re-authentication after deployment
- [ ] Set up monitoring for authentication failures
- [ ] Communicate planned downtime to users (if applicable)
- [ ] Have rollback plan ready (requires restoring old backend + DB backup)

## Running the Migration

### Development
```bash
# Database must be running (docker-compose up)
npm run prisma:migrate
```

### Production
```bash
# 1. Backup database first!
pg_dump -h <host> -U <user> -d <database> > backup_before_refresh_token_removal.sql

# 2. Deploy new backend code with Auth0 support

# 3. Run migration
npx prisma migrate deploy

# 4. Verify application health
```

## Rollback Plan

If issues occur after deployment:

1. **Stop the application** to prevent data corruption
2. **Restore database** from backup taken before migration
3. **Deploy previous backend version** with JWT authentication
4. **Investigate issues** before re-attempting migration

**Note**: Rolling back requires database restore - you cannot simply reverse the migration as token data will be lost.

## Verification

After migration, verify:

```sql
-- Should return no results
SELECT tablename FROM pg_tables WHERE tablename = 'RefreshToken';

-- User table should still exist and have no refreshTokens relation
SELECT * FROM "User" LIMIT 1;
```

## Related Changes

- PR: Auth0 M2M Migration for EPD
- Documentation: `docs/AUTH0_MIGRATION.md`
- Code Changes: Removed `auth.routes.ts`, `auth.controller.ts`, `auth.middleware.ts`
