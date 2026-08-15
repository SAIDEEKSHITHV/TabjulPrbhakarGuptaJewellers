export interface Collection {
  id: string;
  slug: string;
  name_en: string;
  name_te: string | null;
  description_en: string | null;
  description_te: string | null;
  cover_image_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  collection_id: string;
  name_en: string;
  name_te: string | null;
  tagline_en: string | null;
  tagline_te: string | null;
  description_en: string | null;
  description_te: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  meta_title_en: string | null;
  meta_title_te: string | null;
  meta_description_en: string | null;
  meta_description_te: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations populated on joins
  collection?: Collection;
  product_images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  cloudinary_public_id: string;
  secure_url: string;
  alt_text_en: string | null;
  alt_text_te: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}
