import { createClient } from '@supabase/supabase-js';
import type { Collection, Product, ProductImage } from '../types/catalog';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set. Supabase client will use placeholders.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

/**
 * Service helpers to query published catalog data for the storefront.
 */
export const catalogService = {
  /**
   * Fetch all published collections ordered by sort_order
   */
  async getCollections(): Promise<Collection[]> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Fetch all published products with their images
   */
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Fetch a single published product by its slug, including all images
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // record not found
      console.error(`Error fetching product by slug ${slug}:`, error);
      throw error;
    }
    return data;
  },

  /**
   * Fetch all published products in a collection by collection slug
   */
  async getProductsByCollection(collectionSlug: string): Promise<Product[]> {
    // 1. Fetch collection ID first
    const { data: collection, error: colError } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', collectionSlug)
      .eq('is_published', true)
      .single();

    if (colError || !collection) {
      return [];
    }

    // 2. Fetch products in that collection
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('collection_id', collection.id)
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error(`Error fetching products for collection ${collectionSlug}:`, error);
      throw error;
    }
    return data || [];
  },

  /**
   * Fetch published products flagged as featured (for homepage displays)
   */
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('sort_order', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
    return data || [];
  }
};
export type { Collection, Product, ProductImage };
