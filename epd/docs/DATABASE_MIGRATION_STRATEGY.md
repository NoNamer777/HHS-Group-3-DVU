# Database Migration Strategy - RefreshToken Removal

## Overview

The Auth0 migration requires removing the `RefreshToken` table from the database. This is a **breaking schema change** that requires careful planning.

## Migration Artifacts

- **SQL Migration**: `prisma/migrations/YYYYMMDDHHMMSS_remove_refresh_token_model/migration.sql`
- **Documentation**: `prisma/migrations/YYYYMMDDHHMMSS_remove_refresh_token_model/README.md`

## Deployment Strategy

### Option 1: Zero-Downtime Blue-Green Deployment (Recommended for Production)

This approach minimizes user impact by running old and new systems in parallel.

**Steps:**

1. **Phase 1: Deploy Auth0-enabled backend (old DB schema)**
   - Deploy new backend with Auth0 support
   - Keep RefreshToken table in database (unused but present)
   - Old JWT sessions continue working, new users get Auth0
   - Monitor for 24-48 hours

2. **Phase 2: Migrate all users to Auth0**
   - Force logout all users (invalidate all JWT sessions)
   - All users re-authenticate via Auth0
   - Verify no JWT token usage in logs

3. **Phase 3: Run database migration**
   - Take database backup
   - Run migration to drop RefreshToken table
   - Verify application health

**Pros:**
- Minimal downtime
- Gradual user migration
- Easy rollback before Phase 3

**Cons:**
- Requires multiple deployments
- Longer migration timeline

---

### Option 2: Maintenance Window Deployment (Acceptable for Development/Staging)

**Steps:**

1. **Schedule maintenance window**
   - Notify users of planned downtime
   - Recommended: Off-peak hours, 30-60 minute window

2. **Take database backup**
   ```bash
   pg_dump -h <host> -U <user> -d epd_db > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Stop application**
   ```bash
   docker-compose down
   ```

4. **Deploy new code**
   - Deploy Auth0-enabled backend
   - Update environment variables

5. **Run migration**
   ```bash
   npm run prisma:migrate
   ```

6. **Start application**
   ```bash
   docker-compose up -d
   ```

7. **Verify health**
   - Test Auth0 login
   - Check logs for errors
   - Monitor authentication metrics

**Pros:**
- Simple, straightforward process
- Completes in single deployment

**Cons:**
- Requires downtime
- All users forced to re-authenticate simultaneously
- Higher risk if issues occur

---

### Option 3: Delayed Migration (Not Recommended)

**Steps:**

1. Deploy Auth0-enabled backend
2. Leave RefreshToken table in database (unused)
3. Schedule migration for later date

**Pros:**
- No immediate database changes
- Can validate Auth0 integration first

**Cons:**
- Database schema inconsistent with code
- Technical debt accumulates
- Confusion for future developers
- Still requires eventual migration with downtime

---

## Pre-Migration Verification

Before running migration in **any** environment:

```bash
# 1. Verify no RefreshToken references in code
grep -r "RefreshToken" backend/src/
# Should return no results

# 2. Verify Prisma schema
grep "RefreshToken" prisma/schema.prisma
# Should return no results

# 3. Test Auth0 authentication
npm run test:m2m
# Should succeed with valid tokens

# 4. Check database connection
docker ps | grep postgres
# Should show running PostgreSQL container
```

## Post-Migration Verification

After running migration:

```sql
-- 1. Verify table dropped
SELECT tablename FROM pg_tables WHERE tablename = 'RefreshToken';
-- Should return 0 rows

-- 2. Verify User table intact
SELECT id, email, role FROM "User" LIMIT 5;
-- Should return user data

-- 3. Check for orphaned foreign keys
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE confrelid = 'RefreshToken'::regclass;
-- Should return 0 rows
```

## Rollback Procedure

If issues occur after migration:

```bash
# 1. Stop application immediately
docker-compose down

# 2. Restore database from backup
psql -h localhost -U epd_user -d epd_db < backup_YYYYMMDD_HHMMSS.sql

# 3. Revert code deployment
git checkout <previous-commit>
docker-compose up -d

# 4. Investigate issues before re-attempting
```

**Important**: Rollback requires database restore - the migration cannot be reversed because token data is permanently deleted.

## Recommended Approach

**For Production**: Use Option 1 (Blue-Green Deployment)
**For Staging**: Use Option 2 (Maintenance Window)
**For Development**: Use Option 2 (Maintenance Window)

## Current Status

- [x] Migration SQL created
- [x] Migration documentation written
- [ ] Migration tested in development
- [ ] Migration tested in staging
- [ ] Migration approved for production
- [ ] Database backup procedure verified
- [ ] Rollback procedure tested
- [ ] Monitoring and alerting configured

---

**See Also:**
- Migration SQL: `prisma/migrations/YYYYMMDDHHMMSS_remove_refresh_token_model/migration.sql`
- Migration Details: `prisma/migrations/YYYYMMDDHHMMSS_remove_refresh_token_model/README.md`
- Auth0 Migration Guide: `docs/AUTH0_MIGRATION.md`
