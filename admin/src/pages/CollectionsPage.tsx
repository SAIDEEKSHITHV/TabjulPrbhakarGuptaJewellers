import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { uploadImageToCloudinary, getCloudinaryImageUrl, CLOUDINARY_PRESETS } from '../lib/cloudinary';
import AdminLayout from '../components/layout/AdminLayout';
import type { Collection } from '../types/catalog';
import { 
  Edit, 
  UploadCloud, 
  FolderHeart, 
  AlertCircle,
  FolderOpen
} from 'lucide-react';

export default function CollectionsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit states
  const [editingCol, setEditingCol] = useState<Collection | null>(null);
  const [nameEn, setNameEn] = useState('');
  const [nameTe, setNameTe] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descTe, setDescTe] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isPublished, setIsPublished] = useState(true);
  
  // Cover image states
  const [coverUrl, setCoverUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  async function fetchCollections() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (err) throw err;
      setCollections(data || []);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch collections.');
    } finally {
      setLoading(false);
    }
  }

  // Triggered when clicking Edit on a Collection row
  const startEdit = (col: Collection) => {
    setEditingCol(col);
    setNameEn(col.name_en);
    setNameTe(col.name_te || '');
    setDescEn(col.description_en || '');
    setDescTe(col.description_te || '');
    setSortOrder(col.sort_order.toString());
    setIsPublished(col.is_published);
    setCoverUrl(col.cover_image_url || '');
    setError(null);
  };

  // Cloudinary Direct Unsigned Upload for Collection Cover
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setError(null);
    try {
      const file = files[0];
      // Upload under standard folders prefix
      const folderPath = `tpg-jewellers/products/collections`;
      const res = await uploadImageToCloudinary(file, folderPath);
      setCoverUrl(res.secure_url);
    } catch (err) {
      console.error('Cover upload error:', err);
      setError(err instanceof Error ? err.message : 'Image upload failed. Supports JPG, PNG, WebP < 50MB.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Submit collection update to Supabase
  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCol) return;
    setError(null);

    // Validation checks
    if (!nameEn.trim()) {
      setError('English collection name is required.');
      return;
    }
    const orderNum = parseInt(sortOrder, 10);
    if (isNaN(orderNum)) {
      setError('Sort order must be a valid numeric integer.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name_en: nameEn.trim(),
        name_te: nameTe.trim() || null,
        description_en: descEn.trim() || null,
        description_te: descTe.trim() || null,
        sort_order: orderNum,
        is_published: isPublished,
        cover_image_url: coverUrl.trim() || null,
      };

      const { error: dbErr } = await supabase
        .from('collections')
        .update(payload)
        .eq('id', editingCol.id);

      if (dbErr) throw dbErr;

      setSuccessMsg(`Successfully updated collection "${nameEn}".`);
      setEditingCol(null);
      await fetchCollections();

      // Clear success notification
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error saving collection:', err);
      setError(err instanceof Error ? err.message : 'Failed to update collection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-[#F5EFE7] text-2xl md:text-3xl font-medium tracking-wide">
            Collection Folders
          </h1>
          <p className="text-xs md:text-sm text-[#B8B0A8] mt-1 font-light leading-relaxed">
            Manage your high-level jewelry category directories.
          </p>
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

        {/* Content panel */}
        {loading ? (
          /* Skeletons Loader */
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-white/5 border border-borderWine rounded" />
            <div className="h-16 bg-white/5 border border-borderWine rounded" />
            <div className="h-16 bg-white/5 border border-borderWine rounded" />
          </div>
        ) : (
          /* Table Grid */
          <div className="border border-[rgba(201,162,74,0.15)] bg-[#131315]/20 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[rgba(201,162,74,0.15)] bg-[#131315]/40 text-[#B8B0A8]/80 uppercase tracking-widest font-mono text-[10px]">
                    <th className="py-4 px-6 font-medium">Cover</th>
                    <th className="py-4 px-6 font-medium">Collection Name</th>
                    <th className="py-4 px-6 font-medium">Slug</th>
                    <th className="py-4 px-6 font-medium text-center">Status</th>
                    <th className="py-4 px-6 font-medium text-center">Sort Order</th>
                    <th className="py-4 px-6 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(201,162,74,0.08)]">
                  {collections.map((col) => {
                    const previewUrl = col.cover_image_url
                      ? getCloudinaryImageUrl(col.cover_image_url, CLOUDINARY_PRESETS.thumbnail)
                      : '';
                    return (
                      <tr 
                        key={col.id} 
                        className="hover:bg-white/[0.01] transition-colors duration-150 text-[#F5EFE7]/90"
                      >
                        {/* Cover Image */}
                        <td className="py-4 px-6">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt={col.name_en}
                              className="w-11 h-11 object-cover rounded border border-[rgba(201,162,74,0.15)]"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded border border-[rgba(201,162,74,0.1)] bg-[#0B0B0C] flex items-center justify-center text-zinc-700">
                              <FolderOpen size={16} />
                            </div>
                          )}
                        </td>

                        {/* Collection Name */}
                        <td className="py-4 px-6">
                          <span className="block font-medium text-sm text-[#F5EFE7]">
                            {col.name_en}
                          </span>
                          {col.name_te && (
                            <span className="block text-[10px] text-[#B8B0A8]/80 mt-0.5 font-light">
                              {col.name_te}
                            </span>
                          )}
                        </td>

                        {/* Slug */}
                        <td className="py-4 px-6 font-mono text-[#B8B0A8]">
                          {col.slug}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 text-center">
                          {col.is_published ? (
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
                          {col.sort_order}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => startEdit(col)}
                            className="p-2 text-[#B8B0A8] hover:text-[#C9A24A] hover:bg-white/[0.02] border border-transparent hover:border-[rgba(201,162,74,0.15)] rounded transition-all duration-200"
                            title="Edit Collection"
                          >
                            <Edit size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Collection Modal Overlay */}
        {editingCol && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setEditingCol(null)}
            />
            <div className="relative w-full max-w-2xl bg-[#131315] border border-[rgba(201,162,74,0.15)] p-6 rounded shadow-[0_10px_50px_rgba(0,0,0,0.8)] z-10 space-y-6 max-h-[90vh] overflow-y-auto">
              <div>
                <h3 className="font-serif text-[#F5EFE7] text-lg font-medium tracking-wide">
                  Edit Collection Folder: {editingCol.name_en}
                </h3>
                <p className="text-[11px] text-[#B8B0A8] mt-1 font-light">
                  Modify the folder categories metadata and display settings.
                </p>
              </div>

              <form onSubmit={handleSaveCollection} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name English */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                      Collection Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs rounded transition-all focus:border-[#C9A24A]"
                    />
                  </div>

                  {/* Name Telugu */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                      Collection Name (Telugu)
                    </label>
                    <input
                      type="text"
                      value={nameTe}
                      onChange={(e) => setNameTe(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs rounded transition-all focus:border-[#C9A24A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Description English */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                      Description (English)
                    </label>
                    <textarea
                      rows={3}
                      value={descEn}
                      onChange={(e) => setDescEn(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs rounded transition-all focus:border-[#C9A24A] resize-none"
                    />
                  </div>

                  {/* Description Telugu */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                      Description (Telugu)
                    </label>
                    <textarea
                      rows={3}
                      value={descTe}
                      onChange={(e) => setDescTe(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs rounded transition-all focus:border-[#C9A24A] resize-none"
                    />
                  </div>
                </div>

                {/* Configurations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                      Sort Order Number
                    </label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-[rgba(201,162,74,0.15)] text-[#F5EFE7] text-xs font-mono rounded transition-all focus:border-[#C9A24A]"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      id="col-published"
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 rounded bg-black/40 border-[rgba(201,162,74,0.3)] text-[#C9A24A] focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="col-published" className="text-xs text-[#F5EFE7] font-light cursor-pointer select-none">
                      Publish Collection Folder (Visible)
                    </label>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-2 border-t border-white/[0.04] pt-4">
                  <label className="block text-[10px] uppercase tracking-wider text-[#B8B0A8] font-mono">
                    Cover Image
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Preview box */}
                    <div className="w-20 h-20 bg-black rounded border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {coverUrl ? (
                        <img
                          src={getCloudinaryImageUrl(coverUrl, CLOUDINARY_PRESETS.thumbnail)}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FolderHeart className="text-zinc-700" size={24} />
                      )}
                    </div>

                    {/* Upload actions */}
                    <div className="flex-1 space-y-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-3 py-2 border border-[rgba(201,162,74,0.15)] hover:border-[#C9A24A] bg-black/40 text-xs font-mono uppercase font-bold tracking-wider text-[#C9A24A] rounded hover:bg-[rgba(201,162,74,0.03)] transition-colors duration-200 disabled:opacity-50"
                      >
                        <UploadCloud size={14} />
                        <span>{isUploading ? 'Uploading...' : 'Upload Cover'}</span>
                      </button>
                      <span className="text-[10px] text-zinc-500 block leading-relaxed">
                        Select a JPEG, PNG, or WebP graphic to upload to Cloudinary.
                      </span>
                      {coverUrl && (
                        <button
                          type="button"
                          onClick={() => setCoverUrl('')}
                          className="text-[10px] font-mono uppercase text-red-400 hover:underline block"
                        >
                          Clear cover image
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end border-t border-white/[0.04] pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingCol(null)}
                    disabled={isSaving || isUploading}
                    className="px-4 py-2 border border-white/[0.08] hover:bg-white/[0.02] text-[#B8B0A8] text-xs font-mono uppercase font-bold rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="px-4 py-2 bg-[#C9A24A] text-black text-xs font-mono uppercase font-bold rounded hover:bg-[#b08b3c] transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
