import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { supabase } from '../lib/supabaseClient';
import { uploadImageToCloudinary, getCloudinaryImageUrl, CLOUDINARY_PRESETS } from '../lib/cloudinary';
import AdminLayout from '../components/layout/AdminLayout';
import type { Collection, ProductImage } from '../types/catalog';
import { 
  ArrowLeft, 
  UploadCloud, 
  Trash2, 
  Star, 
  ArrowUp, 
  ArrowDown, 
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

interface LocalImage {
  id: string; // db id if existing, temporary local id if new
  cloudinary_public_id: string;
  secure_url: string;
  is_primary: boolean;
  sort_order: number;
  alt_text_en: string;
  alt_text_te: string;
  isNew: boolean;
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Database Selectors
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form Fields
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [taglineEn, setTaglineEn] = useState('');
  const [taglineTe, setTaglineTe] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descTe, setDescTe] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [weight, setWeight] = useState('');

  // SEO Fields
  const [metaTitleEn, setMetaTitleEn] = useState('');
  const [metaTitleTe, setMetaTitleTe] = useState('');
  const [metaDescEn, setMetaDescEn] = useState('');
  const [metaDescTe, setMetaDescTe] = useState('');

  // Upload/Images state
  const [images, setImages] = useState<LocalImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Image deletion modal target
  const [imageToDelete, setImageToDelete] = useState<LocalImage | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  // Status/Error state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = async () => {
    try {
      // 1. Fetch collections
      const { data: cols, error: colsErr } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (colsErr) throw colsErr;
      setCollections(cols || []);

      // 2. Fetch product by ID joined with images
      const { data: prod, error: prodErr } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('id', id)
        .single();

      if (prodErr) throw prodErr;

      // Populate states
      setNameEn(prod.name_en);
      setSlug(prod.slug);
      setSelectedCollection(prod.collection_id);
      setTaglineEn(prod.tagline_en || '');
      setTaglineTe(prod.tagline_te || '');
      setDescEn(prod.description_en || '');
      setDescTe(prod.description_te || '');
      setSortOrder(prod.sort_order.toString());
      setIsFeatured(prod.is_featured);
      setIsPublished(prod.is_published);
      setWeight(prod.weight !== null && prod.weight !== undefined ? prod.weight.toString() : '');

      
      setMetaTitleEn(prod.meta_title_en || '');
      setMetaTitleTe(prod.meta_title_te || '');
      setMetaDescEn(prod.meta_description_en || '');
      setMetaDescTe(prod.meta_description_te || '');

      // Populate images
      const formattedImgs = (prod.product_images || [])
        .sort((a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order)
        .map((img: ProductImage) => ({
          id: img.id,
          cloudinary_public_id: img.cloudinary_public_id,
          secure_url: img.secure_url,
          is_primary: img.is_primary,
          sort_order: img.sort_order,
          alt_text_en: img.alt_text_en || '',
          alt_text_te: img.alt_text_te || '',
          isNew: false
        }));
      setImages(formattedImgs);

    } catch (err) {
      console.error('Error loading product details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product catalog record.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Cloudinary Direct Unsigned Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processUploads(Array.from(files));
  };

  const processUploads = async (fileList: File[]) => {
    setIsUploading(true);
    setError(null);
    try {
      const folderPath = `tpg-jewellers/products/${id}`;
      
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgress(`Uploading file ${i + 1} of ${fileList.length} (${file.name})...`);

        const res = await uploadImageToCloudinary(file, folderPath);

        const newImage: LocalImage = {
          id: Math.random().toString(36).substr(2, 9), // temp id
          cloudinary_public_id: res.public_id,
          secure_url: res.secure_url,
          is_primary: false,
          sort_order: images.length + i,
          alt_text_en: '',
          alt_text_te: '',
          isNew: true
        };

        setImages(prev => [...prev, newImage]);
      }
      setUploadProgress('');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Drag and Drop triggers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading || isSaving) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processUploads(Array.from(files));
    }
  };

  // Image helpers
  const handleRemoveImageRequest = (img: LocalImage) => {
    if (img.isNew) {
      // If it hasn't reached the database yet, we can drop it immediately
      setImages(prev => prev.filter(item => item.id !== img.id));
    } else {
      // Trigger confirmation dialog for database image row deletion
      setImageToDelete(img);
    }
  };

  const handleConfirmImageDelete = async () => {
    if (!imageToDelete) return;
    setIsDeletingImage(true);
    setError(null);
    let dbDeleted = false;
    try {
      const publicId = imageToDelete.cloudinary_public_id;

      // Delete database row
      const { error: dbErr } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageToDelete.id);

      if (dbErr) throw dbErr;
      dbDeleted = true;

      // Call secure edge function to delete the asset from Cloudinary
      if (publicId) {
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
          body: JSON.stringify({ public_ids: [publicId] })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || `Server returned HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log('Secure asset deletion completed:', result);
      }

      // Update local state
      setImages(prev => prev.filter(img => img.id !== imageToDelete.id));
      setImageToDelete(null);
    } catch (err) {
      console.error('Error deleting image or cleaning up asset:', err);
      if (dbDeleted) {
        setError(`Image metadata was removed from the database, but Cloudinary asset cleanup failed: ${err instanceof Error ? err.message : String(err)}. Please manually remove the image from Cloudinary.`);
        // Still remove from state so UI stays in sync with DB
        setImages(prev => prev.filter(img => img.id !== imageToDelete.id));
        setImageToDelete(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to remove image from database.');
      }
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleSetPrimary = (id: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      is_primary: img.id === id
    })));
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...images];
    
    // Swap
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    // Recalculate sort_order
    const reordered = updated.map((img, i) => ({
      ...img,
      sort_order: i
    }));

    setImages(reordered);
  };

  const handleAltTextChange = (id: string, lang: 'en' | 'te', text: string) => {
    setImages(prev => prev.map(img => {
      if (img.id !== id) return img;
      return lang === 'en' 
        ? { ...img, alt_text_en: text }
        : { ...img, alt_text_te: text };
    }));
  };

  // Submit Save Flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation checks
    if (!nameEn.trim()) {
      setError('English product name is required.');
      return;
    }
    if (!slug.trim()) {
      setError('Product slug is required.');
      return;
    }
    if (!selectedCollection) {
      setError('Collection folder selection is required.');
      return;
    }

    let weightNum: number | null = null;
    if (weight) {
      weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        setError('Weight must be a valid number greater than 0.');
        return;
      }
    }

    const orderNum = parseInt(sortOrder, 10);
    if (isNaN(orderNum)) {
      setError('Sort order must be a valid numeric integer.');
      return;
    }

    setIsSaving(true);

    try {
      // 1. Update product row
      const productPayload = {
        collection_id: selectedCollection,
        slug: slug.trim(),
        name_en: nameEn.trim(),
        name_te: nameEn.trim(),
        tagline_en: taglineEn.trim() || null,
        tagline_te: taglineTe.trim() || null,
        description_en: descEn.trim() || null,
        description_te: descTe.trim() || null,
        is_featured: isFeatured,
        is_published: isPublished,
        sort_order: orderNum,
        weight: weightNum,
        meta_title_en: metaTitleEn.trim() || null,
        meta_title_te: metaTitleTe.trim() || null,
        meta_description_en: metaDescEn.trim() || null,
        meta_description_te: metaDescTe.trim() || null,
      };

      const { error: prodErr } = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', id);

      if (prodErr) {
        if (prodErr.code === '23505') {
          throw new Error(`The slug "${slug}" is already taken by another product.`);
        }
        throw prodErr;
      }


      // 2. Synchronize images:
      // Loop over the list of images, upserting them.
      if (images.length > 0) {
        const hasPrimarySelected = images.some(img => img.is_primary);
        
        const finalImagesPayload = images.map((img, idx) => {
          const base: {
            product_id: string;
            cloudinary_public_id: string;
            secure_url: string;
            alt_text_en: string | null;
            alt_text_te: string | null;
            sort_order: number;
            is_primary: boolean;
            id?: string;
          } = {
            product_id: id || '',
            cloudinary_public_id: img.cloudinary_public_id,
            secure_url: img.secure_url,
            alt_text_en: img.alt_text_en.trim() || null,
            alt_text_te: img.alt_text_te.trim() || null,
            sort_order: idx,
            is_primary: hasPrimarySelected ? img.is_primary : idx === 0
          };

          // If it is not a newly uploaded image, retain its database ID for upsert
          if (!img.isNew) {
            base.id = img.id;
          }

          return base;
        });

        const { error: imgErr } = await supabase
          .from('product_images')
          .upsert(finalImagesPayload);

        if (imgErr) {
          throw imgErr;
        }
      }

      // Redirect on success
      navigate('/products');
    } catch (err) {
      console.error('Error saving product catalogue update:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during catalogue update.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingData) {
    return (
      <AdminLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-4 bg-white/5 rounded w-1/4" />
          <div className="h-8 bg-white/5 rounded w-1/3" />
          <div className="h-[300px] bg-white/5 rounded border border-borderWine" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-xs text-[#B8B0A8] hover:text-[#C9A24A] font-mono uppercase tracking-widest transition-colors duration-200"
        >
          <ArrowLeft size={14} />
          <span>Back to products</span>
        </button>

        {/* Header */}
        <div>
          <h1 className="font-serif text-[#F5EFE7] text-2xl md:text-3xl font-medium tracking-wide">
            Edit Catalog Item
          </h1>
          <p className="text-xs md:text-sm text-[#B8B0A8] mt-1 font-light leading-relaxed">
            Update your jewellery specifications and images.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-950/30 border border-red-800/40 text-red-400 p-4 text-xs font-light rounded leading-relaxed flex items-start gap-2.5 max-w-4xl">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
          {/* PRIMARY WORKFLOW CARD */}
          <div className="bg-[#131315]/40 border border-[rgba(201,162,74,0.15)] p-6 rounded space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-[#C9A24A] font-mono font-medium border-b border-[rgba(201,162,74,0.15)] pb-3">
              Primary Specifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Collection Dropdown */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                  Collection Folder *
                </label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs rounded transition-all focus:border-[#C9A24A] cursor-pointer"
                >
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weight (grams) */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                  Weight (grams)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 24.50 (optional if NULL)"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs rounded transition-all focus:border-[#C9A24A]"
                />
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bridal Choker"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs rounded transition-all focus:border-[#C9A24A]"
                />
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <input
                id="published-toggle"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded bg-black/40 border-[rgba(201,162,74,0.3)] text-[#C9A24A] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="published-toggle" className="text-xs text-[#F5EFE7] font-light cursor-pointer select-none">
                Publish Catalogue Item (Visible to public storefront)
              </label>
            </div>
          </div>

          {/* Section 2: Image Pipeline & Previews */}
          <div className="bg-[#131315]/40 border border-[rgba(201,162,74,0.15)] p-6 rounded space-y-6">
            <h2 className="text-xs uppercase tracking-widest text-[#C9A24A] font-mono font-medium border-b border-[rgba(201,162,74,0.15)] pb-3">
              Catalog Images Gallery
            </h2>

            {/* Drag & Drop Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[rgba(201,162,74,0.2)] hover:border-[#C9A24A] bg-black/25 hover:bg-[rgba(201,162,74,0.02)] p-8 rounded text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-3"
            >
              <UploadCloud className="text-[#C9A24A]/60" size={32} strokeWidth={1.5} />
              <div>
                <span className="block text-xs font-medium text-[#F5EFE7]">
                  Drag and drop jewelry photos here, or click to browse
                </span>
                <span className="text-[10px] text-[#B8B0A8]/60 mt-1 block">
                  Supports JPEG, PNG, WebP files up to 50 MB
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </div>

            {/* Upload Progress Loader */}
            {isUploading && (
              <div className="flex items-center gap-3 bg-[rgba(201,162,74,0.05)] border border-[rgba(201,162,74,0.15)] p-4 rounded text-xs font-light text-[#C9A24A]">
                <span className="w-4 h-4 border-2 border-[#C9A24A] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span>{uploadProgress}</span>
              </div>
            )}

            {/* Image Preview Grid */}
            {images.length > 0 ? (
              <div className="space-y-6">
                {/* Primary Cover Showcase */}
                {(() => {
                  const primaryImg = images.find(img => img.is_primary) || images[0];
                  const previewUrl = getCloudinaryImageUrl(primaryImg.cloudinary_public_id, CLOUDINARY_PRESETS.card);
                  return (
                    <div className="border border-[rgba(201,162,74,0.3)] bg-black/40 rounded p-4 flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                      <span className="text-[10px] text-[#C9A24A] uppercase tracking-widest font-mono font-medium flex items-center gap-1.5">
                        <Star size={12} fill="currentColor" /> Primary Cover Image
                      </span>
                      <div className="relative aspect-[4/3] w-full bg-black rounded border border-white/5 overflow-hidden">
                        <img
                          src={previewUrl}
                          alt="Primary Cover"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] text-[#B8B0A8]/60 font-light text-center">
                        This image will be displayed on all category catalogs and primary listing layouts.
                      </span>
                    </div>
                  );
                })()}

                {/* Gallery Deck grid */}
                <div className="space-y-3">
                  <span className="text-[10px] text-[#B8B0A8]/80 font-mono block">
                    Gallery Deck Sequence ({images.length} slides)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {images.map((img, idx) => {
                      const previewUrl = getCloudinaryImageUrl(img.cloudinary_public_id, CLOUDINARY_PRESETS.thumbnail);
                      return (
                        <div 
                          key={img.id}
                          className="bg-[#0B0B0C]/40 border border-[rgba(201,162,74,0.15)] p-3 rounded flex gap-4"
                        >
                          {/* Thumbnail */}
                          <div className="relative w-20 h-20 flex-shrink-0 bg-black rounded border border-white/5 overflow-hidden">
                            <img
                              src={previewUrl}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                            {img.is_primary && (
                              <span className="absolute top-1 left-1 bg-[#C9A24A] text-black p-0.5 rounded-full" title="Primary Cover">
                                <Star size={10} fill="currentColor" />
                              </span>
                            )}
                          </div>

                          {/* Metadata & Controls */}
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono text-[#F5EFE7]/80 block">
                                  Image #{idx + 1} {img.is_primary && <span className="text-[#C9A24A]">(Cover)</span>}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImageRequest(img)}
                                  className="text-zinc-500 hover:text-red-400 p-0.5"
                                  title="Remove photo"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>

                              {/* Alt inputs */}
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <input
                                  type="text"
                                  placeholder="Alt English"
                                  value={img.alt_text_en}
                                  onChange={(e) => handleAltTextChange(img.id, 'en', e.target.value)}
                                  className="px-2 py-1 bg-black/40 border border-white/5 text-[10px] text-[#F5EFE7] rounded focus:border-[#C9A24A]"
                                />
                                <input
                                  type="text"
                                  placeholder="Alt తెలుగు"
                                  value={img.alt_text_te}
                                  onChange={(e) => handleAltTextChange(img.id, 'te', e.target.value)}
                                  className="px-2 py-1 bg-black/40 border border-white/5 text-[10px] text-[#F5EFE7] rounded focus:border-[#C9A24A]"
                                />
                              </div>
                            </div>

                            {/* Order actions & primary buttons */}
                            <div className="flex justify-between items-center mt-2 border-t border-white/[0.04] pt-2">
                              <button
                                type="button"
                                onClick={() => handleSetPrimary(img.id)}
                                className={`text-[9px] font-mono uppercase tracking-wider ${
                                  img.is_primary 
                                    ? 'text-[#C9A24A] font-bold' 
                                    : 'text-zinc-500 hover:text-[#C9A24A]'
                                }`}
                              >
                                {img.is_primary ? 'Cover Image' : 'Set Cover'}
                              </button>

                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 bg-black/40 border border-white/5 rounded text-zinc-500 hover:text-[#C9A24A] disabled:opacity-30 disabled:hover:text-zinc-500"
                                >
                                  <ArrowUp size={10} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, 'down')}
                                  disabled={idx === images.length - 1}
                                  className="p-1 bg-black/40 border border-white/5 rounded text-zinc-500 hover:text-[#C9A24A] disabled:opacity-30 disabled:hover:text-zinc-500"
                                >
                                  <ArrowDown size={10} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-white/[0.05] rounded text-zinc-500 text-xs font-light">
                No catalog images. Please upload images.
              </div>
            )}
          </div>

          {/* COLLAPSED ADVANCED SETTINGS SECTION */}
          <details className="border border-[rgba(201,162,74,0.15)] rounded bg-[#131315]/20 p-6 space-y-6">
            <summary className="cursor-pointer text-xs uppercase tracking-widest text-[#C9A24A] font-mono font-medium select-none outline-none">
              Advanced Settings (Optional)
            </summary>

            <div className="space-y-6 pt-6 border-t border-[rgba(201,162,74,0.1)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Slug */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                    Product Slug (URL unique key)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. traditional-gold-choker"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] font-mono text-xs rounded transition-all focus:border-[#C9A24A]"
                  />
                </div>

                {/* English Tagline */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                    Tagline / Subtitle (English)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Timeless elegance handcrafted in 22kt gold"
                    value={taglineEn}
                    onChange={(e) => setTaglineEn(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs rounded transition-all focus:border-[#C9A24A]"
                  />
                </div>

                {/* Telugu Tagline */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                    Tagline / Subtitle (Telugu)
                  </label>
                  <input
                    type="text"
                    placeholder="ఉదాహరణ: 22 క్యారెట్ల బంగారు హస్తకళ"
                    value={taglineTe}
                    onChange={(e) => setTaglineTe(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs rounded transition-all focus:border-[#C9A24A]"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                    Description (English)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter English description of the product design details, gold weight..."
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs rounded transition-all focus:border-[#C9A24A] resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                    Description (Telugu)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="వివరాలను తెలుగులో వ్రాయండి..."
                    value={descTe}
                    onChange={(e) => setDescTe(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs rounded transition-all focus:border-[#C9A24A] resize-y"
                  />
                </div>
              </div>

              {/* Showcase Configurations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                    Sort Order Number
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs font-mono rounded transition-all focus:border-[#C9A24A]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    id="featured-toggle"
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded bg-black/40 border-[rgba(201,162,74,0.3)] text-[#C9A24A] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="featured-toggle" className="text-xs text-[#F5EFE7] font-light cursor-pointer select-none">
                    Showcase on Homepage (Featured)
                  </label>
                </div>
              </div>

              {/* SEO metadata */}
              <div className="border-t border-white/[0.04] pt-6 space-y-6">
                <h3 className="text-xs uppercase tracking-widest text-[#B8B0A8] font-mono font-medium">
                  Search Engine Optimization (SEO)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Meta title English */}
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                      Meta Title (English)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Traditional Gold Choker Necklace | TPG Jewellers"
                      value={metaTitleEn}
                      onChange={(e) => setMetaTitleEn(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs rounded transition-all focus:border-[#C9A24A]"
                    />
                  </div>

                  {/* Meta title Telugu */}
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                      Meta Title (Telugu)
                    </label>
                    <input
                      type="text"
                      placeholder="ఉదాహరణ: సాంప్రదాయ బంగారు చోకర్ హారము"
                      value={metaTitleTe}
                      onChange={(e) => setMetaTitleTe(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs rounded transition-all focus:border-[#C9A24A]"
                    />
                  </div>

                  {/* Meta description English */}
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                      Meta Description (English)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="English search results snippet..."
                      value={metaDescEn}
                      onChange={(e) => setMetaDescEn(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs rounded transition-all focus:border-[#C9A24A] resize-none"
                    />
                  </div>

                  {/* Meta description Telugu */}
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                      Meta Description (Telugu)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="తెలుగు సెర్చ్ వివరణ..."
                      value={metaDescTe}
                      onChange={(e) => setMetaDescTe(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs rounded transition-all focus:border-[#C9A24A] resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </details>

          {/* Form Actions */}
          <div className="flex gap-4 items-center justify-end">
            <button
              type="button"
              disabled={isSaving || isUploading}
              onClick={() => navigate('/products')}
              className="px-6 py-2.5 border border-white/[0.08] hover:bg-white/[0.02] text-[#B8B0A8] text-xs font-mono uppercase font-bold rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-6 py-2.5 bg-[#C9A24A] text-black text-xs font-mono uppercase font-bold tracking-widest rounded hover:bg-[#b08b3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Saving Catalogue...</span>
                </>
              ) : (
                'Save Product'
              )}
            </button>
          </div>
        </form>


        {/* Database Image Row Delete Confirmation Overlay */}
        {imageToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setImageToDelete(null)}
            />
            <div className="relative w-full max-w-md bg-[#131315] border border-red-900/30 p-6 rounded shadow-[0_10px_50px_rgba(0,0,0,0.8)] z-10 space-y-6">
              <div className="space-y-2 flex items-start gap-3">
                <ShieldAlert className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-serif text-[#F5EFE7] text-lg font-medium tracking-wide">
                    Confirm Image Reference Removal
                  </h3>
                  <p className="text-xs text-[#B8B0A8] leading-relaxed font-light mt-1">
                    Are you sure you want to delete this image reference from the database?
                  </p>
                </div>
              </div>

              <div className="bg-red-950/20 border border-red-900/35 text-red-400 p-3 text-[11px] font-light leading-relaxed rounded">
                <strong>Important:</strong> Clicking confirm will instantly delete the image row from the Supabase <code>product_images</code> table.
                <br />
                The image will remain stored on Cloudinary (Public ID: <code>{imageToDelete.cloudinary_public_id}</code>). You must delete the asset manually from the Cloudinary dashboard if you want to save storage.
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setImageToDelete(null)}
                  disabled={isDeletingImage}
                  className="px-4 py-2 border border-white/[0.08] hover:bg-white/[0.02] text-[#B8B0A8] text-xs font-mono uppercase font-bold rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImageDelete}
                  disabled={isDeletingImage}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-mono uppercase font-bold rounded transition-colors flex items-center justify-center gap-2"
                >
                  {isDeletingImage ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Removing...</span>
                    </>
                  ) : (
                    'Remove Image'
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
