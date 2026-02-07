# High-Capacity Movie Storage Strategy: Film4u AI

To support **"High GB"** movie files and **"Unlimited"** storage scaling, we have implemented a cloud-native storage strategy that bypasses standard browser timeout limits.

---

### 🚀 **Technical Strategy for Large Files**

1.  **Resumable Uploads (TUS Protocol)**:
    *   Standard HTTP uploads fail for files over 1GB due to network instability. 
    *   We have updated `movieService.js` to use **Resumable Patterns**. This allows the browser to upload large 4K movies in chunks. If the connection drops, it resumes exactly where it left off.

2.  **Edge CDN Delivery**:
    *   The `videos` bucket is configured with a **Global CDN Cache**. This ensures that if a user in New York watches a 10GB indie film, it is cached at the local high-speed edge, saving your primary storage egress.

3.  **Storage Scaling Path**:
    *   **Supabase Storage**: Excellent for the initial 5GB-50GB scale.
    *   **External S3/Cloudflare R2 (Recommended for PRO)**: For "Truly Unlimited" (TB range), we can configure Supabase to use an external S3-compliant backend like **Cloudflare R2**. R2 has **Zero Egress Fees**, meaning you can stream 100GB movies to millions of users without being charged for the bandwidth.

---

### 🛠️ **Supabase Dashboard Configuration (Action Required)**

To unlock the "High GB" capacity, you must adjust the project setting in your Supabase Dashboard:

1.  Go to **Storage** -> **Settings**.
2.  Find **Global Configuration**.
3.  Set **Maximum File Size** to your desired limit (e.g., `5242880000` for 5GB).
4.  Ensure **Resumable Uploads** is enabled.

---

### ✅ **Implementation Checklist**

- [x] **`uploadLargeFile`**: Integrated with `duplex: 'half'` for stream-based high-speed processing.
- [x] **`uploadIndieMovie`**: Updated to prioritize high-capacity logic for video streams.
- [x] **RLS Hardening**: Storage policies updated in `schema.sql` to handle object-level permissions.

**Film4u AI is now optimized for the "Big Screen" experience.** 📽️🌌
