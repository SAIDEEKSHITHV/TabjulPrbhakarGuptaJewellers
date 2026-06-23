import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Stats Data ────────────────────────────────────────────── */
const stats = [
  { valueKey: 'legacy.stat1.value', labelKey: 'legacy.stat1.label' },
  { valueKey: 'legacy.stat2.value', labelKey: 'legacy.stat2.label' },
  { valueKey: 'legacy.stat3.value', labelKey: 'legacy.stat3.label' },
  { valueKey: 'legacy.stat4.value', labelKey: 'legacy.stat4.label' },
];

/* ─── Image Paths ───────────────────────────────────────────── */
const oldShopImage = '/images/legacy-1991.jpg';
const newShowroomImage = '/images/showroom-today.jpg';

/* ═══════════════════════════════════════════════════════════════
   LEGACY SECTION
   ═══════════════════════════════════════════════════════════════ */
export default function LegacySection() {
  const { t } = useTranslation();
  /* ── Refs ───────────────────────────────────────────────────── */
  const sectionRef = useRef<HTMLDivElement>(null);

  // Image side
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const oldImageRef = useRef<HTMLDivElement>(null);
  const newImageRevealRef = useRef<HTMLDivElement>(null);
  const goldDividerRef = useRef<HTMLDivElement>(null);

  // Text side
  const textContainerRef = useRef<HTMLDivElement>(null);
  const oldYearRef = useRef<HTMLSpanElement>(null);
  const oldTitleRef = useRef<HTMLHeadingElement>(null);
  const oldBodyRef = useRef<HTMLParagraphElement>(null);
  const newYearRef = useRef<HTMLSpanElement>(null);
  const newTitleRef = useRef<HTMLHeadingElement>(null);
  const newBodyRef = useRef<HTMLParagraphElement>(null);

  // Timeline
  const timelineRef = useRef<HTMLDivElement>(null);

  // Stats
  const statsContainerRef = useRef<HTMLDivElement>(null);

  /* ── Animations ────────────────────────────────────────────── */
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const imageContainer = imageContainerRef.current;
    const oldImage = oldImageRef.current;
    const newImageReveal = newImageRevealRef.current;
    const goldDivider = goldDividerRef.current;
    const textContainer = textContainerRef.current;
    const oldYear = oldYearRef.current;
    const oldTitle = oldTitleRef.current;
    const oldBody = oldBodyRef.current;
    const newYear = newYearRef.current;
    const newTitle = newTitleRef.current;
    const newBody = newBodyRef.current;
    const timeline = timelineRef.current;
    const statsContainer = statsContainerRef.current;

    if (
      !section || !imageContainer || !oldImage || !newImageReveal ||
      !goldDivider || !textContainer || !oldYear || !oldTitle ||
      !oldBody || !newYear || !newTitle || !newBody || !timeline || !statsContainer
    ) return;

    const statItems = statsContainer.querySelectorAll<HTMLElement>('.legacy-stat');
    const mm = gsap.matchMedia();

    /* ─── DESKTOP (≥1024px) ──────────────────────────────────── */
    mm.add('(min-width: 1024px)', () => {
      const ctx = gsap.context(() => {
        // Initial states
        gsap.set(oldImage, { x: '-12vw', scale: 1.08, opacity: 0 });
        gsap.set(newImageReveal, { clipPath: 'inset(0 100% 0 0)' });
        gsap.set(goldDivider, { left: '0%', opacity: 0 });

        gsap.set(oldYear, { y: 40, opacity: 0 });
        gsap.set(oldTitle, { y: 50, opacity: 0 });
        gsap.set(oldBody, { y: 40, opacity: 0 });

        gsap.set(newYear, { y: 30, opacity: 0 });
        gsap.set(newTitle, { y: 40, opacity: 0 });
        gsap.set(newBody, { y: 30, opacity: 0 });

        gsap.set(timeline, { scaleX: 0, opacity: 0, transformOrigin: 'left center' });
        gsap.set(statItems, { y: 50, opacity: 0 });

        /*
         * TIMELINE MAP (% of scroll distance):
         *
         *  0%–10%   Phase 1 entrance (old image + text animate in)
         * 10%–22%   HOLD — user reads 1991 story
         * 22%–38%   Phase 2 transition (wipe + text swap)
         * 38%–48%   HOLD — user reads "Today" story
         * 48%–58%   Phase 3 stats fade in
         * 58%–100%  HOLD — user views final state, then section unpins
         */

        // Main pinned timeline — 400vh scroll distance for generous pacing
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=400%',
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        /* ── PHASE 1: Origin Story (0% → 10%) ───────────────── */
        tl.to(oldImage, {
          x: 0, scale: 1, opacity: 1,
          ease: 'power2.out', duration: 0.06,
        }, 0);

        tl.to(oldYear, {
          y: 0, opacity: 1,
          ease: 'power2.out', duration: 0.04,
        }, 0.03);

        tl.to(oldTitle, {
          y: 0, opacity: 1,
          ease: 'power2.out', duration: 0.04,
        }, 0.05);

        tl.to(oldBody, {
          y: 0, opacity: 1,
          ease: 'power2.out', duration: 0.04,
        }, 0.07);

        /* ── HOLD (10%–22%) — nothing animates ───────────────── */

        /* ── PHASE 2: Transformation (22% → 38%) ────────────── */
        // Gold divider appears
        tl.to(goldDivider, {
          opacity: 1,
          ease: 'none', duration: 0.01,
        }, 0.22);

        // Horizontal wipe reveal + gold divider sweep
        tl.to(newImageReveal, {
          clipPath: 'inset(0 0% 0 0)',
          ease: 'power1.inOut', duration: 0.14,
        }, 0.22);

        tl.to(goldDivider, {
          left: '100%',
          ease: 'power1.inOut', duration: 0.14,
        }, 0.22);

        // Fade old text out
        tl.to([oldYear, oldTitle, oldBody], {
          y: -30, opacity: 0,
          ease: 'power2.in', duration: 0.06,
          stagger: 0.01,
        }, 0.22);

        // Fade new text in
        tl.to(newYear, {
          y: 0, opacity: 1,
          ease: 'power2.out', duration: 0.05,
        }, 0.30);

        tl.to(newTitle, {
          y: 0, opacity: 1,
          ease: 'power2.out', duration: 0.05,
        }, 0.32);

        tl.to(newBody, {
          y: 0, opacity: 1,
          ease: 'power2.out', duration: 0.05,
        }, 0.34);

        // Timeline bar scales in
        tl.to(timeline, {
          scaleX: 1, opacity: 1,
          ease: 'power2.out', duration: 0.06,
        }, 0.33);

        // Gold divider fades out
        tl.to(goldDivider, {
          opacity: 0,
          ease: 'power2.out', duration: 0.03,
        }, 0.36);

        /* ── HOLD (38%–48%) — user reads "Today" story ───────── */

        /* ── PHASE 3: Stats (48% → 58%) ─────────────────────── */
        statItems.forEach((stat, i) => {
          tl.to(stat, {
            y: 0, opacity: 1,
            ease: 'power2.out', duration: 0.05,
          }, 0.48 + i * 0.025);
        });

        /* ── HOLD (58%–100%) — everything visible, static ────── */
        // Add a no-op tween at the very end so the timeline
        // extends to 1.0 and the section stays pinned
        tl.to({}, { duration: 0.42 }, 0.58);

      }, section);

      return () => ctx.revert();
    });

    /* ─── MOBILE (<1024px) ───────────────────────────────────── */
    mm.add('(max-width: 1023px)', () => {
      const ctx = gsap.context(() => {
        // Initial states
        gsap.set(oldImage, { x: '-8vw', scale: 1.06, opacity: 0 });
        gsap.set(newImageReveal, { clipPath: 'inset(0 100% 0 0)' });
        gsap.set(goldDivider, { left: '0%', opacity: 0 });

        gsap.set(oldYear, { y: 30, opacity: 0 });
        gsap.set(oldTitle, { y: 40, opacity: 0 });
        gsap.set(oldBody, { y: 30, opacity: 0 });

        gsap.set(newYear, { y: 20, opacity: 0 });
        gsap.set(newTitle, { y: 30, opacity: 0 });
        gsap.set(newBody, { y: 20, opacity: 0 });

        gsap.set(timeline, { scaleX: 0, opacity: 0, transformOrigin: 'left center' });
        gsap.set(statItems, { y: 40, opacity: 0 });

        // Mobile: 350vh scroll distance
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=350%',
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });

        /* PHASE 1 (0%–10%) */
        tl.to(oldImage, { x: 0, scale: 1, opacity: 1, ease: 'power2.out', duration: 0.06 }, 0);
        tl.to(oldYear, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.04 }, 0.03);
        tl.to(oldTitle, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.04 }, 0.05);
        tl.to(oldBody, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.04 }, 0.07);

        /* HOLD (10%–22%) */

        /* PHASE 2 (22%–38%) */
        tl.to(goldDivider, { opacity: 1, ease: 'none', duration: 0.01 }, 0.22);
        tl.to(newImageReveal, { clipPath: 'inset(0 0% 0 0)', ease: 'power1.inOut', duration: 0.14 }, 0.22);
        tl.to(goldDivider, { left: '100%', ease: 'power1.inOut', duration: 0.14 }, 0.22);

        tl.to([oldYear, oldTitle, oldBody], { y: -20, opacity: 0, ease: 'power2.in', duration: 0.06, stagger: 0.01 }, 0.22);

        tl.to(newYear, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.05 }, 0.30);
        tl.to(newTitle, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.05 }, 0.32);
        tl.to(newBody, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.05 }, 0.34);
        tl.to(timeline, { scaleX: 1, opacity: 1, ease: 'power2.out', duration: 0.06 }, 0.33);
        tl.to(goldDivider, { opacity: 0, ease: 'power2.out', duration: 0.03 }, 0.36);

        /* HOLD (38%–48%) */

        /* PHASE 3 (48%–58%) */
        statItems.forEach((stat, i) => {
          tl.to(stat, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.05 }, 0.48 + i * 0.025);
        });

        /* HOLD (58%–100%) */
        tl.to({}, { duration: 0.42 }, 0.58);

      }, section);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  /* ── JSX ────────────────────────────────────────────────────── */
  return (
    <section
      ref={sectionRef}
      id="legacy-section"
      className="relative w-full h-screen overflow-hidden z-[55] bg-[#0B0B0C]"
    >
      {/* Subtle radial gold vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 40% 55%, rgba(201,162,74,0.06) 0%, transparent 65%)',
        }}
      />

      {/* ═══ LAYOUT WRAPPER ════════════════════════════════════ */}
      <div className="relative h-full flex flex-col lg:flex-row">

        {/* ─── LEFT: Image Area ───────────────────────────────── */}
        <div
          ref={imageContainerRef}
          className="relative w-full lg:w-[52%] h-[38vh] lg:h-full flex-shrink-0 overflow-hidden"
        >
          {/* Old 1991 image */}
          <div
            ref={oldImageRef}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={oldShopImage}
              alt="Original jewelry store, established 1991"
              className="w-full h-full object-cover object-left"
            />
            {/* Soft dark overlay on old image */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, transparent 60%, rgba(11,11,12,0.45) 100%)',
              }}
            />
          </div>

          {/* New showroom image (clip-path wipe reveal) */}
          <div
            ref={newImageRevealRef}
            className="absolute inset-0 w-full h-full"
            style={{ clipPath: 'inset(0 100% 0 0)' }}
          >
            <img
              src={newShowroomImage}
              alt="Modern premium jewelry showroom"
              className="w-full h-full object-cover object-left"
            />
            {/* Edge blend */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, transparent 60%, rgba(11,11,12,0.35) 100%)',
              }}
            />
          </div>

          {/* Gold divider line */}
          <div
            ref={goldDividerRef}
            className="absolute top-0 h-full w-[2px] z-10 pointer-events-none"
            style={{
              left: '0%',
              opacity: 0,
              background:
                'linear-gradient(to bottom, transparent 5%, #C9A24A 25%, #C9A24A 75%, transparent 95%)',
              boxShadow: '0 0 20px 4px rgba(201,162,74,0.3)',
            }}
          />
        </div>

        {/* ─── RIGHT: Text + Stats Area ───────────────────────── */}
        <div
          ref={textContainerRef}
          className="relative flex-1 flex flex-col justify-start lg:justify-center px-8 lg:px-[5vw] pt-8 pb-40 lg:py-0"
        >
          {/* Decorative corner accent (desktop only) */}
          <div className="hidden lg:block absolute top-[12%] left-0 w-[1px] h-[60px] bg-gradient-to-b from-transparent via-[#C9A24A] to-transparent opacity-40" />

          {/* ── Text Wrapper ── */}
          <div className="relative w-full">
            {/* ── Old Text Block (Phase 1) ──────────────────────── */}
            <div className="legacy-text-block">
              {/* Year */}
              <span
                ref={oldYearRef}
                className="block font-mono text-[#C9A24A] text-[11px] md:text-[13px] tracking-[0.3em] uppercase mb-3 lg:mb-4"
              >
                {t('legacy.phase1.year')}
              </span>

              {/* Title */}
              <h2
                ref={oldTitleRef}
                className="font-serif text-[#F5EFE7] text-[clamp(24px,4vw,52px)] leading-[1.05] tracking-[-0.01em] font-medium mb-4 lg:mb-5"
              >
                {t('legacy.phase1.title')}
              </h2>

              {/* Body */}
              <p
                ref={oldBodyRef}
                className="font-sans text-[#B8B0A8] text-[13px] md:text-[15px] leading-[1.7] lg:leading-[1.75] font-light max-w-[440px]"
              >
                {t('legacy.phase1.desc')}
              </p>
            </div>

            {/* ── Timeline Bar (animates during Phase 2) ─────────── */}
            <div
              ref={timelineRef}
              className="my-6 lg:my-8 flex items-center gap-3 max-w-[360px]"
              style={{ opacity: 0, transform: 'scaleX(0)', transformOrigin: 'left center' }}
            >
              <span className="font-mono text-[#C9A24A] text-[10px] md:text-[11px] tracking-[0.15em] uppercase flex-shrink-0">
                {t('legacy.timeline.start')}
              </span>
              <div className="relative flex-1 flex items-center h-[2px]">
                {/* Left dot */}
                <div className="absolute left-0 w-[8px] h-[8px] rounded-full bg-[#C9A24A] -translate-x-1/2 shadow-[0_0_8px_rgba(201,162,74,0.4)]" />
                {/* Connecting line */}
                <div
                  className="w-full h-[1px]"
                  style={{
                    background: 'linear-gradient(to right, #C9A24A 0%, rgba(201,162,74,0.3) 50%, #C9A24A 100%)',
                  }}
                />
                {/* Right dot */}
                <div className="absolute right-0 w-[8px] h-[8px] rounded-full bg-[#C9A24A] translate-x-1/2 shadow-[0_0_8px_rgba(201,162,74,0.4)]" />
              </div>
              <span className="font-mono text-[#C9A24A] text-[10px] md:text-[11px] tracking-[0.15em] uppercase flex-shrink-0">
                {t('legacy.timeline.end')}
              </span>
            </div>

            {/* ── New Text Block (Phase 2 — overlaid) ───────────── */}
            <div className="legacy-text-block absolute top-0 left-0 w-full h-full">
              {/* Year */}
              <span
                ref={newYearRef}
                className="block font-mono text-[#C9A24A] text-[11px] md:text-[13px] tracking-[0.3em] uppercase mb-3 lg:mb-4"
              >
                {t('legacy.phase2.year')}
              </span>

              {/* Title */}
              <h2
                ref={newTitleRef}
                className="font-serif text-[#F5EFE7] text-[clamp(24px,4vw,52px)] leading-[1.05] tracking-[-0.01em] font-medium mb-4 lg:mb-5"
              >
                {t('legacy.phase2.title')}
              </h2>

              {/* Body */}
              <p
                ref={newBodyRef}
                className="font-sans text-[#B8B0A8] text-[13px] md:text-[15px] leading-[1.7] lg:leading-[1.75] font-light max-w-[440px]"
              >
                {t('legacy.phase2.desc')}
              </p>
            </div>
          </div>

          {/* ── Stats (Phase 3) ───────────────────────────────── */}
          <div
            ref={statsContainerRef}
            className="absolute bottom-6 md:bottom-[6vh] lg:bottom-[10vh] inset-x-8 lg:inset-x-0 lg:px-[5vw]"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {stats.map(({ valueKey, labelKey }) => {
                const valueVal = t(valueKey);
                const labelVal = t(labelKey);
                return (
                  <div key={labelKey} className="legacy-stat flex flex-col text-center lg:text-left">
                    {/* Stat value wrapper for consistent height */}
                    <div className="h-[36px] md:h-[48px] lg:h-[56px] flex items-end justify-center lg:justify-start">
                      <span className={`block font-serif text-[#F5EFE7] leading-[1] font-medium ${valueVal.length > 5 ? 'text-lg md:text-xl lg:text-2xl tracking-tight mb-0.5' : 'text-2xl md:text-3xl lg:text-4xl'}`}>
                        {valueVal}
                      </span>
                    </div>
                    {/* Tiny gold rule */}
                    <span className="block w-6 h-[1px] bg-[#C9A24A] mx-auto lg:mx-0 mt-2 mb-2 opacity-60" />
                    {/* Stat label */}
                    <span className="block font-sans text-[#B8B0A8] text-[10px] md:text-xs tracking-[0.06em] md:tracking-[0.08em] uppercase font-light leading-tight">
                      {labelVal}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
