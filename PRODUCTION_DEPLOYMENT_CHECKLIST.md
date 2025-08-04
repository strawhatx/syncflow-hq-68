# Production Deployment Checklist - Encryption System

## Pre-Deployment Checks

### 1. Supabase Plan Verification
- [ ] **Vault Extension Available**: Check if your Supabase plan supports Vault
  ```sql
  -- Run this to check if Vault is available
  SELECT * FROM pg_available_extensions WHERE name = 'vault';
  ```
- [ ] **Plan Upgrade**: If Vault is not available, upgrade to Enterprise plan or contact Supabase support

### 2. Database Backup
- [ ] **Full Backup**: Create a complete database backup before migration
  ```bash
  # Using Supabase CLI
  supabase db dump --data-only > backup_$(date +%Y%m%d_%H%M%S).sql
  
  # Or using pg_dump
  pg_dump -h your-db-host -U postgres -d your-db-name > backup.sql
  ```
- [ ] **Test Restore**: Verify backup can be restored to a test environment

### 3. Environment Verification
- [ ] **Test Environment**: Run migration on staging/test environment first
- [ ] **Data Validation**: Verify existing data integrity after migration
- [ ] **Performance Testing**: Test encryption/decryption performance with your data volume

## Deployment Steps

### 1. Maintenance Window
- [ ] **Schedule Downtime**: Plan for brief maintenance window (5-10 minutes)
- [ ] **User Notification**: Notify users of planned maintenance
- [ ] **Rollback Plan**: Have rollback strategy ready

### 2. Migration Execution
```bash
# 1. Apply the migration
supabase db push

# 2. Verify migration success
supabase db diff

# 3. Check for any errors in logs
supabase logs
```

### 3. Post-Migration Verification
- [ ] **Encryption Keys Created**:
  ```sql
  SELECT name, created_at FROM vault.secrets 
  WHERE name IN ('connector_config_key', 'connection_config_key');
  ```
- [ ] **Data Encrypted**:
  ```sql
  -- Check connector encryption
  SELECT 
    COUNT(*) as total_connectors,
    COUNT(config_encrypted) as encrypted_connectors,
    COUNT(config) as unencrypted_connectors
  FROM connectors;
  
  -- Check connection encryption
  SELECT 
    COUNT(*) as total_connections,
    COUNT(config_encrypted) as encrypted_connections,
    COUNT(config) as unencrypted_connections
  FROM connections;
  ```
- [ ] **Functions Working**:
  ```sql
  -- Test decryption functions
  SELECT * FROM get_all_connectors_with_decrypted_configs() LIMIT 1;
  ```

## Production Monitoring

### 1. Key Management
- [ ] **Key Backup**: Document key backup procedures
- [ ] **Key Rotation**: Plan for periodic key rotation
- [ ] **Access Monitoring**: Monitor who accesses decryption functions

### 2. Performance Monitoring
- [ ] **Query Performance**: Monitor encryption/decryption function performance
- [ ] **Storage Impact**: Monitor storage increase from encrypted data
- [ ] **Error Rates**: Monitor for encryption/decryption errors

### 3. Security Monitoring
- [ ] **Access Logs**: Monitor access to decryption functions
- [ ] **Failed Decryptions**: Alert on failed decryption attempts
- [ ] **Unauthorized Access**: Monitor for unauthorized access patterns

## Rollback Plan

### If Migration Fails
```sql
-- 1. Drop encrypted columns
ALTER TABLE connectors DROP COLUMN IF EXISTS config_encrypted;
ALTER TABLE connectors DROP COLUMN IF EXISTS config_iv;
ALTER TABLE connections DROP COLUMN IF EXISTS config_encrypted;
ALTER TABLE connections DROP COLUMN IF EXISTS config_iv;

-- 2. Drop functions
DROP FUNCTION IF EXISTS public.encrypt_connector_config(JSONB);
DROP FUNCTION IF EXISTS public.decrypt_connector_config(BYTEA, BYTEA);
DROP FUNCTION IF EXISTS public.encrypt_connection_config(JSONB);
DROP FUNCTION IF EXISTS public.decrypt_connection_config(BYTEA, BYTEA);
DROP FUNCTION IF EXISTS public.get_connector_with_decrypted_config(UUID);
DROP FUNCTION IF EXISTS public.get_connection_with_decrypted_config(UUID);
DROP FUNCTION IF EXISTS public.get_all_connectors_with_decrypted_configs();
DROP FUNCTION IF EXISTS public.get_user_connections_with_decrypted_configs(UUID);

-- 3. Drop triggers
DROP TRIGGER IF EXISTS encrypt_connector_config_trigger ON public.connectors;
DROP TRIGGER IF EXISTS encrypt_connection_config_trigger ON public.connections;
DROP FUNCTION IF EXISTS public.encrypt_connector_config_trigger();
DROP FUNCTION IF EXISTS public.encrypt_connection_config_trigger();

-- 4. Drop view
DROP VIEW IF EXISTS public.connectors_public;

-- 5. Restore original config data (if needed)
-- This would require restoring from backup
```

## Production Best Practices

### 1. Key Security
- [ ] **External Key Management**: Consider using external key management (AWS KMS, Azure Key Vault)
- [ ] **Key Rotation**: Implement regular key rotation procedures
- [ ] **Access Control**: Limit access to decryption functions

### 2. Data Protection
- [ ] **Audit Logging**: Log all access to sensitive data
- [ ] **Data Classification**: Clearly mark encrypted vs unencrypted data
- [ ] **Backup Encryption**: Ensure backups are also encrypted

### 3. Compliance
- [ ] **GDPR**: Ensure encryption meets GDPR requirements
- [ ] **SOC2**: Document encryption for compliance audits
- [ ] **Data Retention**: Implement proper data retention policies

## Emergency Contacts

- **Supabase Support**: For Vault-related issues
- **Database Administrator**: For rollback procedures
- **Security Team**: For security incident response

## Post-Deployment Checklist

- [ ] **Application Testing**: Verify all features work with encrypted data
- [ ] **Performance Baseline**: Establish performance baselines
- [ ] **Monitoring Setup**: Configure alerts and monitoring
- [ ] **Documentation Update**: Update runbooks and procedures
- [ ] **Team Training**: Train team on new encryption procedures
- [ ] **Incident Response**: Update incident response procedures

## Success Criteria

- [ ] All existing data successfully encrypted
- [ ] Frontend continues to work with public views
- [ ] Backend can access decrypted data when needed
- [ ] No performance degradation beyond acceptable limits
- [ ] Security monitoring in place
- [ ] Team trained on new procedures 