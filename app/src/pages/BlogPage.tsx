import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { blogArticles } from '../data/blogData';

export default function BlogPage() {
  const { t, i18n } = useTranslation();
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // SEO meta
    document.title = `${t('blogPage.title')} | ${t('nav.brandName')}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        t('blogPage.metaDesc') || 'Expert advice, buying guides, jewellery trends, and care tips from Tabjul Prabhakar Gupta Jewellers.'
      );
    }

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    let canonicalUrl = window.location.origin + window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang');
    if (lang === 'te' || lang === 'en') {
      canonicalUrl += `?lang=${lang}`;
    }
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonicalUrl);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonicalUrl);
      document.head.appendChild(canonicalLink);
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }, [t]);

  // Entrance animation
  useEffect(() => {
    const header = headerRef.current;
    const grid = gridRef.current;
    if (!header || !grid) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        header,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.1 }
      );

      const cards = grid.querySelectorAll('.blog-card');
      gsap.fromTo(
        cards,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.7,
          ease: 'power2.out',
          delay: 0.3,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Header */}
      <div
        ref={headerRef}
        className="pt-[14vh] md:pt-[16vh] pb-[6vh] md:pb-[8vh] px-6 text-center"
        style={{ opacity: 0 }}
      >
        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#B8B0A8] text-[12px] md:text-[13px] uppercase tracking-[0.15em] font-sans hover:text-[#C9A24A] transition-colors duration-300 mb-8"
        >
          <ArrowLeft size={14} />
          {t('blogPage.back')}
        </Link>

        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="w-10 h-px bg-[#C9A24A]" />
          <span className="font-mono text-[#C9A24A] text-[11px] md:text-[12px] uppercase tracking-[0.18em]">
            {t('blogPage.eyebrow')}
          </span>
          <div className="w-10 h-px bg-[#C9A24A]" />
        </div>

        <h1 className="font-serif text-[#F5EFE7] text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.01em] font-medium">
          {t('blogPage.title')}
        </h1>
        <p className="font-sans text-[#B8B0A8] text-[14px] md:text-[16px] mt-4 max-w-[540px] mx-auto font-light leading-relaxed">
          {t('blogPage.desc')}
        </p>
      </div>

      {/* Subtle gradient divider */}
      <div className="mx-auto max-w-[200px] h-px bg-gradient-to-r from-transparent via-[rgba(201,162,74,0.35)] to-transparent mb-[6vh]" />

      {/* Blog Grid */}
      <div
        ref={gridRef}
        className="px-[4vw] md:px-[8vw] lg:px-[10vw] grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-[960px] mx-auto pb-[14vh]"
      >
        {blogArticles.map((article) => {
          const title = t(`blogData.articles.${article.slug}.title`);
          const excerpt = t(`blogData.articles.${article.slug}.excerpt`);
          const category = t(`blogData.categories.${article.category}`);
          const readTime = article.readTime.replace(' min read', ` ${t('blogPage.readTime')}`);

          return (
            <Link
              to={`/blog/${article.shortSlug || article.slug}`}
              key={article.slug}
              className="blog-card group block rounded-lg overflow-hidden bg-[#131315] border border-[rgba(201,162,74,0.1)] hover:border-[rgba(201,162,74,0.3)] transition-all duration-500"
              style={{ opacity: 0 }}
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={article.featuredImage}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(19,19,21,0.7) 0%, transparent 50%)',
                  }}
                />
                {/* Category + Date */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#C9A24A] bg-[rgba(11,11,12,0.75)] backdrop-blur-sm px-3 py-1 rounded-full border border-[rgba(201,162,74,0.2)]">
                    {category}
                  </span>
                </div>
                <span className="absolute bottom-3 right-3 font-mono text-[10px] text-[#B8B0A8] bg-[rgba(11,11,12,0.6)] backdrop-blur-sm px-3 py-1 rounded-full">
                  {readTime}
                </span>
              </div>

              {/* Content */}
              <div className="p-6 md:p-7">
                <time className="font-mono text-[11px] text-[#B8B0A8] tracking-wider">
                  {new Date(article.publishDate).toLocaleDateString(i18n.language === 'te' ? 'te-IN' : 'en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>

                <h2 className="font-serif text-[#F5EFE7] text-[20px] md:text-[24px] leading-[1.2] font-medium mt-3 group-hover:text-[#C9A24A] transition-colors duration-300">
                  {title}
                </h2>

                <p className="font-sans text-[#B8B0A8] text-[14px] mt-3 leading-[1.7] font-light line-clamp-3">
                  {excerpt}
                </p>

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
          );
        })}
      </div>
    </div>
  );
}
