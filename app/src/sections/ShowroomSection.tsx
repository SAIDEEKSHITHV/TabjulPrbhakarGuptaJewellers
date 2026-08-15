import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ShowroomItem {
  id: string;
  src: string;
  translationKey: string;
  featured?: boolean;
}

const showroomItems: ShowroomItem[] = [
  {
    id: 'exteriorMain',
    src: '/images/showroom-exterior-main.jpg',
    translationKey: 'showroom.items.exteriorMain',
  },
  {
    id: 'exteriorClose',
    src: '/images/showroom-exterior-close.jpg',
    translationKey: 'showroom.items.exteriorClose',
  },
  {
    id: 'customerExperience',
    src: '/images/showroom-customer-experience.jpg',
    translationKey: 'showroom.items.customerExperience',
    featured: true,
  },
  {
    id: 'interiorView',
    src: '/images/showroom-interior-view.jpg',
    translationKey: 'showroom.items.interiorView',
  },
  {
    id: 'ownersFamily',
    src: '/images/owners-family.jpg',
    translationKey: 'showroom.items.ownersFamily',
  },
];

export default function ShowroomSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  // Lock body scroll when Lightbox is active
  useEffect(() => {
    if (activeIdx !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeIdx]);

  // Keyboard controls for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIdx === null) return;
      if (e.key === 'Escape') {
        setActiveIdx(null);
      } else if (e.key === 'ArrowRight') {
        setActiveIdx((prev) => (prev !== null ? (prev + 1) % showroomItems.length : null));
      } else if (e.key === 'ArrowLeft') {
        setActiveIdx((prev) => (prev !== null ? (prev - 1 + showroomItems.length) % showroomItems.length : null));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const grid = gridRef.current;

    if (!section || !header || !grid) return;

    const ctx = gsap.context(() => {
      // Reveal header
      gsap.fromTo(
        header,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
          },
        }
      );

      // Reveal cards in staggered fashion
      gsap.fromTo(
        grid.querySelectorAll('.showroom-card'),
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: grid,
            start: 'top 80%',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev !== null ? (prev - 1 + showroomItems.length) % showroomItems.length : null));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev !== null ? (prev + 1) % showroomItems.length : null));
  };

  // Split items into 3 columns for desktop layout
  // Column 1: exteriorMain, exteriorClose
  // Column 2: customerExperience (Featured)
  // Column 3: interiorView, ownersFamily
  const leftColItems = [
    { item: showroomItems[0], originalIndex: 0 },
    { item: showroomItems[1], originalIndex: 1 },
  ];
  const featuredItem = { item: showroomItems[2], originalIndex: 2 };
  const rightColItems = [
    { item: showroomItems[3], originalIndex: 3 },
    { item: showroomItems[4], originalIndex: 4 },
  ];

  return (
    <section
      ref={sectionRef}
      id="showroom-section"
      className="relative w-full py-24 md:py-32 overflow-hidden z-[56] bg-[#0B0B0C]"
    >
      {/* Subtle top gold line divider */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 10%, rgba(201,162,74,0.25) 50%, transparent 90%)',
        }}
      />

      {/* Decorative gold vignette radial background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(201,162,74,0.03) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        {/* ── Section Header ───────────────────────────────── */}
        <div ref={headerRef} className="text-center mb-16 md:mb-20 max-w-3xl mx-auto">
          <span className="font-mono text-[11px] md:text-[12px] uppercase tracking-[0.25em] text-[#C9A24A] block mb-4">
            ✦ {t('nav.about')}
          </span>
          <h2 className="font-serif text-[#F5EFE7] text-[clamp(32px,4.5vw,56px)] leading-[1.1] tracking-[-0.01em] font-medium mb-6">
            {t('showroom.title')}
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#C9A24A] to-transparent mx-auto mb-6" />
          <p className="font-sans text-[#B8B0A8] text-[clamp(14px,1.3vw,17px)] leading-[1.7] font-light text-balance">
            {t('showroom.subhead')}
          </p>
        </div>

        {/* ── Desktop Showroom Grid Layout (lg:grid) ─────────── */}
        <div ref={gridRef} className="hidden lg:grid lg:grid-cols-3 gap-8 items-stretch">
          {/* Left Column (Supporting Cards) */}
          <div className="flex flex-col gap-8 justify-between h-full">
            {leftColItems.map(({ item, originalIndex }) => (
              <div
                key={item.id}
                onClick={() => setActiveIdx(originalIndex)}
                className="showroom-card group cursor-pointer rounded-xl overflow-hidden flex flex-col justify-between h-full transition-all duration-500 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,239,231,0.04) 0%, rgba(245,239,231,0.01) 100%)',
                  border: '1px solid rgba(201,162,74,0.12)',
                }}
              >
                <div className="overflow-hidden relative aspect-[16/10] w-full">
                  <img
                    src={item.src}
                    alt={t(`${item.translationKey}.caption`)}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle dark gold image overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent opacity-40 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-[#C9A24A]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Magnifying Glass Indicator */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#0B0B0C]/80 backdrop-blur-sm border border-[#C9A24A]/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-5px] group-hover:translate-y-0">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#C9A24A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <h3 className="font-serif text-[#F5EFE7] text-[18px] tracking-wide mb-2 group-hover:text-[#C9A24A] transition-colors duration-300">
                    {t(`${item.translationKey}.caption`)}
                  </h3>
                  <p className="font-sans text-[#B8B0A8] text-[13px] leading-[1.6] font-light">
                    {t(`${item.translationKey}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Center Column (Featured Card - Spans full height with visual emphasis) */}
          <div className="h-full flex">
            <div
              onClick={() => setActiveIdx(featuredItem.originalIndex)}
              className="showroom-card group cursor-pointer rounded-xl overflow-hidden flex flex-col justify-between w-full h-full transition-all duration-500 hover:shadow-[0_15px_35px_rgba(201,162,74,0.1)]"
              style={{
                background: 'linear-gradient(135deg, rgba(201,162,74,0.06) 0%, rgba(201,162,74,0.02) 100%)',
                border: '1px solid rgba(201,162,74,0.22)',
              }}
            >
              <div className="overflow-hidden relative aspect-[3/4] w-full flex-grow">
                <img
                  src={featuredItem.item.src}
                  alt={t(`${featuredItem.item.translationKey}.caption`)}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Visual Accent Badge */}
                <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-[#C9A24A]/90 backdrop-blur-md border border-[#F5EFE7]/20 flex items-center gap-1.5 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F5EFE7] animate-pulse" />
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#F5EFE7] font-semibold">
                    Featured Experience
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent opacity-60 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-[#C9A24A]/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Magnifying Glass Indicator */}
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#0B0B0C]/80 backdrop-blur-sm border border-[#C9A24A]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-5px] group-hover:translate-y-0">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C9A24A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>
              <div className="p-8 flex-shrink-0 text-center bg-[#0D0D0E]/80 backdrop-blur-sm relative border-t border-[#C9A24A]/10">
                <h3 className="font-serif text-[#F5EFE7] text-[22px] tracking-wide mb-3 group-hover:text-[#C9A24A] transition-colors duration-300">
                  {t(`${featuredItem.item.translationKey}.caption`)}
                </h3>
                <p className="font-sans text-[#B8B0A8] text-[14px] leading-[1.65] font-light max-w-md mx-auto">
                  {t(`${featuredItem.item.translationKey}.desc`)}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (Supporting Cards) */}
          <div className="flex flex-col gap-8 justify-between h-full">
            {rightColItems.map(({ item, originalIndex }) => (
              <div
                key={item.id}
                onClick={() => setActiveIdx(originalIndex)}
                className="showroom-card group cursor-pointer rounded-xl overflow-hidden flex flex-col justify-between h-full transition-all duration-500 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,239,231,0.04) 0%, rgba(245,239,231,0.01) 100%)',
                  border: '1px solid rgba(201,162,74,0.12)',
                }}
              >
                <div className="overflow-hidden relative aspect-[16/10] w-full">
                  <img
                    src={item.src}
                    alt={t(`${item.translationKey}.caption`)}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent opacity-40 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-[#C9A24A]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Magnifying Glass Indicator */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#0B0B0C]/80 backdrop-blur-sm border border-[#C9A24A]/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-5px] group-hover:translate-y-0">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#C9A24A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <h3 className="font-serif text-[#F5EFE7] text-[18px] tracking-wide mb-2 group-hover:text-[#C9A24A] transition-colors duration-300">
                    {t(`${item.translationKey}.caption`)}
                  </h3>
                  <p className="font-sans text-[#B8B0A8] text-[13px] leading-[1.6] font-light">
                    {t(`${item.translationKey}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mobile Layout (Stacked Vertically) ───────────────── */}
        <div className="grid grid-cols-1 gap-8 lg:hidden">
          {showroomItems.map((item, index) => {
            const isFeatured = item.featured;
            return (
              <div
                key={item.id}
                onClick={() => setActiveIdx(index)}
                className="showroom-card group cursor-pointer rounded-xl overflow-hidden flex flex-col transition-all duration-500"
                style={{
                  background: isFeatured
                    ? 'linear-gradient(135deg, rgba(201,162,74,0.06) 0%, rgba(201,162,74,0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(245,239,231,0.04) 0%, rgba(245,239,231,0.01) 100%)',
                  border: isFeatured
                    ? '1px solid rgba(201,162,74,0.25)'
                    : '1px solid rgba(201,162,74,0.12)',
                }}
              >
                <div className="overflow-hidden relative aspect-[4/3] w-full">
                  <img
                    src={item.src}
                    alt={t(`${item.translationKey}.caption`)}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out"
                  />
                  {isFeatured && (
                    <div className="absolute top-4 left-4 px-2.5 py-0.5 rounded-full bg-[#C9A24A]/90 backdrop-blur-sm border border-[#F5EFE7]/20 flex items-center gap-1 shadow">
                      <span className="w-1 h-1 rounded-full bg-[#F5EFE7]" />
                      <span className="font-mono text-[8px] uppercase tracking-wider text-[#F5EFE7] font-semibold">
                        Featured Experience
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent opacity-40" />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-[#F5EFE7] text-[19px] tracking-wide mb-2">
                    {t(`${item.translationKey}.caption`)}
                  </h3>
                  <p className="font-sans text-[#B8B0A8] text-[13px] leading-[1.65] font-light">
                    {t(`${item.translationKey}.desc`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Lightbox Overlay Modal (rendered via Portal) ─────────── */}
      {activeIdx !== null && mounted && createPortal(
        <div
          onClick={() => setActiveIdx(null)}
          className="fixed inset-0 z-[99999] flex flex-col justify-center items-center bg-[#0B0B0C]/95 backdrop-blur-md transition-all duration-300 p-4 md:p-8"
        >
          {/* Top Status & Close button */}
          <div className="absolute top-6 left-0 right-0 px-6 md:px-12 flex justify-between items-center z-[100000]">
            <span className="font-mono text-[11px] tracking-wider text-[#B8B0A8]">
              {activeIdx + 1} / {showroomItems.length}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx(null);
              }}
              className="p-3 text-[#B8B0A8] hover:text-[#C9A24A] transition-colors duration-300 focus:outline-none cursor-pointer"
              aria-label="Close Lightbox"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-[#B8B0A8] hover:text-[#C9A24A] transition-colors duration-300 bg-[#0B0B0C]/40 hover:bg-[#0B0B0C]/80 border border-gold/10 hover:border-gold/30 rounded-full z-[100000] cursor-pointer"
            aria-label="Previous image"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Center Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full flex flex-col items-center justify-center gap-6 mt-8"
          >
            <div className="relative overflow-hidden rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#C9A24A]/25 max-h-[50vh] md:max-h-[65vh] flex items-center justify-center">
              <img
                src={showroomItems[activeIdx].src}
                alt={t(`${showroomItems[activeIdx].translationKey}.caption`)}
                className="max-w-full max-h-[50vh] md:max-h-[65vh] object-contain"
              />
            </div>

            {/* Captions and descriptions below image inside modal */}
            <div className="text-center max-w-xl px-4 select-text">
              <h3 className="font-serif text-[#F5EFE7] text-[20px] md:text-[24px] tracking-wide mb-2 text-gold">
                {t(`${showroomItems[activeIdx].translationKey}.caption`)}
              </h3>
              <p className="font-sans text-[#B8B0A8] text-[13px] md:text-[15px] leading-relaxed font-light">
                {t(`${showroomItems[activeIdx].translationKey}.desc`)}
              </p>
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-[#B8B0A8] hover:text-[#C9A24A] transition-colors duration-300 bg-[#0B0B0C]/40 hover:bg-[#0B0B0C]/80 border border-gold/10 hover:border-gold/30 rounded-full z-[100000] cursor-pointer"
            aria-label="Next image"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>,
        document.body
      )}

      {/* Subtle bottom gold line divider */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 10%, rgba(201,162,74,0.25) 50%, transparent 90%)',
        }}
      />
    </section>
  );
}
