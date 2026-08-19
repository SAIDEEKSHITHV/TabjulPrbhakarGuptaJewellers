import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { supabase, catalogService, type Collection, type Product, type ProductImage } from '../lib/supabaseClient';
import { getCloudinaryImageUrl, CLOUDINARY_PRESETS } from '../lib/cloudinary';
import { trackEvent } from '../lib/analytics';
import FooterSection from '../sections/FooterSection';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [activeImage, setActiveImage] = useState<ProductImage | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Handle page title, meta tags, and structured JSON-LD SEO
  useEffect(() => {
    if (loading || error || !product) return;

    const isTe = i18n.language === 'te';
    
    // Fallback order for Title
    const pageTitle = isTe
      ? product.meta_title_te || product.meta_title_en || product.name_te || product.name_en
      : product.meta_title_en || product.name_en;

    // Fallback order for Description
    const pageDesc = isTe
      ? product.meta_description_te || product.meta_description_en || product.description_te || product.description_en || ''
      : product.meta_description_en || product.description_en || '';

    const displayName = isTe ? product.name_te || product.name_en : product.name_en;

    document.title = `${pageTitle} | ${t('nav.brandName')}`;

    // Meta Description tag
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', pageDesc);
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      metaDesc.setAttribute('content', pageDesc);
      document.head.appendChild(metaDesc);
    }

    // Determine primary cover image URL for OG
    let ogImageUrl = '';
    if (activeImage) {
      ogImageUrl = activeImage.cloudinary_public_id
        ? getCloudinaryImageUrl(activeImage.cloudinary_public_id, CLOUDINARY_PRESETS.gallery)
        : activeImage.secure_url;
    }

    const ogTags: Record<string, string> = {
      'og:title': `${pageTitle} | ${t('nav.brandName')}`,
      'og:description': pageDesc,
      'og:type': 'og:product',
      'og:url': window.location.href,
    };
    if (ogImageUrl) ogTags['og:image'] = ogImageUrl;

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

    // Inject Product JSON-LD structured schema (No fabricated SKU/price/rating details)
    const existingSchema = document.querySelector('script[data-product-schema]');
    if (existingSchema) existingSchema.remove();

    const schemaObj: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': displayName,
      'description': pageDesc || undefined,
      'category': collection ? (isTe ? collection.name_te || collection.name_en : collection.name_en) : undefined,
      'url': window.location.href,
    };
    if (ogImageUrl) {
      schemaObj.image = ogImageUrl;
    }

    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-product-schema', 'true');
    script.innerHTML = JSON.stringify(schemaObj);
    document.head.appendChild(script);

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

    // Track product view event
    trackEvent('view_product', 'Engagement', product.name_en);

    // Entrance Animation
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        container.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
      );
    });

    return () => {
      ctx.revert();
      const s = document.querySelector('script[data-product-schema]');
      if (s) s.remove();
    };
  }, [loading, error, product, collection, activeImage, i18n.language, t]);

  const loadProductData = async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch published product joined with images
      const prod = await catalogService.getProductBySlug(slug);
      if (!prod) {
        setProduct(null);
        setLoading(false);
        return;
      }
      setProduct(prod);

      // 2. Fetch associated collection
      const { data: col, error: colErr } = await supabase
        .from('collections')
        .select('*')
        .eq('id', prod.collection_id)
        .single();
      
      if (colErr) throw colErr;
      setCollection(col);

      // 3. Populate product images and sort them
      const sortedImgs = (prod.product_images || [])
        .sort((a, b) => a.sort_order - b.sort_order);
      setImages(sortedImgs);

      // 4. Set active primary image
      const primary = sortedImgs.find(img => img.is_primary) || sortedImgs[0];
      setActiveImage(primary || null);

    } catch (err) {
      console.error('Error fetching product record details:', err);
      setError(t('common.error') || 'Failed to retrieve product details.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to format image delivery URLs based on source of truth publicId
  const getProductImageUrl = (img: ProductImage, preset: Parameters<typeof getCloudinaryImageUrl>[1]) => {
    if (img.cloudinary_public_id) {
      return getCloudinaryImageUrl(img.cloudinary_public_id, preset);
    }
    return img.secure_url || '';
  };

  // Render variables
  const isTe = i18n.language === 'te';
  const name = product ? (isTe ? product.name_te || product.name_en : product.name_en) : '';
  const tagline = product ? (isTe ? product.tagline_te || product.tagline_en : product.tagline_en) : '';
  const desc = product ? (isTe ? product.description_te || product.description_en : product.description_en) : '';
  const colName = collection ? (isTe ? collection.name_te || collection.name_en : collection.name_en) : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col justify-center items-center text-[#F5EFE7]">
        <Loader2 className="animate-spin text-[#C9A24A] mb-4" size={40} />
        <p className="font-mono text-xs uppercase tracking-widest text-[#B8B0A8]">
          Loading Masterpiece...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col justify-center items-center px-6 text-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h2 className="font-serif text-[#F5EFE7] text-2xl mb-2">Error Loading Product</h2>
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

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col justify-center items-center px-6 text-center">
        <h2 className="font-serif text-[#F5EFE7] text-3xl mb-3">Item Not Found</h2>
        <p className="font-sans text-[#B8B0A8] text-sm max-w-md mb-8">
          The requested product does not exist or has been unpublished.
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
          
          {/* Breadcrumbs Navigation */}
          <nav className="flex flex-wrap items-center gap-2 text-[#B8B0A8] text-[11px] md:text-[12px] uppercase tracking-[0.15em] font-sans mb-8">
            <Link to="/" className="hover:text-[#C9A24A] transition-colors">Home</Link>
            <span className="text-zinc-700">/</span>
            {collection && (
              <>
                <Link to={`/collections/${collection.slug}`} className="hover:text-[#C9A24A] transition-colors">
                  {colName}
                </Link>
                <span className="text-zinc-700">/</span>
              </>
            )}
            <span className="text-[#F5EFE7] select-none truncate max-w-[200px]">{name}</span>
          </nav>

          {/* Details Split Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Gallery Column (Left - 7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Active Image View */}
              <div className="w-full aspect-[4/3] rounded overflow-hidden bg-black border border-[rgba(201,162,74,0.15)] relative">
                {activeImage ? (
                  <img
                    src={getProductImageUrl(activeImage, CLOUDINARY_PRESETS.gallery)}
                    alt={activeImage.alt_text_en || name}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs font-mono uppercase tracking-wider">
                    No Photo
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }} />
              </div>

              {/* Thumbnails list */}
              {images.length > 1 && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {images.map((img) => {
                    const isActive = activeImage?.id === img.id;
                    const thumbUrl = getProductImageUrl(img, CLOUDINARY_PRESETS.thumbnail);
                    return (
                      <button
                        key={img.id}
                        onClick={() => setActiveImage(img)}
                        className={`w-16 h-16 rounded overflow-hidden border transition-all duration-300 bg-black flex-shrink-0 ${
                          isActive 
                            ? 'border-[#C9A24A] scale-[1.03] shadow-[0_0_10px_rgba(201,162,74,0.2)]' 
                            : 'border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                        }`}
                      >
                        <img
                          src={thumbUrl}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Specifications Column (Right - 5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Collection Tag & Weight */}
              <div className="flex flex-wrap items-center gap-3">
                {collection && (
                  <span className="font-mono text-[11px] md:text-[12px] uppercase tracking-[0.25em]" style={{ color: '#C9A24A' }}>
                    {colName}
                  </span>
                )}
                {product.weight && (
                  <>
                    <span className="text-zinc-700">|</span>
                    <span className="font-mono text-[11px] md:text-[12px] uppercase tracking-wider text-[#B8B0A8]">
                      {product.weight} grams
                    </span>
                  </>
                )}
              </div>

              {/* Product Title */}

              <h1 className="font-serif text-[#F5EFE7] text-[clamp(28px,4vw,44px)] leading-[1.1] tracking-wide font-medium">
                {name}
              </h1>

              {/* Tagline */}
              {tagline && (
                <p className="font-serif text-[#D4CBC3] text-lg leading-relaxed font-light italic">
                  {tagline}
                </p>
              )}

              {/* Separator line */}
              <div className="w-16 h-px" style={{ backgroundColor: 'rgba(201, 162, 74, 0.5)' }} />

              {/* Description */}
              {desc && (
                <p className="font-sans text-[#B8B0A8] text-[14px] md:text-[15px] leading-[1.75] font-light whitespace-pre-line">
                  {desc}
                </p>
              )}

              {/* Inquiry CTA */}
              <div className="pt-6">
                {(() => {
                  const primaryImageUrl = activeImage ? getProductImageUrl(activeImage, CLOUDINARY_PRESETS.gallery) : '';
                  const detailUrl = window.location.href;
                  const whatsappMessage = `*PRODUCT ENQUIRY*\n\n*Product Name:* ${name}\n*Product ID:* ${product.id}\n\n*Product Link:* ${detailUrl}${primaryImageUrl ? `\n*Image Link:* ${primaryImageUrl}` : ''}`;
                  return (
                    <a
                      href={`https://wa.me/919849289421?text=${encodeURIComponent(whatsappMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('click_whatsapp_product', 'Engagement', name)}
                      className="group inline-flex items-center gap-4 relative overflow-hidden px-8 py-3.5 border border-[#C9A24A]/40 text-[#C9A24A] hover:text-[#0B0B0C] hover:bg-[#C9A24A] font-sans text-xs uppercase tracking-[0.18em] font-medium rounded-full transition-all duration-300"
                    >
                      <MessageSquare size={14} />
                      <span>Inquire About This Piece</span>
                    </a>
                  );
                })()}
              </div>

            </div>

          </div>

        </div>
      </div>
      <FooterSection />
    </div>
  );
}
