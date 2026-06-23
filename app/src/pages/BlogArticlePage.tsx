import { useEffect, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react';
import { getArticleBySlug, getRelatedArticles } from '../data/blogData';

export default function BlogArticlePage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement>(null);

  // SEO + scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!article) return;

    const title = t(`blogData.articles.${article.slug}.title`);
    const metaDescription = t(`blogData.articles.${article.slug}.metaDescription`);

    // Title
    document.title = `${title} | ${t('nav.brandName')}`;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', metaDescription);
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      metaDesc.setAttribute('content', metaDescription);
      document.head.appendChild(metaDesc);
    }

    // Open Graph tags
    const ogTags: Record<string, string> = {
      'og:title': title,
      'og:description': metaDescription,
      'og:image': `${window.location.origin}${article.featuredImage}`,
      'og:type': 'article',
      'og:url': window.location.href,
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    });

    // JSON-LD structured data
    const existingSchema = document.querySelector(
      'script[data-blog-schema]'
    );
    if (existingSchema) existingSchema.remove();

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: metaDescription,
      image: `${window.location.origin}${article.featuredImage}`,
      datePublished: article.publishDate,
      author: {
        '@type': 'Organization',
        name: t('blogArticlePage.author'),
      },
      publisher: {
        '@type': 'Organization',
        name: t('blogArticlePage.author'),
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/images/hero_necklace_bridal.jpg`,
        },
      },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-blog-schema', 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      // Clean up schema on unmount
      const schemaTag = document.querySelector('script[data-blog-schema]');
      if (schemaTag) schemaTag.remove();
    };
  }, [article, t]);

  // Entrance animations
  useEffect(() => {
    const hero = heroRef.current;
    const content = contentRef.current;
    const related = relatedRef.current;

    if (!hero || !content) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        hero,
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'power2.out', delay: 0.1 }
      );

      gsap.fromTo(
        content,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.4 }
      );

      if (related) {
        gsap.fromTo(
          related,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', delay: 0.7 }
        );
      }
    });

    return () => ctx.revert();
  }, [slug]);

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  const title = t(`blogData.articles.${article.slug}.title`);
  const excerpt = t(`blogData.articles.${article.slug}.excerpt`);
  const category = t(`blogData.categories.${article.category}`);
  const readTime = article.readTime.replace(' min read', ` ${t('blogArticlePage.readTime')}`);
  const localizedBody = t(`blogData.articles.${article.slug}.body`, { returnObjects: true }) as string[];
  const bodyParagraphs = Array.isArray(localizedBody) ? localizedBody : article.body;

  const relatedArticles = getRelatedArticles(article.relatedSlugs);

  // Render body paragraphs, handling ## headings
  const renderBody = (paragraphs: string[]) => {
    return paragraphs.map((text, i) => {
      if (text.startsWith('## ')) {
        return (
          <h2
            key={i}
            className="font-serif text-[#F5EFE7] text-[22px] md:text-[26px] leading-[1.2] font-medium mt-10 mb-4"
          >
            {text.replace('## ', '')}
          </h2>
        );
      }
      return (
        <p
          key={i}
          className="font-sans text-[#C8C0B8] text-[15px] md:text-[16px] leading-[1.85] font-light mb-5"
        >
          {text}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Hero Image */}
      <div ref={heroRef} className="relative w-full h-[50vh] md:h-[60vh]" style={{ opacity: 0 }}>
        <img
          src={article.featuredImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Dark overlays */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(11,11,12,0.3) 0%, rgba(11,11,12,0.85) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 30%, rgba(11,11,12,0.5) 100%)',
          }}
        />

        {/* Back + Category overlay on hero */}
        <div className="absolute top-0 left-0 right-0 pt-[12vh] px-[4vw] md:px-[8vw] flex items-center justify-between">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[#F5EFE7] text-[12px] md:text-[13px] uppercase tracking-[0.15em] font-sans hover:text-[#C9A24A] transition-colors duration-300 bg-[rgba(11,11,12,0.4)] backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <ArrowLeft size={14} />
            {t('blogArticlePage.back')}
          </Link>
          <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.15em] text-[#C9A24A] bg-[rgba(11,11,12,0.4)] backdrop-blur-sm px-4 py-2 rounded-full border border-[rgba(201,162,74,0.2)]">
            {category}
          </span>
        </div>

        {/* Title overlay on hero bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-[4vw] md:px-[8vw] lg:px-[16vw] pb-[5vh] md:pb-[7vh]">
          <h1 className="font-serif text-[#F5EFE7] text-[clamp(28px,5vw,52px)] leading-[1.1] tracking-[-0.01em] font-medium max-w-[720px]">
            {title}
          </h1>
          <div className="flex items-center gap-5 mt-4">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] md:text-[12px] text-[#B8B0A8] tracking-wider">
              <Calendar size={13} strokeWidth={1.5} />
              {new Date(article.publishDate).toLocaleDateString(i18n.language === 'te' ? 'te-IN' : 'en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] md:text-[12px] text-[#B8B0A8] tracking-wider">
              <Clock size={13} strokeWidth={1.5} />
              {readTime}
            </span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div
        ref={contentRef}
        className="relative px-[6vw] md:px-[12vw] lg:px-[20vw] py-[6vh] md:py-[8vh] max-w-[900px] mx-auto"
        style={{ opacity: 0 }}
      >
        {/* Golden accent line */}
        <div className="w-16 h-px bg-[#C9A24A] mb-8" />

        {/* Excerpt / Lead paragraph */}
        <p className="font-sans text-[#E8E0D8] text-[17px] md:text-[19px] leading-[1.8] font-light mb-8 italic">
          {excerpt}
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-[rgba(201,162,74,0.15)] mb-8" />

        {/* Body */}
        <article className="blog-article-body">{renderBody(bodyParagraphs)}</article>

        {/* Author / Sign-off */}
        <div className="mt-12 pt-8 border-t border-[rgba(201,162,74,0.15)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1e] border border-[rgba(201,162,74,0.25)] flex items-center justify-center">
              <span className="font-serif text-[#C9A24A] text-[16px] font-medium">
                T
              </span>
            </div>
            <div>
              <p className="font-sans text-[#F5EFE7] text-[13px] font-medium tracking-wide">
                {t('blogArticlePage.author')}
              </p>
              <p className="font-mono text-[#B8B0A8] text-[10px] uppercase tracking-[0.15em] mt-0.5">
                {t('blogArticlePage.authorSubtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div
          ref={relatedRef}
          className="px-[4vw] md:px-[8vw] lg:px-[12vw] pb-[12vh] max-w-[960px] mx-auto"
          style={{ opacity: 0 }}
        >
          {/* Divider */}
          <div className="w-full h-px bg-[rgba(201,162,74,0.12)] mb-[5vh]" />

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-8 h-px bg-[#C9A24A]" />
            <span className="font-mono text-[#C9A24A] text-[11px] uppercase tracking-[0.18em]">
              {t('blogArticlePage.related')}
            </span>
            <div className="w-8 h-px bg-[#C9A24A]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedArticles.map((related) => {
              const relTitle = t(`blogData.articles.${related.slug}.title`);
              return (
                <Link
                  to={`/blog/${related.shortSlug || related.slug}`}
                  key={related.slug}
                  className="group block rounded-lg overflow-hidden bg-[#131315] border border-[rgba(201,162,74,0.1)] hover:border-[rgba(201,162,74,0.3)] transition-all duration-500"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={related.featuredImage}
                      alt={relTitle}
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
                  </div>
                  <div className="p-5 md:p-6">
                    <h3 className="font-serif text-[#F5EFE7] text-[18px] md:text-[20px] leading-[1.25] font-medium group-hover:text-[#C9A24A] transition-colors duration-300">
                      {relTitle}
                    </h3>
                    <div className="mt-4 flex items-center gap-2 text-[#C9A24A] text-[12px] uppercase tracking-[0.12em] font-sans font-medium">
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
      )}
    </div>
  );
}
