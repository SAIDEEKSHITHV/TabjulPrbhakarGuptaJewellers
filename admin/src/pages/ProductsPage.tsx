import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabaseClient';
import { getCloudinaryImageUrl, CLOUDINARY_PRESETS } from '../lib/cloudinary';
import AdminLayout from '../components/layout/AdminLayout';
import type { Product, Collection } from '../types/catalog';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Star, 
  Globe, 
  AlertCircle,
  Gem,
  Copy,
  Loader2
} from 'lucide-react';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedPublished, setSelectedPublished] = useState('all');
  const [selectedFeatured, setSelectedFeatured] = useState('all');

  // Deletion confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch collections for selector
      const { data: colsData, error: colsErr } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (colsErr) throw colsErr;
      setCollections(colsData || []);

      // 2. Fetch products joined with collections and images
      const { data: prodsData, error: prodsErr } = await supabase
        .from('products')
        .select('*, collection:collections(*), product_images(*)');

      if (prodsErr) throw prodsErr;

      // Sort products by collection order then product sort order
      const sortedProds = (prodsData || []).sort((a, b) => {
        const aColOrder = a.collection?.sort_order ?? 0;
        const bColOrder = b.collection?.sort_order ?? 0;
        if (aColOrder !== bColOrder) {
          return aColOrder - bColOrder;
        }
        return a.sort_order - b.sort_order;
      });

      setProducts(sortedProds);
    } catch (err) {
      console.error('Error fetching catalog data:', err);
      setError(err instanceof Error ? err.message : 'Failed to retrieve products.');
    } finally {
      setLoading(false);
    }
  }

  // Delete Action
  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    setSuccessMsg(null);
    let dbDeleted = false;
    try {
      // Get Cloudinary public IDs to delete before deleting the database row
      const publicIds = deleteTarget.product_images
        ?.map(img => img.cloudinary_public_id)
        .filter(Boolean) || [];

      // Delete the product row (RLS policy uses auth.role() = 'authenticated')
      // Foreign key constraint product_images_product_id_fkey has ON DELETE CASCADE
      // which automatically drops product_images database rows
      const { error: deleteErr } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteTarget.id);

      if (deleteErr) throw deleteErr;
      dbDeleted = true;

      // Call secure edge function to delete the assets from Cloudinary
      if (publicIds.length > 0) {
        const { data: sessionData } = await supabase.auth.getSession();
        const jwt = sessionData.session?.access_token;
        if (!jwt) {
          throw new Error('Authentication session lost. Unable to clean up Cloudinary assets.');
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-cloudinary-assets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify({ public_ids: publicIds })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || `Server returned HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log('Secure asset deletion completed:', result);
      }

      // Show success
      setSuccessMsg(`Successfully deleted "${deleteTarget.name_en}" and cleaned up its images from Cloudinary.`);
      setDeleteTarget(null);
      await fetchData();
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err) {
      console.error('Error deleting product or cleaning up assets:', err);
      if (dbDeleted) {
        setError(`Product "${deleteTarget.name_en}" was deleted from the catalog, but Cloudinary image cleanup failed: ${err instanceof Error ? err.message : String(err)}. Please manually remove the associated images from Cloudinary.`);
        setDeleteTarget(null);
        await fetchData();
      } else {
        setError(err instanceof Error ? err.message : 'Failed to delete product. Check database policies.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Duplication Action
  const handleDuplicateProduct = async (prod: Product) => {
    setIsDuplicating(prod.id);
    setError(null);
    try {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      const newSlug = `${prod.slug}-copy-${suffix}`;
      
      const duplicatePayload = {
        collection_id: prod.collection_id,
        name_en: `${prod.name_en} (Copy)`,
        name_te: prod.name_te ? `${prod.name_te} (Copy)` : null,
        slug: newSlug,
        tagline_en: prod.tagline_en,
        tagline_te: prod.tagline_te,
        description_en: prod.description_en,
        description_te: prod.description_te,
        is_featured: prod.is_featured,
        is_published: false, // Default to draft to protect publishing
        sort_order: prod.sort_order + 1,
        weight: prod.weight,
        meta_title_en: prod.meta_title_en,
        meta_title_te: prod.meta_title_te,
        meta_description_en: prod.meta_description_en,
        meta_description_te: prod.meta_description_te,
      };


      const { data: newProd, error: insertErr } = await supabase
        .from('products')
        .insert([duplicatePayload])
        .select()
        .single();

      if (insertErr) throw insertErr;
      if (!newProd) throw new Error('Duplicated product row could not be created.');

      // Copy related images references if any
      const { data: originalImgs, error: fetchImgsErr } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', prod.id);

      if (fetchImgsErr) throw fetchImgsErr;

      if (originalImgs && originalImgs.length > 0) {
        const duplicateImages = originalImgs.map(img => ({
          product_id: newProd.id,
          cloudinary_public_id: img.cloudinary_public_id,
          secure_url: img.secure_url,
          is_primary: img.is_primary,
          sort_order: img.sort_order,
          alt_text_en: img.alt_text_en,
          alt_text_te: img.alt_text_te,
        }));

        const { error: insertImgsErr } = await supabase
          .from('product_images')
          .insert(duplicateImages);

        if (insertImgsErr) throw insertImgsErr;
      }

      setSuccessMsg(`Duplicated "${prod.name_en}". Redirecting to editor...`);
      setTimeout(() => {
        navigate(`/products/${newProd.id}/edit`);
      }, 1000);

    } catch (err) {
      console.error('Duplication error:', err);
      setError(err instanceof Error ? err.message : 'Duplication execution failed.');
    } finally {
      setIsDuplicating(null);
    }
  };

  // Filtering Logic
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = 
      prod.name_en.toLowerCase().includes(search.toLowerCase()) ||
      (prod.name_te && prod.name_te.toLowerCase().includes(search.toLowerCase()));

    const matchesCollection = 
      selectedCollection === 'all' || prod.collection_id === selectedCollection;

    const matchesPublished = 
      selectedPublished === 'all' || 
      (selectedPublished === 'published' && prod.is_published) ||
      (selectedPublished === 'unpublished' && !prod.is_published);

    const matchesFeatured = 
      selectedFeatured === 'all' || 
      (selectedFeatured === 'featured' && prod.is_featured) ||
      (selectedFeatured === 'standard' && !prod.is_featured);

    return matchesSearch && matchesCollection && matchesPublished && matchesFeatured;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-[#F5EFE7] text-2xl md:text-3xl font-medium tracking-wide">
              Jewellery Catalogue
            </h1>
            <p className="text-xs md:text-sm text-[#B8B0A8] mt-1 font-light leading-relaxed">
              View and filter your store products catalog.
            </p>
          </div>
          <button
            onClick={() => navigate('/products/new')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C9A24A] hover:bg-[#b08b3c] text-black text-xs font-mono uppercase font-bold tracking-widest rounded transition-colors duration-300 self-start sm:self-center"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>

        {/* Success/Error Alerts */}
        {successMsg && (
          <div className="bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 p-4 text-xs font-light rounded leading-relaxed">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="bg-red-950/30 border border-red-800/40 text-red-400 p-4 text-xs font-light rounded leading-relaxed flex items-start gap-2.5">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters Controls Grid */}
        <div className="bg-[#131315]/40 border border-[rgba(201,162,74,0.15)] p-4 rounded flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative w-full md:flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] placeholder-zinc-600 text-xs rounded transition-all duration-300 focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A]"
            />
          </div>

          {/* Selectors */}
          <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto">
            {/* Collection Filter */}
            <div className="flex items-center gap-2 bg-black/40 border border-[rgba(201,162,74,0.15)] rounded px-3.5 py-1">
              <Filter size={12} className="text-[#C9A24A]" />
              <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="bg-transparent border-0 text-[#F5EFE7] text-xs focus:ring-0 cursor-pointer pr-8 font-light"
              >
                <option value="all" className="bg-[#131315]">All Collections</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id} className="bg-[#131315]">
                    {col.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Published Filter */}
            <div className="flex items-center gap-2 bg-black/40 border border-[rgba(201,162,74,0.15)] rounded px-3.5 py-1">
              <Globe size={12} className="text-[#C9A24A]" />
              <select
                value={selectedPublished}
                onChange={(e) => setSelectedPublished(e.target.value)}
                className="bg-transparent border-0 text-[#F5EFE7] text-xs focus:ring-0 cursor-pointer pr-8 font-light"
              >
                <option value="all" className="bg-[#131315]">All Visibility</option>
                <option value="published" className="bg-[#131315]">Published</option>
                <option value="unpublished" className="bg-[#131315]">Unpublished</option>
              </select>
            </div>

            {/* Featured Filter */}
            <div className="flex items-center gap-2 bg-black/40 border border-[rgba(201,162,74,0.15)] rounded px-3.5 py-1">
              <Star size={12} className="text-[#C9A24A]" />
              <select
                value={selectedFeatured}
                onChange={(e) => setSelectedFeatured(e.target.value)}
                className="bg-transparent border-0 text-[#F5EFE7] text-xs focus:ring-0 cursor-pointer pr-8 font-light"
              >
                <option value="all" className="bg-[#131315]">All Showcase</option>
                <option value="featured" className="bg-[#131315]">Featured Only</option>
                <option value="standard" className="bg-[#131315]">Standard Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Panel */}
        {loading ? (
          /* Skeletons Loader */
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-white/5 border border-borderWine rounded" />
            <div className="h-16 bg-white/5 border border-borderWine rounded" />
            <div className="h-16 bg-white/5 border border-borderWine rounded" />
            <div className="h-16 bg-white/5 border border-borderWine rounded" />
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="border border-[rgba(201,162,74,0.15)] bg-[#131315]/20 p-12 text-center rounded flex flex-col items-center">
            <Gem className="text-[#C9A24A]/40 mb-3" size={40} strokeWidth={1} />
            <h3 className="text-sm font-medium text-[#F5EFE7]">No Products Found</h3>
            <p className="text-xs text-[#B8B0A8] mt-1.5 font-light max-w-sm">
              {search || selectedCollection !== 'all' || selectedPublished !== 'all' || selectedFeatured !== 'all'
                ? 'Try modifying your search queries or filter selectors.'
                : 'Get started by creating your first jewelry product catalogue row.'}
            </p>
            {(!search && selectedCollection === 'all' && selectedPublished === 'all' && selectedFeatured === 'all') && (
              <button
                onClick={() => navigate('/products/new')}
                className="mt-5 px-4 py-2 bg-[#C9A24A] hover:bg-[#b08b3c] text-black font-mono font-bold text-xs uppercase tracking-widest rounded transition-colors duration-300"
              >
                Add Product
              </button>
            )}
          </div>
        ) : (
          /* Products Table Grid */
          <div className="border border-[rgba(201,162,74,0.15)] bg-[#131315]/20 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[rgba(201,162,74,0.15)] bg-[#131315]/40 text-[#B8B0A8]/80 uppercase tracking-widest font-mono text-[10px]">
                    <th className="py-4 px-6 font-medium">Image</th>
                    <th className="py-4 px-6 font-medium">Product Name</th>
                    <th className="py-4 px-6 font-medium">Collection</th>
                    <th className="py-4 px-6 font-medium text-center">Featured</th>
                    <th className="py-4 px-6 font-medium text-center">Status</th>
                    <th className="py-4 px-6 font-medium text-center">Sort Order</th>
                    <th className="py-4 px-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(201,162,74,0.08)]">
                  {filteredProducts.map((prod) => {
                    // Extract primary image or fallback to first sorting image
                    const primaryImg = 
                      prod.product_images?.find((img) => img.is_primary) ||
                      (prod.product_images && prod.product_images.length > 0
                        ? prod.product_images.sort((a, b) => a.sort_order - b.sort_order)[0]
                        : null);

                    const thumbnailUrl = primaryImg
                      ? getCloudinaryImageUrl(primaryImg.cloudinary_public_id, CLOUDINARY_PRESETS.thumbnail)
                      : '';

                    return (
                      <tr 
                        key={prod.id} 
                        className="hover:bg-white/[0.01] transition-colors duration-150 text-[#F5EFE7]/90"
                      >
                        {/* Image */}
                        <td className="py-4 px-6">
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt={prod.name_en}
                              className="w-11 h-11 object-cover rounded border border-[rgba(201,162,74,0.15)]"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded border border-[rgba(201,162,74,0.1)] bg-[#0B0B0C] flex items-center justify-center text-zinc-700">
                              <Gem size={16} />
                            </div>
                          )}
                        </td>

                        {/* Product Name */}
                        <td className="py-4 px-6">
                          <span className="block font-medium text-sm text-[#F5EFE7]">
                            {prod.name_en}
                          </span>
                          {prod.name_te && (
                            <span className="block text-[10px] text-[#B8B0A8]/80 mt-0.5 font-light">
                              {prod.name_te}
                            </span>
                          )}
                          <span className="text-[10px] text-[#B8B0A8]/50 block font-mono mt-0.5">
                            {prod.slug}
                          </span>
                        </td>

                        {/* Collection */}
                        <td className="py-4 px-6 text-[#B8B0A8]">
                          {prod.collection?.name_en || '—'}
                        </td>

                        {/* Featured */}
                        <td className="py-4 px-6 text-center">
                          {prod.is_featured ? (
                            <span className="inline-flex items-center justify-center p-1 bg-[rgba(201,162,74,0.1)] text-[#C9A24A] rounded-full border border-[rgba(201,162,74,0.2)]">
                              <Star size={12} fill="currentColor" />
                            </span>
                          ) : (
                            <span className="text-zinc-600 text-[10px]">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 text-center">
                          {prod.is_published ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-emerald-950/30 border border-emerald-800/30 text-emerald-400 font-light">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-400 font-light">
                              Draft
                            </span>
                          )}
                        </td>

                        {/* Sort Order */}
                        <td className="py-4 px-6 text-center font-mono text-[#B8B0A8]">
                          {prod.sort_order}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleDuplicateProduct(prod)}
                              disabled={isDuplicating !== null}
                              className="p-2 text-[#B8B0A8] hover:text-[#C9A24A] hover:bg-white/[0.02] border border-transparent hover:border-[rgba(201,162,74,0.15)] rounded transition-all duration-200 disabled:opacity-50"
                              title="Duplicate product"
                            >
                              {isDuplicating === prod.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                            <button
                              onClick={() => navigate(`/products/${prod.id}/edit`)}
                              disabled={isDuplicating !== null}
                              className="p-2 text-[#B8B0A8] hover:text-[#C9A24A] hover:bg-white/[0.02] border border-transparent hover:border-[rgba(201,162,74,0.15)] rounded transition-all duration-200 disabled:opacity-50"
                              title="Edit product"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(prod)}
                              disabled={isDuplicating !== null}
                              className="p-2 text-[#B8B0A8] hover:text-red-400 hover:bg-red-950/10 border border-transparent hover:border-red-900/30 rounded transition-all duration-200 disabled:opacity-50"
                              title="Delete product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal Overlay */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setDeleteTarget(null)}
            />
            <div className="relative w-full max-w-md bg-[#131315] border border-red-900/30 p-6 rounded shadow-[0_10px_50px_rgba(0,0,0,0.8)] z-10 space-y-6">
              <div className="space-y-2">
                <h3 className="font-serif text-[#F5EFE7] text-lg font-medium tracking-wide">
                  Confirm Deletion
                </h3>
                <p className="text-xs text-[#B8B0A8] leading-relaxed font-light">
                  Are you sure you want to delete **"{deleteTarget.name_en}"**? 
                </p>
                <div className="bg-red-950/20 border border-red-900/35 text-red-400 p-3 text-[11px] font-light leading-relaxed rounded mt-3">
                  <strong>Warning:</strong> This will permanently delete the product row and all associated image references in the database.
                  <br />
                  Note: Associated Cloudinary images will be automatically scheduled for secure background cleanup.
                </div>
              </div>

              {deleteTarget.product_images && deleteTarget.product_images.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-[#B8B0A8]/80 font-mono block">Cloudinary Public IDs to clean up:</span>
                  <div className="max-h-24 overflow-y-auto bg-black/35 border border-white/[0.03] p-2 rounded text-[10px] font-mono text-zinc-500 select-all space-y-1">
                    {deleteTarget.product_images.map(img => (
                      <div key={img.id}>{img.cloudinary_public_id}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-white/[0.08] hover:bg-white/[0.02] text-[#B8B0A8] text-xs font-mono uppercase font-bold rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-mono uppercase font-bold rounded transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    'Delete Product'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
