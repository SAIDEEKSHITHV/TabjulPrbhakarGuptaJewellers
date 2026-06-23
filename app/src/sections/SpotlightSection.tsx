import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function SpotlightSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    const portrait = portraitRef.current;
    const text = textRef.current;
    const rule = ruleRef.current;

    if (!section || !bg || !portrait || !text || !rule) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0%-30%)
      scrollTl.fromTo(portrait,
        { x: '60vw', scale: 1.06, opacity: 0 },
        { x: 0, scale: 1, opacity: 1, ease: 'power2.out' },
        0
      );

      scrollTl.fromTo(text,
        { x: '-18vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0.08
      );

      scrollTl.fromTo(rule,
        { scaleX: 0 },
        { scaleX: 1, ease: 'power2.out' },
        0.12
      );

      // SETTLE (30%-70%) - hold position

      // EXIT (70%-100%)
      scrollTl.fromTo(portrait,
        { x: 0, opacity: 1 },
        { x: '-18vw', opacity: 0, ease: 'power2.in' },
        0.70
      );

      scrollTl.fromTo(text,
        { x: 0, opacity: 1 },
        { x: '-10vw', opacity: 0, ease: 'power2.in' },
        0.70
      );

      // Fade out the entire background so no blank section remains
      scrollTl.fromTo(bg,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.75
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden z-[60]"
    >
      {/* Left Panel - Charcoal with golden vignette */}
      <div ref={bgRef} className="absolute inset-0 bg-[#0B0B0C]">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, rgba(201,162,74,0.08) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Right Portrait */}
      <div
        ref={portraitRef}
        className="absolute top-0 right-0 w-[55%] h-full"
      >
        <img
          src="/images/spotlight_sonakshi_portrait.jpg"
          alt="Sonakshi"
          className="w-full h-full object-cover"
        />
        {/* Gradient blend from left */}
        <div
          className="absolute top-0 left-0 w-[30%] h-full"
          style={{
            background: 'linear-gradient(to right, #0B0B0C, transparent)',
          }}
        />
      </div>

      {/* Left Text Block */}
      <div
        ref={textRef}
        className="absolute left-[8vw] top-[18vh] w-[34vw] max-w-[420px] z-10"
      >
        {/* Eyebrow */}
        <div className="flex items-center gap-4 mb-6">
          <div
            ref={ruleRef}
            className="w-12 h-px bg-[#C9A24A] origin-left"
          />
          <span className="font-mono text-[#C9A24A] text-[11px] md:text-[12px] uppercase tracking-[0.18em]">
            {t('spotlight.eyebrow')}
          </span>
        </div>

        {/* Headline */}
        <h2 className="font-serif text-[#F5EFE7] text-[clamp(48px,6vw,84px)] leading-[0.95] tracking-[-0.02em] font-medium">
          {t('spotlight.title')}
        </h2>

        {/* Body */}
        <p className="font-sans text-[#B8B0A8] text-[14px] md:text-[16px] mt-6 leading-[1.7] font-light">
          {t('spotlight.desc')}
        </p>

        {/* CTA */}
        <button className="group mt-8 flex items-center gap-3 text-[#F5EFE7] font-sans text-[13px] uppercase tracking-[0.15em] hover:text-[#C9A24A] transition-colors duration-300">
          {t('spotlight.cta')}
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </section>
  );
}
