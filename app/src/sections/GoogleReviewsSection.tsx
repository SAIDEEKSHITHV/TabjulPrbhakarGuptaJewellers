import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Reviews Data ──────────────────────────────────────────── */
const reviews = [
  {
    nameKey: 'reviews.data.review1.name',
    textKey: 'reviews.data.review1.text',
    rating: 5,
  },
  {
    nameKey: 'reviews.data.review2.name',
    textKey: 'reviews.data.review2.text',
    rating: 5,
  },
  {
    nameKey: 'reviews.data.review3.name',
    textKey: 'reviews.data.review3.text',
    rating: 5,
  },
  {
    nameKey: 'reviews.data.review4.name',
    textKey: 'reviews.data.review4.text',
    rating: 5,
  },
  {
    nameKey: 'reviews.data.review5.name',
    textKey: 'reviews.data.review5.text',
    rating: 4,
  },
  {
    nameKey: 'reviews.data.review6.name',
    textKey: 'reviews.data.review6.text',
    rating: 5,
  },
  {
    nameKey: 'reviews.data.review7.name',
    textKey: 'reviews.data.review7.text',
    rating: 4,
  },
];

/* ─── Star Component ────────────────────────────────────────── */
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < count ? '#FBBC04' : 'rgba(255,255,255,0.12)'}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Review Card ───────────────────────────────────────────── */
function ReviewCard({ review }: { review: typeof reviews[0] }) {
  const { t } = useTranslation();
  const name = t(review.nameKey);
  const text = t(review.textKey);
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex-shrink-0 w-[340px] md:w-[400px] rounded-2xl p-6 mx-3"
      style={{
        background:
          'linear-gradient(135deg, rgba(245,239,231,0.06) 0%, rgba(245,239,231,0.02) 100%)',
        border: '1px solid rgba(245,239,231,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header: Avatar + Name + Stars */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar circle */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(201,162,74,0.25) 0%, rgba(201,162,74,0.08) 100%)',
            border: '1px solid rgba(201,162,74,0.3)',
          }}
        >
          <span className="font-sans text-[11px] font-semibold tracking-wider text-[#C9A24A]">
            {initials}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-sans text-[#F5EFE7] text-[14px] font-medium truncate">
            {name}
          </p>
          <div className="mt-1">
            <Stars count={review.rating} />
          </div>
        </div>

        {/* Google "G" icon */}
        <svg
          className="flex-shrink-0 mt-0.5 opacity-50"
          width="18"
          height="18"
          viewBox="0 0 48 48"
        >
          <path
            fill="#4285F4"
            d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
          />
        </svg>
      </div>

      {/* Review text */}
      <p className="font-sans text-[#B8B0A8] text-[13px] leading-[1.7] line-clamp-4">
        {text}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GOOGLE REVIEWS SECTION
   ═══════════════════════════════════════════════════════════════ */
export default function GoogleReviewsSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const row1 = row1Ref.current;
    const row2 = row2Ref.current;

    if (!section || !header || !row1 || !row2) return;

    const ctx = gsap.context(() => {
      // Fade in header
      gsap.fromTo(
        header,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 40%',
            scrub: 0.6,
          },
        }
      );

      // Fade in rows with stagger
      gsap.fromTo(
        row1,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            end: 'top 35%',
            scrub: 0.6,
          },
        }
      );

      gsap.fromTo(
        row2,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            end: 'top 30%',
            scrub: 0.6,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  // Split reviews into two rows
  const row1Reviews = reviews.slice(0, 3);
  const row2Reviews = reviews.slice(3);

  return (
    <section
      ref={sectionRef}
      id="google-reviews"
      className="relative w-full py-24 md:py-32 overflow-hidden z-[57] bg-[#0B0B0C]"
    >
      {/* Subtle top gradient border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 10%, rgba(201,162,74,0.2) 50%, transparent 90%)',
        }}
      />

      {/* Background texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(201,162,74,0.04) 0%, transparent 60%)',
        }}
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <div ref={headerRef} className="text-center mb-16 md:mb-20 px-6">
        {/* Google badge */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <svg width="24" height="24" viewBox="0 0 48 48">
            <path
              fill="#4285F4"
              d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
            />
          </svg>
          <span className="font-mono text-[11px] md:text-[12px] uppercase tracking-[0.25em] text-[#B8B0A8]">
            {t('reviews.eyebrow')}
          </span>
        </div>

        <h2 className="font-serif text-[#F5EFE7] text-[clamp(28px,4vw,52px)] leading-[1.1] tracking-[-0.01em] font-medium">
          {t('reviews.title').split(' ')[0]}{' '}
          <span className="italic" style={{ color: '#C9A24A' }}>
            {t('reviews.title').split(' ').slice(1).join(' ')}
          </span>
        </h2>

        <p className="font-sans text-[#B8B0A8] text-[clamp(14px,1.3vw,18px)] mt-5 max-w-lg mx-auto leading-[1.65] font-light">
          {t('reviews.subhead')}
        </p>

        {/* Trust Indicator */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <svg
                key={i}
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="#FBBC04"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <p className="font-sans text-[15px] md:text-[17px] tracking-wide">
            <span className="font-serif font-medium text-[#C9A24A] text-[18px] md:text-[20px]">
              {t('reviews.trustRating')}
            </span>
            <span className="text-[#B8B0A8] font-light ml-2">
              {t('reviews.trustLabel')}
            </span>
          </p>
        </div>
      </div>

      {/* ── Row 1: scrolls left ────────────────────────────── */}
      <div ref={row1Ref} className="mb-6 overflow-hidden">
        <div className="flex animate-reviews-scroll-left">
          {/* Duplicate 3x for seamless loop */}
          {[...row1Reviews, ...row1Reviews, ...row1Reviews].map(
            (review, i) => (
              <ReviewCard key={`r1-${i}`} review={review} />
            )
          )}
        </div>
      </div>

      {/* ── Row 2: scrolls right ───────────────────────────── */}
      <div ref={row2Ref} className="overflow-hidden">
        <div className="flex animate-reviews-scroll-right">
          {/* Duplicate 3x for seamless loop */}
          {[...row2Reviews, ...row2Reviews, ...row2Reviews].map(
            (review, i) => (
              <ReviewCard key={`r2-${i}`} review={review} />
            )
          )}
        </div>
      </div>

      {/* ── Review Us CTA ──────────────────────────────── */}
      <div className="relative z-20 flex justify-center mt-12 md:mt-16">
        <a
          href="https://maps.google.com/?cid=12014145272410123144&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full transition-all duration-400 hover:scale-[1.03]"
          style={{
            border: '1px solid rgba(201,162,74,0.35)',
            background: 'linear-gradient(135deg, rgba(201,162,74,0.08) 0%, rgba(201,162,74,0.02) 100%)',
          }}
        >
          {/* Google icon */}
          <svg width="18" height="18" viewBox="0 0 48 48" className="flex-shrink-0">
            <path
              fill="#4285F4"
              d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
            />
          </svg>
          <span
            className="font-sans text-[13px] md:text-[14px] tracking-[0.08em] uppercase font-medium transition-colors duration-300 group-hover:text-[#C9A24A]"
            style={{ color: '#F5EFE7' }}
          >
            {t('reviews.cta')}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#C9A24A] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>

      {/* ── Left/Right fade edges ──────────────────────────── */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[80px] md:w-[120px] pointer-events-none z-10"
        style={{
          background:
            'linear-gradient(to right, #0B0B0C 0%, transparent 100%)',
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-[80px] md:w-[120px] pointer-events-none z-10"
        style={{
          background:
            'linear-gradient(to left, #0B0B0C 0%, transparent 100%)',
        }}
      />

      {/* Subtle bottom gradient border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 10%, rgba(201,162,74,0.2) 50%, transparent 90%)',
        }}
      />
    </section>
  );
}
