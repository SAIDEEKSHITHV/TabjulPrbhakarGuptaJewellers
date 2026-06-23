import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, BadgeCheck, Scale, HeartHandshake } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function TrustSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const cardsContainer = cardsContainerRef.current;

    if (!section || !header || !cardsContainer) return;

    const ctx = gsap.context(() => {
      // Header (title + subtitle) fade up
      gsap.fromTo(header,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Cards fade up on scroll with stagger
      const cards = cardsContainer.querySelectorAll('.trust-card');
      gsap.fromTo(cards,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardsContainer,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const cardsData = [
    {
      key: 'card1',
      icon: Award,
    },
    {
      key: 'card2',
      icon: BadgeCheck,
    },
    {
      key: 'card3',
      icon: Scale,
    },
    {
      key: 'card4',
      icon: HeartHandshake,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#2A0A10] py-[12vh] z-50 overflow-hidden"
      id="trust-section"
    >
      {/* Background accents for depth */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none rounded-full blur-[160px] opacity-[0.03]"
        style={{
          background: 'radial-gradient(circle, #C9A24A 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-[6vw] relative z-10">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-[8vh] max-w-3xl mx-auto">
          <h2 className="font-serif text-[#F5EFE7] text-[clamp(32px,4.5vw,52px)] leading-[1.1] tracking-[-0.01em] font-medium">
            {t('trust.title')}
          </h2>
          <p className="font-serif text-[#B8B0A8] italic font-light text-[clamp(15px,1.4vw,18px)] leading-[1.6] mt-4">
            {t('trust.subheading')}
          </p>
        </div>

        {/* Cards Grid */}
        <div
          ref={cardsContainerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {cardsData.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="trust-card group relative bg-[#1C060B] border border-[#C9A24A]/15 rounded-md p-8 flex flex-col items-center text-center transition-all duration-500 ease-out hover:-translate-y-2 hover:border-[#C9A24A]/40 hover:shadow-[0_10px_35px_rgba(201,162,74,0.08)]"
            >
              {/* Gold Accent Corner lines on Hover */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-transparent group-hover:border-[#C9A24A]/40 transition-colors duration-500 rounded-tl-sm" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-transparent group-hover:border-[#C9A24A]/40 transition-colors duration-500 rounded-tr-sm" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-transparent group-hover:border-[#C9A24A]/40 transition-colors duration-500 rounded-bl-sm" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-transparent group-hover:border-[#C9A24A]/40 transition-colors duration-500 rounded-br-sm" />

              {/* Icon Container with subtle ring */}
              <div className="w-16 h-16 rounded-full border border-[#C9A24A]/15 flex items-center justify-center mb-6 bg-[#25090F]/50 transition-all duration-500 group-hover:border-[#C9A24A]/40 group-hover:bg-[#C9A24A]/5">
                <Icon
                  size={28}
                  strokeWidth={1.25}
                  className="text-[#C9A24A] transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Card Title */}
              <h3 className="font-serif text-[#F5EFE7] text-xl md:text-[22px] tracking-tight font-medium mb-4 leading-snug">
                {t(`trust.${key}.title`)}
              </h3>

              {/* Divider Line */}
              <div className="w-16 h-px bg-[#C9A24A]/20 mb-4 transition-all duration-500 group-hover:w-24 group-hover:bg-[#C9A24A]/40" />

              {/* Description */}
              <p className="font-sans text-[#B8B0A8] text-[13px] md:text-[14px] leading-relaxed font-light">
                {t(`trust.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
