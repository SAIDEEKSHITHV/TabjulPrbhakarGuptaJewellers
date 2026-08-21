import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ArrowLeft, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { supabase, catalogService, type Collection, type Product } from '../lib/supabaseClient';
import { getCloudinaryImageUrl, CLOUDINARY_PRESETS } from '../lib/cloudinary';
import { trackEvent } from '../lib/analytics';
import FooterSection from '../sections/FooterSection';

export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Trigger entrance animations when loading finishes
  useEffect(() => {
    if (loading || error || !collection) return;

    // Set document title & metadata dynamically
    const name = i18n.language === 'te' 
      ? collection.name_te || collection.name_en 
      : collection.name_en;

    const desc = i18n.language === 'te'
      ? collection.description_te || collection.description_en || ''
      : collection.description_en || '';

    document.title = `${name} | ${t('nav.brandName')}`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', desc || `${name} collection from Tabjul Prabhakar Gupta Jewellers.`);
    }

    // Set OG Tags
    const ogTags: Record<string, string> = {
      'og:title': `${name} | ${t('nav.brandName')}`,
      'og:description': desc || `${name} collection from Tabjul Prabhakar Gupta Jewellers.`,
      'og:type': 'website',
      'og:url': window.location.href,
    };

    if (collection.cover_image_url) {
      const isFull = collection.cover_image_url.startsWith('http');
      ogTags['og:image'] = isFull 
        ? collection.cover_image_url 
        : getCloudinaryImageUrl(collection.cover_image_url, CLOUDINARY_PRESETS.card);
    }

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    });

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    let canonicalUrl = window.location.origin + window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang');
    if (lang === 'te' || lang === 'en') {
      canonicalUrl += `?lang=${lang}`;
    }
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonicalUrl);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonicalUrl);
      document.head.appendChild(canonicalLink);
    }

    // Track collection view event
    trackEvent('view_collection', 'Engagement', collection.name_en);

    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        container.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
      );
    });

    return () => ctx.revert();
  }, [loading, error, collection, i18n.language, t]);

  const loadData = async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch published collection
      const { data: col, error: colErr } = await supabaseGetCollection(slug);
      if (colErr) throw colErr;
      if (!col) {
        setCollection(null);
        setLoading(false);
        return;
      }
      setCollection(col);

      // 2. Fetch published products belonging to this collection
      const prods = await catalogService.getProductsByCollection(slug);
      setProducts(prods || []);
    } catch (err) {
      console.error('Error loading collection details:', err);
      setError(t('common.error') || 'Failed to connect to the database server.');
    } finally {
      setLoading(false);
    }
  };

  const supabaseGetCollection = async (colSlug: string) => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', colSlug)
      .eq('is_published', true)
      .single();

    if (error && error.code === 'PGRST116') {
      return { data: null, error: null };
    }
    return { data, error };
  };

  // Helper to resolve cover image
  const getCollectionCover = (cover: string | null) => {
    if (!cover) return '';
    if (cover.startsWith('http')) return cover;
    return getCloudinaryImageUrl(cover, CLOUDINARY_PRESETS.hero);
  };

  // Helper to resolve product thumbnail
  const getProductCover = (product: Product) => {
    const images = product.product_images || [];
    if (images.length === 0) return '';

    const primary = images.find(img => img.is_primary) || [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
    if (!primary) return '';

    if (primary.cloudinary_public_id) {
      return getCloudinaryImageUrl(primary.cloudinary_public_id, CLOUDINARY_PRESETS.card);
    }
    return primary.secure_url || '';
  };

  // Render variables
  const isTe = i18n.language === 'te';
  const name = collection ? (isTe ? collection.name_te || collection.name_en : collection.name_en) : '';
  const desc = collection ? (isTe ? collection.description_te || collection.description_en : collection.description_en) : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col justify-center items-center text-[#F5EFE7]">
        <Loader2 className="animate-spin text-[#C9A24A] mb-4" size={40} />
        <p className="font-mono text-xs uppercase tracking-widest text-[#B8B0A8]">
          Loading Collection...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col justify-center items-center px-6 text-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h2 className="font-serif text-[#F5EFE7] text-2xl mb-2">Connection Error</h2>
        <p className="font-sans text-[#B8B0A8] text-sm max-w-md mb-6">{error}</p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-[#C9A24A] text-black text-xs font-mono uppercase font-bold tracking-widest rounded hover:bg-[#b08b3c] transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col justify-center items-center px-6 text-center">
        <h2 className="font-serif text-[#F5EFE7] text-3xl mb-3">Collection Not Found</h2>
        <p className="font-sans text-[#B8B0A8] text-sm max-w-md mb-8">
          The requested collection does not exist or has been unpublished.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-[#C9A24A] text-black text-xs font-mono uppercase font-bold tracking-widest rounded hover:bg-[#b08b3c] transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col justify-between">
      <div className="pt-[14vh] pb-[10vh] px-6">
        <div ref={containerRef} className="max-w-[1200px] mx-auto flex flex-col text-left">
          {/* Back Navigation */}
          <Link
            to="/"
            onClick={() => {
              // Wait for route to set then scroll to anchor
              setTimeout(() => {
                const el = document.getElementById('collections');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="inline-flex items-center gap-2 text-[#B8B0A8] text-[12px] md:text-[13px] uppercase tracking-[0.15em] font-sans hover:text-[#C9A24A] transition-colors duration-300 mb-8 self-start"
          >
            <ArrowLeft size={14} />
            <span>Back to Collections</span>
          </Link>

          {/* Collection Cover Hero Banner */}
          {collection.cover_image_url && (
            <div className="w-full aspect-[21/9] sm:aspect-[16/6] rounded overflow-hidden border border-[rgba(201,162,74,0.15)] mb-8 bg-black relative">
              <img
                src={getCollectionCover(collection.cover_image_url)}
                alt={name}
                className="w-full h-full object-cover brightness-[0.7]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent" />
            </div>
          )}

          {/* Header Metadata */}
          <div className="max-w-[760px] mb-12">
            <h1 className="font-serif text-[#F5EFE7] text-[clamp(32px,5vw,56px)] leading-[1.1] tracking-[-0.01em] font-medium mb-4">
              {name}
            </h1>
            {desc && (
              <p className="font-sans text-[#C8C0B8] text-[15px] md:text-[16px] leading-[1.85] font-light">
                {desc}
              </p>
            )}
          </div>

          {/* Separator line */}
          <div className="w-full h-px bg-[rgba(201,162,74,0.15)] mb-12" />

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((prod) => {
                const cover = getProductCover(prod);
                const prodName = prod.name_en;
                const prodTagline = isTe ? prod.tagline_te || prod.tagline_en : prod.tagline_en;

                const detailUrl = `${window.location.origin}/products/${prod.slug}`;
                const whatsappNumber = '919247611116';
                const whatsappMessage = `*PRODUCT ENQUIRY*\n\n*Product Name:* ${prodName}\n*Product ID:* ${prod.id}\n\n*Product Link:* ${detailUrl}${cover ? `\n*Image Link:* ${cover}` : ''}`;
                const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

                return (
                  <div
                    key={prod.id}
                    className="group/card flex flex-col text-left justify-between h-full bg-[#131315]/40 border border-white/[0.03] p-4 rounded hover:border-[rgba(201,162,74,0.3)] transition-all duration-300"
                  >
                    <Link
                      to={`/products/${prod.slug}`}
                      className="flex flex-col text-left cursor-pointer"
                    >
                      {/* Card Image */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden border border-[rgba(201,162,74,0.15)] bg-black rounded transition-all duration-300">
                        {cover ? (
                          <img
                            src={cover}
                            alt={prodName}
                            className="w-full h-full object-cover transition-all duration-700 ease-out brightness-[0.88] group-hover/card:brightness-[1.02] group-hover/card:scale-[1.05]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs font-mono uppercase tracking-wider">
                            No Image Available
                          </div>
                        )}
                        <div className="absolute inset-2 border border-[rgba(201,162,74,0)] group-hover/card:border-[rgba(201,162,74,0.25)] transition-all duration-500 pointer-events-none" />
                      </div>

                      {/* Card Metadata */}
                      <h3 className="font-serif text-[#F5EFE7] text-lg mt-4 group-hover/card:text-[#C9A24A] transition-colors duration-300 tracking-wide line-clamp-1">
                        {prodName}
                      </h3>
                      {prodTagline ? (
                        <p className="font-sans text-[#B8B0A8] text-xs font-light mt-1 line-clamp-1 italic mb-4">
                          {prodTagline}
                        </p>
                      ) : (
                        <div className="h-4 mb-4" />
                      )}
                    </Link>

                    {/* Enquiry CTA */}
                    <div className="mt-auto pt-3 border-t border-white/5">
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          trackEvent('click_whatsapp_product', 'Engagement', prodName);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#C9A24A]/40 text-[#C9A24A] hover:text-[#0B0B0C] hover:bg-[#C9A24A] font-sans text-[11px] uppercase tracking-wider font-medium rounded transition-all duration-300"
                      >
                        <MessageSquare size={12} />
                        <span>Enquire about this product</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-[rgba(201,162,74,0.15)] p-12 text-center rounded bg-[#131315]/10 max-w-md mx-auto w-full">
              <p className="text-[#B8B0A8] text-sm font-light">
                No items have been published in this collection yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      </div>
      <FooterSection />
    </div>
  );
}
