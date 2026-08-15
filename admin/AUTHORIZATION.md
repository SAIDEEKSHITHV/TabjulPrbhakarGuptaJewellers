# Database Authorization & Security Guidelines

This document details the security and authorization system configured for the dynamic jewelry catalog database.

---

## 1. Authentication vs. Database Authorization
- **Authentication (Supabase Auth):** Handles user registration, credentials validation, password resets, and session management. It runs in the browser via standard JWT verification.
- **Authorization (Row Level Security - RLS):** The true security boundary protecting the database. All SQL tables (`collections`, `products`, `product_images`) have RLS active. Even if a user bypasses client router protections, the Supabase API rejects any unauthorized read or write operations.

---

## 2. API Key Restraints & Secrets
* **Public anon/publishable key only:** The React admin frontend runs entirely client-side. It communicates with Supabase using only the public `anon` API key.
* **No Administrative Secrets:** The Supabase `service_role` key and the Cloudinary API secret must **never** be exposed in the frontend client code, environment variables, or build assets. Exposing these keys yields administrative write/delete capabilities to anyone inspecting the client source.

---

## 3. Catalog RLS Access Policies
* **Public Storefront Selects:** Any anonymous browser can fetch rows where `is_published = true`.
* **Administrative Writes:** Database mutations (insert, update, delete) on all tables are protected by RLS rules that evaluate the custom PostgreSQL helper function `public.is_admin()`.

---

## 4. centralizing Administrative Privileges (`public.is_admin()`)
The security layer uses a Postgres function to determine write access:
```sql
create or replace function public.is_admin()
returns boolean as $$
begin
    -- Currently, any authenticated user is treated as admin for CRUD access.
    return (auth.role() = 'authenticated');
end;
$$ language plpgsql security definer;
```

### Production Hardening Guidelines:
Before deploying to production, the `public.is_admin()` function must be updated in your Supabase SQL Editor to restrict CRUD operations to only the owner's specific authenticated account (by checking user email, ID, or user metadata role). 

#### Option A: Restricting to Specific Email Addresses
```sql
create or replace function public.is_admin()
returns boolean as $$
begin
    return (
        auth.role() = 'authenticated' 
        and auth.jwt() ->> 'email' in ('owner@tpgjewellers.com', 'admin@tpgjewellers.com')
    );
end;
$$ language plpgsql security definer;
```

#### Option B: Restricting via Custom JWT Metadata Claims
```sql
create or replace function public.is_admin()
returns boolean as $$
begin
    return (
        auth.role() = 'authenticated' 
        and auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    );
end;
$$ language plpgsql security definer;
```

By using this modular approach, database authorization criteria can be modified directly in the cloud database without requiring code refactoring or redeploying the client applications.
