import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function LocalSeoSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        content.children,
        { y: '4vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: content,
            start: 'top 85%',
            end: 'top 55%',
            scrub: 0.4,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="local-seo"
      className="relative w-full bg-[#0B0B0C] py-[8vh] md:py-[10vh] overflow-hidden z-[77]"
    >
      {/* Subtle top gold line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 15%, rgba(201,162,74,0.15) 50%, transparent 85%)',
        }}
      />

      <div
        ref={contentRef}
        className="relative max-w-[820px] mx-auto px-[6vw] lg:px-[4vw] text-center"
      >
        {/* Gold accent line */}
        <div className="w-12 h-px bg-[#C9A24A] mx-auto mb-6 opacity-60" />

        {/* Heading */}
        <h2 className="font-serif text-[#F5EFE7] text-[clamp(24px,3.5vw,40px)] leading-[1.15] tracking-[-0.01em] font-medium mb-6">
          {t('localSeo.title')}
        </h2>

        {/* SEO Body Content */}
        <p className="font-sans text-[#B8B0A8] text-[14px] md:text-[15px] leading-[1.85] font-light">
          {t('localSeo.body')}
        </p>
      </div>
    </section>
  );
}
