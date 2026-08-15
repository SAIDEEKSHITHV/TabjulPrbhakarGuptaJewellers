import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabaseClient';
import AdminLayout from '../components/layout/AdminLayout';
import { getCloudinaryImageUrl, CLOUDINARY_PRESETS } from '../lib/cloudinary';
import type { Product } from '../types/catalog';
import { 
  PlusCircle, 
  Gem, 
  FolderHeart, 
  ShieldCheck,
  Activity
} from 'lucide-react';

interface Stats {
  totalProducts: number | string;
  totalCollections: number | string;
  publishedProducts: number | string;
  featuredProducts: number | string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalProducts: '—',
    totalCollections: '—',
    publishedProducts: '—',
    featuredProducts: '—',
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      try {
        // Query counts using HEAD requests (highly performant, doesn't fetch row details)
        const [
          collectionsRes,
          productsRes,
          publishedRes,
          featuredRes,
          recentRes
        ] = await Promise.all([
          supabase.from('collections').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_published', true),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_featured', true),
          supabase.from('products').select('*, collection:collections(name_en), product_images(*)').order('updated_at', { ascending: false }).limit(5)
        ]);

        if (!isMounted) return;

        setStats({
          totalCollections: collectionsRes.count !== null ? collectionsRes.count : 0,
          totalProducts: productsRes.count !== null ? productsRes.count : 0,
          publishedProducts: publishedRes.count !== null ? publishedRes.count : 0,
          featuredProducts: featuredRes.count !== null ? featuredRes.count : 0,
        });

        setRecentProducts(recentRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard database stats:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, desc: 'All items in database', icon: Gem },
    { label: 'Total Collections', value: stats.totalCollections, desc: 'Categories seeded', icon: FolderHeart },
    { label: 'Published Products', value: stats.publishedProducts, desc: 'Live on public website', icon: ShieldCheck },
    { label: 'Featured Products', value: stats.featuredProducts, desc: 'Shown on homepage', icon: Activity },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 select-none">
        {/* Welcome Header */}
        <div>
          <h1 className="font-serif text-[#F5EFE7] text-2xl md:text-3xl font-medium tracking-wide">
            {getGreeting()}, Admin
          </h1>
          <p className="text-xs md:text-sm text-[#B8B0A8] mt-1 font-light leading-relaxed">
            Manage your jewelry catalogue and dynamic collection folders.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div 
                key={card.label}
                className="bg-[#131315]/40 border border-[rgba(201,162,74,0.15)] p-5 rounded hover:border-[rgba(201,162,74,0.3)] transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-[#B8B0A8] uppercase tracking-wider font-mono font-medium">
                    {card.label}
                  </span>
                  <Icon size={16} className="text-[#C9A24A]" />
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl md:text-3xl font-bold text-[#F5EFE7] tracking-tight">
                    {loading ? (
                      <span className="w-8 h-6 bg-white/5 rounded animate-pulse inline-block" />
                    ) : (
                      card.value
                    )}
                  </span>
                </div>
                <p className="text-[10px] text-[#B8B0A8]/60 mt-1 font-light">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-[#B8B0A8] font-mono font-medium">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
            {/* Add Product Button */}
            <button
              onClick={() => navigate('/products/new')}
              className="flex items-center gap-3 p-4 bg-[#131315]/40 border border-[rgba(201,162,74,0.15)] rounded hover:border-[#C9A24A] hover:bg-[rgba(201,162,74,0.05)] text-left group transition-all duration-300"
            >
              <PlusCircle size={20} className="text-[#C9A24A] group-hover:scale-105 transition-transform duration-300" />
              <div>
                <span className="block text-sm font-medium text-[#F5EFE7]">Add Product</span>
                <span className="text-[10px] text-[#B8B0A8] font-light">Create database listing</span>
              </div>
            </button>

            {/* Manage Products Button */}
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-3 p-4 bg-[#131315]/40 border border-[rgba(201,162,74,0.15)] rounded hover:border-[#C9A24A] hover:bg-[rgba(201,162,74,0.05)] text-left group transition-all duration-300"
            >
              <Gem size={20} className="text-[#C9A24A] group-hover:scale-105 transition-transform duration-300" />
              <div>
                <span className="block text-sm font-medium text-[#F5EFE7]">Manage Products</span>
                <span className="text-[10px] text-[#B8B0A8] font-light">Update catalog inventory</span>
              </div>
            </button>

            {/* Manage Collections Button */}
            <button
              onClick={() => navigate('/collections')}
              className="flex items-center gap-3 p-4 bg-[#131315]/40 border border-[rgba(201,162,74,0.15)] rounded hover:border-[#C9A24A] hover:bg-[rgba(201,162,74,0.05)] text-left group transition-all duration-300"
            >
              <FolderHeart size={20} className="text-[#C9A24A] group-hover:scale-105 transition-transform duration-300" />
              <div>
                <span className="block text-sm font-medium text-[#F5EFE7]">Manage Collections</span>
                <span className="text-[10px] text-[#B8B0A8] font-light">Edit categories & folders</span>
              </div>
            </button>
          </div>
        </div>

        {/* Recently Added Products */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-[#B8B0A8] font-mono font-medium flex items-center justify-between">
            <span>Recently Added Products</span>
            <button 
              onClick={() => navigate('/products')}
              className="text-[10px] text-[#C9A24A] hover:underline normal-case tracking-normal font-sans"
            >
              View all products
            </button>
          </h2>
          
          <div className="bg-[#131315]/40 border border-[rgba(201,162,74,0.15)] rounded overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-zinc-500 text-xs font-light">
                Loading recent catalog data...
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs font-light">
                No products cataloged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-light">
                  <thead>
                    <tr className="border-b border-white/[0.04] text-[10px] text-[#B8B0A8] uppercase tracking-wider font-mono bg-black/20">
                      <th className="py-3 px-5">Image</th>
                      <th className="py-3 px-5">Product</th>
                      <th className="py-3 px-5">Collection</th>
                      <th className="py-3 px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {recentProducts.map((prod) => {
                      const primaryImage = prod.product_images?.find(img => img.is_primary) || prod.product_images?.[0];
                      const coverUrl = primaryImage
                        ? (primaryImage.cloudinary_public_id
                          ? getCloudinaryImageUrl(primaryImage.cloudinary_public_id, CLOUDINARY_PRESETS.thumbnail)
                          : primaryImage.secure_url)
                        : '';

                      return (
                        <tr 
                          key={prod.id} 
                          onClick={() => navigate(`/products/${prod.id}/edit`)}
                          className="hover:bg-white/[0.01] cursor-pointer transition-colors duration-200"
                        >
                          <td className="py-3 px-5">
                            <div className="w-10 h-10 bg-black rounded border border-white/5 overflow-hidden flex-shrink-0">
                              {coverUrl ? (
                                <img src={coverUrl} alt={prod.name_en} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-600 font-mono">
                                  NO IMG
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-5 font-medium text-[#F5EFE7]">
                            <span className="block">{prod.name_en}</span>
                            <span className="text-[10px] text-[#B8B0A8]/50 block font-mono mt-0.5">{prod.slug}</span>
                          </td>
                          <td className="py-3 px-5 text-[#B8B0A8]">
                            {prod.collection?.name_en || '—'}
                          </td>
                          <td className="py-3 px-5">
                            {prod.is_published ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] bg-emerald-950/30 border border-emerald-800/30 text-emerald-400 font-light">
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] bg-zinc-900 border border-zinc-700 text-zinc-400 font-light">
                                Draft
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
