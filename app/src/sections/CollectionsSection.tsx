import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { catalogService, type Collection } from '../lib/supabaseClient';
import { getCloudinaryImageUrl, CLOUDINARY_PRESETS } from '../lib/cloudinary';

gsap.registerPlugin(ScrollTrigger);

export default function CollectionsSection() {
  const { t, i18n } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Fetch only published collections ordered by sort_order
    catalogService.getCollections()
      .then((data) => {
        if (!isMounted) return;
        setCollections(data || []);
        setLoading(false);
        // Refresh ScrollTrigger calculations after DOM updates
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 120);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching collections for homepage:', err);
        setError('Failed to load collections.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (loading || error || collections.length === 0) return;

    const section = sectionRef.current;
    const title = titleRef.current;
    const cards = cardsRef.current;

    if (!section || !title || !cards) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(title,
        { y: '6vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 85%',
            end: 'top 55%',
            scrub: 0.4,
          },
        }
      );

      // Cards animation with stagger
      const cardElements = cards.querySelectorAll('.collection-card');
      cardElements.forEach((card) => {
        gsap.fromTo(card,
          { y: '18vh', scale: 0.98, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              end: 'top 55%',
              scrub: 0.4,
            },
          }
        );
      });

    }, section);

    return () => ctx.revert();
  }, [loading, error, collections]);

  // Helper to format image delivery URLs based on source of truth publicId
  const getCollectionCover = (cover: string | null) => {
    if (!cover) return '';
    if (cover.startsWith('http')) return cover;
    return getCloudinaryImageUrl(cover, CLOUDINARY_PRESETS.card);
  };

  const isTe = i18n.language === 'te';

  return (
    <section
      ref={sectionRef}
      id="collections"
      className="relative w-full bg-[#2A0A10] py-[10vh] z-30"
    >
      {/* Title */}
      <h2
        ref={titleRef}
        className="font-serif text-[#F5EFE7] text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-[-0.01em] font-medium px-[6vw] mb-[6vh]"
      >
        {t('collections.title')}
      </h2>

      {/* Grid wrapper */}
      <div ref={cardsRef} className="px-[6vw]">
        {loading ? (
          /* Skeletons Loading view */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[3vw]">
            {[1, 2, 3, 4].map((id) => (
              <div key={id} className="animate-pulse flex flex-col space-y-4">
                <div className="aspect-[4/3] bg-black/40 rounded border border-white/[0.03]" />
                <div className="h-6 w-1/3 bg-black/40 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error display */
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded bg-black/10 text-center text-[#B8B0A8] max-w-md mx-auto">
            <AlertCircle className="text-red-400 mb-3" size={32} />
            <p className="text-sm font-light leading-relaxed">{error}</p>
          </div>
        ) : collections.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12 text-[#B8B0A8] font-light text-sm">
            No published collections found.
          </div>
        ) : (
          /* Active Collections Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[3vw]">
            {collections.map((col) => {
              const cover = getCollectionCover(col.cover_image_url);
              const colName = isTe ? col.name_te || col.name_en : col.name_en;

              return (
                <Link
                  key={col.id}
                  to={`/collections/${col.slug}`}
                  className="collection-card group relative overflow-hidden cursor-pointer block"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-black/45 rounded border border-white/[0.04]">
                    {cover ? (
                      <img
                        src={cover}
                        alt={colName}
                        className="w-full h-full object-cover transition-all duration-700 ease-out brightness-[0.88] group-hover:brightness-[1.02] group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs font-mono uppercase tracking-wider">
                        No Cover Available
                      </div>
                    )}
                    {/* Inset gold border frame on hover */}
                    <div className="absolute inset-3 border border-[rgba(201,162,74,0)] group-hover:border-[rgba(201,162,74,0.35)] transition-all duration-500 pointer-events-none z-10" />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-[#0B0B0C] opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500" />
                  </div>
                  {/* Label */}
                  <div className="mt-4 flex items-center justify-between">
                    <h3 className="font-serif text-[#F5EFE7] text-[clamp(18px,2vw,24px)] tracking-wide">
                      {colName}
                    </h3>
                    <ArrowRight
                      size={18}
                      className="text-[#C9A24A] opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300"
                    />
                  </div>
                  <div className="w-0 group-hover:w-12 h-px bg-[#C9A24A] mt-2 transition-all duration-500" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-[6vh]">
        <button
          onClick={() => {
            const el = document.getElementById('collections');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group flex items-center gap-3 px-8 py-3.5 border border-[rgba(245,239,231,0.2)] text-[#F5EFE7] font-sans text-[13px] uppercase tracking-[0.15em] hover:border-[#C9A24A] hover:text-[#C9A24A] transition-all duration-300"
        >
          {t('collections.cta')}
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </section>
  );
}

