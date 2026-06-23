import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Instagram, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const images = [
  '/images/instagram_01.jpg',
  '/images/instagram_02.jpg',
  '/images/instagram_03.jpg',
];

export default function InstagramSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const imagesContainer = imagesRef.current;

    if (!section || !title || !imagesContainer) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(title,
        { y: '4vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 85%',
            end: 'top 60%',
            scrub: 0.4,
          },
        }
      );

      // Images animation with stagger
      const imageElements = imagesContainer.querySelectorAll('.insta-card');
      imageElements.forEach((img, i) => {
        gsap.fromTo(img,
          { y: '14vh', opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: img,
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
      className="relative w-full bg-[#2A0A10] py-[10vh] z-[70]"
    >
      {/* Title */}
      <div ref={titleRef} className="text-center mb-[6vh]">
        <h2 className="font-serif text-[#F5EFE7] text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-[-0.01em] font-medium">
          {t('instagram.title')}
        </h2>
        <p className="font-mono text-[#B8B0A8] text-[12px] md:text-[13px] mt-3 tracking-[0.12em]">
          @raviprakashtabjul
        </p>
      </div>

      {/* 3-column images */}
      <div
        ref={imagesRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 px-[3vw]"
      >
        {images.map((img, i) => (
          <a
            key={i}
            href="https://www.instagram.com/raviprakashtabjul?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            className="insta-card group relative aspect-[4/3] overflow-hidden cursor-pointer border border-transparent hover:border-[rgba(201,162,74,0.35)] transition-all duration-500 block"
          >
            <img
              src={img}
              alt={`Instagram moment ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
            {/* Hover overlay with Instagram icon */}
            <div className="absolute inset-0 bg-[#0B0B0C]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
              <Instagram size={28} className="text-[#F5EFE7]" />
            </div>
          </a>
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-[6vh]">
        <a
          href="https://www.instagram.com/raviprakashtabjul?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 px-8 py-3.5 border border-[rgba(245,239,231,0.2)] text-[#F5EFE7] font-sans text-[13px] uppercase tracking-[0.15em] hover:border-[#C9A24A] hover:text-[#C9A24A] transition-all duration-300"
        >
          <Instagram size={16} />
          {t('instagram.cta')}
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
        </a>
      </div>
    </section>
  );
}
