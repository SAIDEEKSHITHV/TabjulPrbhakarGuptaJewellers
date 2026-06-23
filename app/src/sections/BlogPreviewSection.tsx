import { useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { blogArticles } from '../data/blogData';

gsap.registerPlugin(ScrollTrigger);

export default function BlogPreviewSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = cardsRef.current;

    if (!section || !heading || !cards) return;

    const ctx = gsap.context(() => {
      // Heading fade-in
      gsap.fromTo(
        heading,
        { y: '5vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            end: 'top 60%',
            scrub: 0.4,
          },
        }
      );

      // Cards staggered fade-in
      const cardElements = cards.querySelectorAll('.blog-card');
      gsap.fromTo(
        cardElements,
        { y: '8vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cards,
            start: 'top 85%',
            end: 'top 45%',
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
      id="blog-preview"
      className="relative w-full bg-[#0B0B0C] py-[10vh] md:py-[14vh] z-[60]"
    >
      {/* Subtle golden radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(201,162,74,0.05) 0%, transparent 55%)',
        }}
      />

      {/* Section Heading */}
      <div ref={headingRef} className="relative text-center px-6 mb-[6vh] md:mb-[8vh]">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="w-10 h-px bg-[#C9A24A]" />
          <span className="font-mono text-[#C9A24A] text-[11px] md:text-[12px] uppercase tracking-[0.18em]">
            {t('blogPreview.eyebrow')}
          </span>
          <div className="w-10 h-px bg-[#C9A24A]" />
        </div>

        <h2 className="font-serif text-[#F5EFE7] text-[clamp(32px,5vw,56px)] leading-[1.05] tracking-[-0.01em] font-medium">
          {t('blogPreview.title')}
        </h2>
        <p className="font-sans text-[#B8B0A8] text-[14px] md:text-[16px] mt-4 max-w-[540px] mx-auto font-light leading-relaxed">
          {t('blogPreview.desc')}
        </p>
      </div>

      {/* Blog Cards Grid */}
      <div
        ref={cardsRef}
        className="relative px-[4vw] md:px-[6vw] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 max-w-[1280px] mx-auto"
      >
        {blogArticles.map((article) => (
          <Link
            to={`/blog/${article.shortSlug || article.slug}`}
            key={article.slug}
            className="blog-card group block rounded-lg overflow-hidden bg-[#131315] border border-[rgba(201,162,74,0.1)] hover:border-[rgba(201,162,74,0.3)] transition-all duration-500"
          >
            {/* Image container with zoom effect */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={article.featuredImage}
                alt={t(`blogData.articles.${article.slug}.title`)}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                loading="lazy"
              />
              {/* Gradient overlay on image */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to top, rgba(19,19,21,0.7) 0%, transparent 50%)',
                }}
              />
              {/* Category badge */}
              <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[#C9A24A] bg-[rgba(11,11,12,0.75)] backdrop-blur-sm px-3 py-1 rounded-full border border-[rgba(201,162,74,0.2)]">
                {t(`blogData.categories.${article.category}`)}
              </span>
            </div>

            {/* Card Content */}
            <div className="p-5 md:p-6">
              <h3 className="font-serif text-[#F5EFE7] text-[18px] md:text-[20px] leading-[1.25] font-medium line-clamp-2 group-hover:text-[#C9A24A] transition-colors duration-300">
                {t(`blogData.articles.${article.slug}.title`)}
              </h3>

              <p className="font-sans text-[#B8B0A8] text-[13px] md:text-[14px] mt-3 leading-[1.65] font-light line-clamp-3">
                {t(`blogData.articles.${article.slug}.excerpt`)}
              </p>

              {/* Read Full Story CTA */}
              <div className="mt-5 flex items-center gap-2 text-[#C9A24A] text-[12px] md:text-[13px] uppercase tracking-[0.12em] font-sans font-medium">
                <span className="group-hover:tracking-[0.18em] transition-all duration-300">
                  {t('blogPreview.cta')}
                </span>
                <ArrowRight
                  size={13}
                  className="group-hover:translate-x-1.5 transition-transform duration-300"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Blog Link */}
      <div className="text-center mt-[6vh] md:mt-[8vh]">
        <Link
          to="/blog"
          className="inline-flex items-center gap-3 font-sans text-[#F5EFE7] text-[13px] uppercase tracking-[0.15em] hover:text-[#C9A24A] transition-colors duration-300 border border-[rgba(245,239,231,0.15)] hover:border-[rgba(201,162,74,0.4)] px-8 py-3.5 rounded-full"
        >
          {t('blogPreview.viewAll')}
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
