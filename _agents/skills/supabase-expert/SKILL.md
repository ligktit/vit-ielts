---
name: supabase-expert
description: Specialized skillset for architecting Supabase backends, implementing RLS, and data migration.
---

# Supabase Architecture and Migration Expert

This skill provides comprehensive instructions for managing the transition from WordPress to Supabase within the IELTS-Prediction project.

## Core Capabilities
1. **Schema Design**: Translating WordPress ACF fields and custom post types into optimized PostgreSQL tables.
2. **RLS (Row Level Security)**: Implementing granular security policies to protect user data and restrict admin-only operations.
3. **JSONB Handling**: Efficiently querying and updating complex nested data structures (e.g., quiz answers and device fingerprints).
4. **Auth Implementation**: Setting up SSR-compliant authentication (Next.js context) and handling OAuth providers.
5. **Data Enrichment**: Creating triggers and RPC functions for automated updates (e.g., `increment_tests_taken`).

## Guidelines
- **Table Relationships**: Always use UUIDs as primary keys.
- **Security Check**: Verify every new table has RLS enabled with a corresponding policy.
- **Client Usage**: Use `lib/supabase/client.ts` for browser-side and `lib/supabase/server.ts` (with SSR context) for server-side.
- **Admin Operations**: RESERVE `lib/supabase/admin.ts` (service role) EXCLUSIVELY for protected API routes to bypass RLS safely.

## Common Snippets
### Creating an RLS Policy
```sql
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
CREATE POLICY "[policy_name]" ON [table_name] FOR [operation: SELECT/INSERT/UPDATE/DELETE] 
USING (auth.uid() = [owner_column] OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND roles ? 'administrator'));
```
