import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function HouseFavouritesSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const overlay = overlayRef.current;
    const label = labelRef.current;
    const headline = headlineRef.current;
    const subhead = subheadRef.current;
    const desc = descRef.current;
    const divider = dividerRef.current;
    const cta = ctaRef.current;

    if (!section || !image || !overlay || !label || !headline || !subhead || !desc || !divider || !cta) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=140%',
          pin: true,
          scrub: 0.6,
        },
      });

      /* ── ENTRANCE (0 → 0.35) ────────────────────────── */

      // Image: slow parallax zoom-in
      scrollTl.fromTo(image,
        { scale: 1.18, y: '8vh' },
        { scale: 1.0, y: 0, ease: 'none' },
        0
      );

      // Overlay darkens slightly as content appears
      scrollTl.fromTo(overlay,
        { opacity: 0.35 },
        { opacity: 0.58, ease: 'power1.in' },
        0
      );

      // Label slides in first
      scrollTl.fromTo(label,
        { y: '6vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'power2.out' },
        0.05
      );

      // Headline fades upward
      scrollTl.fromTo(headline,
        { y: '18vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'power2.out' },
        0.08
      );

      // Subheading staggers in
      scrollTl.fromTo(subhead,
        { y: '12vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'power2.out' },
        0.14
      );

      // Divider reveals
      scrollTl.fromTo(divider,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, ease: 'power2.out' },
        0.18
      );

      // Description appears
      scrollTl.fromTo(desc,
        { y: '8vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'power2.out' },
        0.20
      );

      // CTA reveals last
      scrollTl.fromTo(cta,
        { y: '6vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'power2.out' },
        0.26
      );

      /* ── SETTLE (0.35 → 0.65) — hold ───────────────── */

      /* ── EXIT (0.65 → 1.0) ─────────────────────────── */

      // Content slides and fades out
      scrollTl.fromTo(label,
        { y: 0, opacity: 1 },
        { y: '-8vh', opacity: 0, ease: 'power2.in' },
        0.68
      );

      scrollTl.fromTo(headline,
        { y: 0, opacity: 1 },
        { y: '-14vh', opacity: 0, ease: 'power2.in' },
        0.70
      );

      scrollTl.fromTo([subhead, divider],
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.72
      );

      scrollTl.fromTo([desc, cta],
        { y: 0, opacity: 1 },
        { y: '10vh', opacity: 0, ease: 'power2.in' },
        0.72
      );

      // Image continues parallax drift
      scrollTl.fromTo(image,
        { scale: 1.0, y: 0 },
        { scale: 1.08, y: '-8vh', ease: 'power2.in' },
        0.70
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden z-40"
      id="bridal-showcase"
    >
      {/* ── Background Image with Parallax ─────────────── */}
      <div
        ref={imageRef}
        className="absolute inset-[-10%] w-[120%] h-[120%]"
      >
        <img
          src="/images/bridal_showcase_bg.png"
          alt="Bridal Jewellery Collection"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* ── Luxury Overlay ─────────────────────────────── */}
      <div
        ref={overlayRef}
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              to right,
              rgba(11, 11, 12, 0.82) 0%,
              rgba(11, 11, 12, 0.60) 40%,
              rgba(11, 11, 12, 0.30) 70%,
              rgba(11, 11, 12, 0.15) 100%
            ),
            linear-gradient(
              to top,
              rgba(11, 11, 12, 0.70) 0%,
              transparent 45%
            )
          `,
        }}
      />

      {/* ── Subtle vignette ────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 160px 40px rgba(11,11,12,0.45)',
        }}
      />

      {/* ── Content ────────────────────────────────────── */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="w-full max-w-[600px] ml-[8vw] md:ml-[10vw] lg:ml-[12vw] px-6">

          {/* Category Label */}
          <p
            ref={labelRef}
            className="font-mono text-[11px] md:text-[12px] uppercase tracking-[0.25em] mb-6"
            style={{ color: '#C9A24A' }}
          >
            {t('favourites.eyebrow')}
          </p>

          {/* Heading */}
          <h2
            ref={headlineRef}
            className="font-serif text-[#F5EFE7] text-[clamp(36px,5.5vw,80px)] leading-[1.0] tracking-[-0.02em] font-medium"
          >
            {t('favourites.headlineMain')}
            <br />
            <span className="italic font-light" style={{ color: '#C9A24A' }}>
              {t('favourites.headlineSub')}
            </span>
          </h2>

          {/* Subheading */}
          <p
            ref={subheadRef}
            className="font-serif text-[#D4CBC3] text-[clamp(16px,1.6vw,22px)] mt-6 leading-[1.55] font-light italic"
          >
            {t('favourites.subhead')}
          </p>

          {/* Divider */}
          <div
            ref={dividerRef}
            className="w-16 h-px mt-8 mb-8 origin-left"
            style={{ backgroundColor: 'rgba(201, 162, 74, 0.5)' }}
          />

          {/* Description */}
          <p
            ref={descRef}
            className="font-sans text-[#B8B0A8] text-[clamp(13px,1.1vw,16px)] leading-[1.75] max-w-[480px]"
          >
            {t('favourites.desc')}
          </p>

          {/* CTA */}
          <button
            ref={ctaRef}
            className="group mt-10 flex items-center gap-4 relative overflow-hidden"
          >
            {/* Button background pill */}
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, rgba(201,162,74,0.15) 0%, rgba(201,162,74,0.05) 100%)',
                border: '1px solid rgba(201,162,74,0.2)',
              }}
            />
            <span
              className="relative z-10 font-sans text-[12px] md:text-[13px] uppercase tracking-[0.18em] pl-6 py-3 transition-colors duration-300"
              style={{ color: '#C9A24A' }}
            >
              {t('favourites.cta')}
            </span>
            <span className="relative z-10 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 group-hover:bg-[rgba(201,162,74,0.12)] mr-1"
              style={{ borderColor: 'rgba(201,162,74,0.35)' }}
            >
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
                style={{ color: '#C9A24A' }}
              />
            </span>
          </button>

        </div>
      </div>

      {/* ── Bottom accent line ─────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(to right, rgba(201,162,74,0.3) 0%, transparent 60%)',
        }}
      />
    </section>
  );
}
