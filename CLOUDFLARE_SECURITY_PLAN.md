# Cloudflare Zero-Trust Security Plan: Film4u AI

As a Senior Cloud Security Architect, I have designed this multi-layered defense strategy for **Film4u AI**. This plan implements a **Zero-Trust Cloud Security Model** across Cloudflare, Vercel, and Supabase.

---

## 🏗️ Architecture Design

### 🎯 Entry Point: Cloudflare Edge
All traffic (Web & API) enters through Cloudflare. Cloudflare acts as the **Edge Security Layer**, filtering malicious traffic before it ever reaches Vercel or Supabase.

### ⚡ Layer 1: Frontend (Vercel)
Vercel hosts the static assets and React application. Cloudflare proxies Vercel via CNAME flattening.

### 🧠 Layer 2: API & Logic (Supabase Edge Functions)
Business logic is executed in Supabase Edge Functions. Cloudflare monitors these calls via a custom hostname proxy to detect bot abuse.

### 🛡️ Layer 3: Data (Supabase Postgres + RLS)
The ultimate source of truth. Security here is enforced by **Row Level Security (RLS)**, ensuring that even if an attacker bypasses the WAF, they can only access data they are explicitly authorized to see.

---

## 🛠️ Phase 1: Cloudflare DNS & SSL/TLS Configuration

### 1. DNS Management
- **Proxy Status**: All A/CNAME records must be **Proxied (Orange Clouded)**.
- **CNAME Flattening**: Point your domain to `cname.vercel-dns.com`.
- **DNSSEC**: Enable DNSSEC in the Cloudflare dashboard to prevent DNS spoofing.

### 2. SSL/TLS Settings
- **Encryption Mode**: Set to **Full (Strict)**. This ensures end-to-end encryption between Cloudflare and Vercel/Supabase.
- **Minimum TLS Version**: **1.2**. (Avoid 1.0/1.1 for regulatory compliance).
- **HSTS**: Enable with `includeSubDomains` and `preload`.

---

## 🧱 Phase 2: Web Application Firewall (WAF) & Firewall Rules

### Recommended Firewall Rules (Production)

| Priority | Action | Description | Expression |
| :--- | :--- | :--- | :--- |
| 1 | **Block** | Malicious Bot Attack | `(cf.client.bot) or (cf.threat_score gt 14)` |
| 2 | **Challenge** | High-Risk Countries | `(ip.geoip.country in {"CN", "KP", "RU", "IR"})` |
| 3 | **Block** | SQL Injection Attempt | `(http.request.uri.query contains "select") or (http.request.uri.query contains "union")` |
| 4 | **Block** | Access to Hidden Files | `(http.request.uri.path contains "/.env") or (http.request.uri.path contains "/.git")` |

---

## 🚦 Phase 3: Rate Limiting & Bot Protection

### 1. Auth & Login Protection
- **Target**: `*/auth/v1/token*`
- **Rule**: Limit to **5 requests per minute** per IP.
- **Action**: Managed Challenge (to allow humans but block brute-force bots).

### 2. API / Edge Function Protection
- **Target**: `*/functions/v1/*`
- **Rule**: Limit to **20 requests per minute** per user.
- **Action**: Block/Log.

---

## 🔒 Phase 4: Security Headers & CSP
We must enforce security headers at the Cloudflare Edge using **Transform Rules** or **Cloudflare Workers**.

### Content Security Policy (CSP)
```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; connect-src 'self' https://*.supabase.co https://*.google.com https://api.themoviedb.org; img-src 'self' data: https://image.tmdb.org https://images.unsplash.com; style-src 'self' 'unsafe-inline';
```

---

## 🛸 Phase 5: Complementing Supabase RLS

Cloudflare is a **Perimeter Defense**, while Supabase RLS is **Identity-Based Defense**.

1. **Cloudflare Filters**: Blocks broad attacks (DDoS, Bots, Known Malicious IPs).
2. **Supabase RLS Enforces**: Blocks logic-based attacks (e.g., User A trying to read User B's watchlist).
3. **Integration Tip**: In Cloudflare WAF, we check for a valid `Authorization` header present on any request to `/functions/v1/`. If the JWT is missing, Cloudflare drops it before the Edge Function even initializes, saving you execution costs.

---

## ✅ Production Security Checklist

- [ ] **Cloudflare Proxy**: Enabled for all records.
- [ ] **Full (Strict) SSL**: Verified end-to-end.
- [ ] **WAF OWASP Mode**: Set to "High" sensitivity.
- [ ] **Bot Fight Mode**: Enabled.
- [ ] **HSTS**: Preloaded.
- [ ] **Supabase RLS**: Enabled on all tables (`profiles`, `user_library`, `watch_history`).
- [ ] **Rate Limits**: Applied to `/auth` and `/functions`.
- [ ] **CSP Headers**: Deployed and tested for no breakage.
- [ ] **IP Reputation**: Cloudflare "Security Level" set to "Medium" or "High".

---

**Archtect's Note**: Security is not a state, but a process. Regularly review your WAF logs in Cloudflare to identify new attack patterns and refine your rules.
