# Cloudinary Image Pipeline Setup Guide

This guide details the setup and configuration of the **Cloudinary** media delivery pipeline for the dynamic catalog of **Tabjul Prabhakar Gupta Jewelers**.

---

## 1. Cloudinary Account Setup
1. Create a free account at [Cloudinary.com](https://cloudinary.com).
2. Note your **Cloud Name** displayed in the dashboard console (e.g. `qr9wonb2`).

---

## 2. Upload Preset Configuration
Because uploads occur directly from the browser (bypassing server proxies for high-res performance), we use **Unsigned Uploads** with strict presets.

### Configuration Steps:
1. Navigate to **Settings** (gear icon) -> **Upload** in your Cloudinary console.
2. Scroll to the **Upload presets** section and click **Add upload preset**.
3. Configure the fields as follows:
   * **Upload preset name:** Set a clean name (e.g., `tpg_jewellers_products`).
   * **Signing Mode:** Select **Unsigned** (required for client-side uploads).
   * **Folder:** Set a base prefix (e.g., `tpg-jewellers/products/`).
   * **Allowed formats:** Specify `jpg,png,webp` (under *Validation*).
   * **Return delete token:** **Enabled / Yes** (Required to allow immediate client-side cleanup of temporary test images).
4. Save the preset.

---

## 3. Folder Structure
The catalog enforces a controlled folder layout:
```
tpg-jewellers/products/{product-uuid-or-slug}/
```
- **Constraint:** The client-side utility `uploadImageToCloudinary` validates that all uploads are targeted inside `tpg-jewellers/products/` and rejects arbitrary paths.
- **Organization:** Organize assets inside a folder corresponding to the unique Product ID or slug.

---

## 4. Environment Variables
Configure the public credentials inside your local `app/.env` file:
```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset-name
```
> [!CAUTION]
> **Do NOT expose `CLOUDINARY_API_SECRET` in the client.**
> Exposing the API secret allows anyone to gain administrative write/delete access to your entire media library. Unsigned presets are secure as they are restricted to uploads and basic transformations.

---

## 5. Image Transformation Strategy
Rather than delivering original camera photos (which can exceed 20-30 MB), the storefront requests optimized images by injecting transformations into the URL:
- **Automatic Format (`f_auto`):** Deliver modern formats like WebP or AVIF based on browser capabilities.
- **Automatic Quality (`q_auto`):** Compresses files to the optimal visual quality ratio, dropping size by up to 90% without visible degradation.

### Predefined Presets in `cloudinary.ts`:
- **`thumbnail`** (`150x150`, crop `fill`): Used for administrative tables and search icons.
- **`card`** (`600x450`, crop `fill`): Used in collection product grids.
- **`gallery`** (`w_1200` width scale): High-detail popups.
- **`hero`** (`w_1920` width scale): Pinned backgrounds.

---

## 6. Database Storage Layout
When an asset is uploaded, the frontend receives a response and saves metadata inside the Supabase `product_images` table:
* `cloudinary_public_id`: Unique identifier (e.g. `tpg-jewellers/products/123/gold_necklace`). Required for generating dynamic transformation URLs.
* `secure_url`: Direct secure delivery link.
* `sort_order`: Display priority in image galleries.
* `is_primary`: Flag denoting the main collection card image.

---

## 7. How Deletion Works
Since the client-side code does not have access to the API Secret, it cannot delete older assets from the storefront.
- **Immediate Test Deletion:** The upload response returns a `delete_token` valid for 10 minutes. The client can delete this newly uploaded file immediately by sending a POST request to:
  `https://api.cloudinary.com/v1_1/<cloud_name>/delete_by_token` with `token=<delete_token>`.
- **Permanent Admin Deletion:** The future Admin Panel backend (running server-side Edge Functions or server-side API routers) will authenticate using the `CLOUDINARY_API_SECRET` and invoke Cloudinary's Admin SDK to destroy deleted files.
