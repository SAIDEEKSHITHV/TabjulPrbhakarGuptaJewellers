import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getGoldRates } from '../lib/goldRates';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const { t } = useTranslation();
  const [rates, setRates] = useState<{ today_22k: number; today_24k: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    getGoldRates()
      .then((res) => {
        if (!isMounted) return;
        const oneGram = res.data.items.find(item => item.gram === '1');
        if (oneGram) {
          setRates({
            today_22k: oneGram.today_22k,
            today_24k: oneGram.today_24k
          });
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error in homepage gold rate widget:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  const formatRate = (val?: number) => {
    if (val === undefined || val === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const content = contentRef.current;
    const heading = headingRef.current;
    const subtitle = subtitleRef.current;
    const caption = captionRef.current;
    const cta = ctaRef.current;
    const widget = widgetRef.current;
    const overlay = overlayRef.current;

    if (!section || !image || !content || !heading || !subtitle || !caption || !cta || !widget || !overlay) return;

    const ctx = gsap.context(() => {
      // Initial states (hidden)
      gsap.set(image, { scale: 1.15, opacity: 0 });
      gsap.set(overlay, { opacity: 0 });
      gsap.set(heading, { y: '6vh', opacity: 0 });
      gsap.set(subtitle, { y: '4vh', opacity: 0 });
      gsap.set(caption, { y: '4vh', opacity: 0 });
      gsap.set(cta, { y: '4vh', opacity: 0 });
      gsap.set(widget, { y: '4vh', opacity: 0 });

      // Entrance animation timeline (auto-play on load)
      const entranceTl = gsap.timeline({ delay: 0.2 });

      // Image zooms in and fades up
      entranceTl.to(image, {
        scale: 1,
        opacity: 1,
        duration: 1.4,
        ease: 'power2.out',
      });

      // Overlay fades in with the image
      entranceTl.to(overlay, {
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out',
      }, '-=1.2');

      // Heading slides up
      entranceTl.to(heading, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.8');

      // Subtitle slides up
      entranceTl.to(subtitle, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
      }, '-=0.5');

      // Caption slides up
      entranceTl.to(caption, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      }, '-=0.4');

      // CTA slides up
      entranceTl.to(cta, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      }, '-=0.3');

      // Widget slides up
      entranceTl.to(widget, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      }, '-=0.3');

      // Scroll-driven EXIT animation (70%-100%)
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            // Reset to visible when scrolling back to top
            gsap.to(image, { scale: 1, opacity: 1, duration: 0.3 });
            gsap.to(overlay, { opacity: 1, duration: 0.3 });
            gsap.to(heading, { y: 0, opacity: 1, duration: 0.3 });
            gsap.to(subtitle, { y: 0, opacity: 1, duration: 0.3 });
            gsap.to(caption, { y: 0, opacity: 1, duration: 0.3 });
            gsap.to(cta, { y: 0, opacity: 1, duration: 0.3 });
            gsap.to(widget, { y: 0, opacity: 1, duration: 0.3 });
          },
        },
      });

      // SETTLE phase (0%-70%): hold position
      // EXIT phase (70%-100%)

      // Image scales up slightly and fades
      scrollTl.fromTo(image,
        { scale: 1, opacity: 1 },
        { scale: 1.08, opacity: 0, ease: 'power2.in' },
        0.70
      );

      // Overlay fades
      scrollTl.fromTo(overlay,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.70
      );

      // Heading slides up and fades
      scrollTl.fromTo(heading,
        { y: 0, opacity: 1 },
        { y: '-12vh', opacity: 0, ease: 'power2.in' },
        0.70
      );

      // Subtitle slides up and fades
      scrollTl.fromTo(subtitle,
        { y: 0, opacity: 1 },
        { y: '-8vh', opacity: 0, ease: 'power2.in' },
        0.72
      );

      // Caption, CTA and Widget slide down and fade
      scrollTl.fromTo([caption, cta, widget],
        { y: 0, opacity: 1 },
        { y: '10vh', opacity: 0, ease: 'power2.in' },
        0.74
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden z-10"
    >
      {/* Full-cover background image */}
      <div
        ref={imageRef}
        className="absolute inset-0 w-full h-full z-[1]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.30), rgba(0, 0, 0, 0.30)), url(/images/hero_necklace_bridal.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Dark gradient overlay for text readability */}
      <div
        ref={overlayRef}
        className="absolute inset-0 w-full h-full z-[2]"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(10, 5, 8, 0.55) 0%,
              rgba(10, 5, 8, 0.25) 35%,
              rgba(10, 5, 8, 0.15) 50%,
              rgba(10, 5, 8, 0.30) 70%,
              rgba(10, 5, 8, 0.65) 100%
            )
          `,
        }}
      />

      {/* Subtle gold vignette */}
      <div
        className="absolute inset-0 w-full h-full z-[3] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(201,162,74,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Centered text content */}
      <div
        ref={contentRef}
        className="absolute inset-0 z-[5] flex flex-col items-center justify-center text-center px-6"
      >
        {/* Brand subtitle */}
        <p
          ref={subtitleRef}
          className="font-mono text-[#D4AF37] text-[10px] md:text-[12px] tracking-[0.35em] uppercase mb-6 font-medium"
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.65)' }}
        >
          {t('hero.eyebrow')}
        </p>

        {/* Main heading */}
        <h2
          ref={headingRef}
          className="font-serif text-[#F5EFE7] text-[clamp(32px,5.5vw,80px)] leading-[0.95] tracking-[-0.02em] font-medium max-w-[800px]"
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.65)' }}
        >
          {t('hero.headline')}
        </h2>

        {/* Caption */}
        <p
          ref={captionRef}
          className="font-sans text-[#FFF8F0] text-[14px] md:text-[16px] mt-6 leading-[1.6] font-light max-w-[480px]"
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.65)' }}
        >
          {t('hero.caption')}
        </p>

        {/* CTA */}
        <div ref={ctaRef} className="mt-10">
          <button className="group relative font-sans text-[#FFFFFF] text-[14px] md:text-[16px] font-medium tracking-wide px-8 py-3 border border-[#D4AF37] rounded-none hover:bg-[#D4AF37] hover:text-[#111111] transition-all duration-400">
            {t('hero.cta')}
            <span className="absolute left-0 bottom-0 w-full h-[1px] bg-[#D4AF37] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-center" />
          </button>
        </div>

        {/* Live Gold Rate Widget */}
        <div 
          ref={widgetRef}
          className="mt-8 mx-auto w-full max-w-[280px] sm:max-w-[300px] backdrop-blur-md bg-black/35 border border-[rgba(201,162,74,0.2)] px-5 py-3 flex flex-col items-center justify-center text-center transition-all duration-500 hover:border-[rgba(201,162,74,0.4)]"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
        >
          <span className="font-mono text-[#D4AF37] text-[10px] uppercase tracking-[0.15em] mb-1.5 font-medium">
            {t('goldRatePage.widgetTitle')}
          </span>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-1">
              <div className="w-3 h-3 border border-[rgba(212,175,55,0.3)] border-t-[#D4AF37] rounded-full animate-spin" />
              <span className="font-sans text-[10px] text-[#B8B0A8] tracking-wider uppercase">Loading...</span>
            </div>
          ) : error ? (
            <div className="text-[10px] text-[#B8B0A8] py-1 font-sans">
              {t('goldRatePage.widgetUnavailable')}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-5 py-0.5">
              <div className="flex flex-col">
                <span className="font-mono text-[#FFF8F0]/40 text-[9px] uppercase tracking-wider">22K</span>
                <span className="font-sans text-[#FFF8F0] text-[13px] sm:text-[14px] font-semibold mt-0.5">{formatRate(rates?.today_22k)}</span>
              </div>
              <div className="w-px h-6 bg-[rgba(201,162,74,0.15)]" />
              <div className="flex flex-col">
                <span className="font-mono text-[#FFF8F0]/40 text-[9px] uppercase tracking-wider">24K</span>
                <span className="font-sans text-[#FFF8F0] text-[13px] sm:text-[14px] font-semibold mt-0.5">{formatRate(rates?.today_24k)}</span>
              </div>
            </div>
          )}
          <span className="font-sans text-[#B8B0A8]/50 text-[9px] mt-1.5 tracking-wide font-light">
            ✦ {t('goldRatePage.widgetLive')}
          </span>
        </div>
      </div>
    </section>
  );
}
