import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function MarqueeSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const band = bandRef.current;
    const marquee = marqueeRef.current;
    const statement = statementRef.current;
    const columns = columnsRef.current;

    if (!section || !band || !marquee || !statement || !columns) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0%-30%)
      // Band slides up from bottom
      scrollTl.fromTo(band,
        { y: '100vh' },
        { y: 0, ease: 'none' },
        0
      );

      // Statement fades in
      scrollTl.fromTo(statement,
        { y: '12vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'power2.out' },
        0.08
      );

      // Columns fade in with stagger
      scrollTl.fromTo(columns.children,
        { y: '6vh', opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.03, ease: 'power2.out' },
        0.16
      );

      // SETTLE phase: fade out the scrolling marquee text (it clashes with the fixed nav bar)
      scrollTl.fromTo(marquee,
        { opacity: 1, y: 0 },
        { opacity: 0, y: '-20px', ease: 'power2.in' },
        0.25
      );

      // EXIT (70%-100%)
      scrollTl.fromTo(statement,
        { y: 0, opacity: 1 },
        { y: '-10vh', opacity: 0, ease: 'power2.in' },
        0.70
      );

      scrollTl.fromTo(columns.children,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.70
      );

      scrollTl.fromTo(band,
        { y: 0 },
        { y: '-40vh', ease: 'power2.in' },
        0.80
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden z-20"
    >
      <div
        ref={bandRef}
        className="absolute inset-0 bg-[#0B0B0C] flex flex-col items-center justify-center"
      >
        {/* Marquee text at top */}
        <div ref={marqueeRef} className="absolute top-0 left-0 right-0 py-4 overflow-hidden border-b border-[rgba(245,239,231,0.08)]">
          <div className="flex whitespace-nowrap animate-marquee">
            <span className="font-mono text-[11px] md:text-[12px] text-[#B8B0A8] uppercase tracking-[0.18em] mx-4">
              {t('marquee.scrollText')}
            </span>
            <span className="font-mono text-[11px] md:text-[12px] text-[#B8B0A8] uppercase tracking-[0.18em] mx-4">
              {t('marquee.scrollText')}
            </span>
            <span className="font-mono text-[11px] md:text-[12px] text-[#B8B0A8] uppercase tracking-[0.18em] mx-4">
              {t('marquee.scrollText')}
            </span>
          </div>
        </div>

        {/* Center Statement */}
        <div ref={statementRef} className="text-center px-6 max-w-3xl">
          <h2 className="font-serif text-[#F5EFE7] text-[clamp(24px,3.5vw,44px)] leading-[1.15] tracking-[-0.01em] font-medium">
            {t('marquee.headline')}
          </h2>
          <p className="font-serif text-[#B8B0A8] text-[clamp(14px,1.4vw,20px)] mt-5 leading-[1.6] max-w-xl mx-auto">
            {t('marquee.caption')}
          </p>
        </div>

        {/* Three Pillars */}
        <div
          ref={columnsRef}
          className="absolute bottom-[14vh] left-[8vw] right-[8vw] flex justify-between gap-6 md:gap-12"
        >
          <div className="text-center flex-1">
            <div className="w-8 h-px bg-[rgba(201,162,74,0.45)] mx-auto mb-4" />
            <p className="font-sans text-[#F5EFE7] text-[12px] md:text-[13px] uppercase tracking-[0.18em] font-medium">
              {t('marquee.pillar1.title')}
            </p>
            <p className="font-sans text-[#B8B0A8] text-[11px] md:text-[12px] mt-2 leading-[1.5] tracking-wide">
              {t('marquee.pillar1.desc')}
            </p>
          </div>
          <div className="text-center flex-1">
            <div className="w-8 h-px bg-[rgba(201,162,74,0.45)] mx-auto mb-4" />
            <p className="font-sans text-[#F5EFE7] text-[12px] md:text-[13px] uppercase tracking-[0.18em] font-medium">
              {t('marquee.pillar2.title')}
            </p>
            <p className="font-sans text-[#B8B0A8] text-[11px] md:text-[12px] mt-2 leading-[1.5] tracking-wide">
              {t('marquee.pillar2.desc')}
            </p>
          </div>
          <div className="text-center flex-1">
            <div className="w-8 h-px bg-[rgba(201,162,74,0.45)] mx-auto mb-4" />
            <p className="font-sans text-[#F5EFE7] text-[12px] md:text-[13px] uppercase tracking-[0.18em] font-medium">
              {t('marquee.pillar3.title')}
            </p>
            <p className="font-sans text-[#B8B0A8] text-[11px] md:text-[12px] mt-2 leading-[1.5] tracking-wide">
              {t('marquee.pillar3.desc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
