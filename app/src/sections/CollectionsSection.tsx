import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const collections = [
  { nameKey: 'collections.bridal', image: '/images/collections_bridal.jpg' },
  { nameKey: 'collections.diamond', image: '/images/collections_diamond.jpg' },
  { nameKey: 'collections.gold', image: '/images/collections_gold.jpg' },
  { nameKey: 'collections.temple', image: '/images/collections_temple.jpg' },
];

export default function CollectionsSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
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
  }, []);

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

      {/* 2x2 Grid */}
      <div
        ref={cardsRef}
        className="px-[6vw] grid grid-cols-1 md:grid-cols-2 gap-[3vw]"
      >
        {collections.map((collection) => (
          <div
            key={collection.nameKey}
            className="collection-card group relative overflow-hidden cursor-pointer"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={collection.image}
                alt={t(collection.nameKey)}
                className="w-full h-full object-cover transition-all duration-700 ease-out brightness-[0.88] group-hover:brightness-[1.02] group-hover:scale-[1.05]"
              />
              {/* Inset gold border frame on hover */}
              <div className="absolute inset-3 border border-[rgba(201,162,74,0)] group-hover:border-[rgba(201,162,74,0.35)] transition-all duration-500 pointer-events-none z-10" />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-[#0B0B0C] opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500" />
            </div>
            {/* Label */}
            <div className="mt-4 flex items-center justify-between">
              <h3 className="font-serif text-[#F5EFE7] text-[clamp(18px,2vw,24px)] tracking-wide">
                {t(collection.nameKey)}
              </h3>
              <ArrowRight
                size={18}
                className="text-[#C9A24A] opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300"
              />
            </div>
            <div className="w-0 group-hover:w-12 h-px bg-[#C9A24A] mt-2 transition-all duration-500" />
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-[6vh]">
        <button className="group flex items-center gap-3 px-8 py-3.5 border border-[rgba(245,239,231,0.2)] text-[#F5EFE7] font-sans text-[13px] uppercase tracking-[0.15em] hover:border-[#C9A24A] hover:text-[#C9A24A] transition-all duration-300">
          {t('collections.cta')}
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </section>
  );
}
