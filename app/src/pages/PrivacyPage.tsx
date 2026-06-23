import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Set page title
    document.title = `${t('privacy.title')} | ${t('nav.brandName')}`;

    // Entrance animation
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        container.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
      );
    });

    return () => ctx.revert();
  }, [t]);

  interface PrivacySection {
    title: string;
    content: string;
  }

  const sections = t('privacy.sections', { returnObjects: true }) as PrivacySection[];

  return (
    <div className="min-h-screen bg-[#0B0B0C] pt-[14vh] pb-[10vh] px-6">
      <div
        ref={containerRef}
        className="max-w-[760px] mx-auto flex flex-col text-left"
      >
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#B8B0A8] text-[12px] md:text-[13px] uppercase tracking-[0.15em] font-sans hover:text-[#C9A24A] transition-colors duration-300 mb-8 self-start"
        >
          <ArrowLeft size={14} />
          {t('blogPage.back')}
        </Link>

        {/* Title */}
        <h1 className="font-serif text-[#F5EFE7] text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-0.01em] font-medium mb-3">
          {t('privacy.title')}
        </h1>

        {/* Date */}
        <p className="font-mono text-[#C9A24A] text-[11px] uppercase tracking-[0.12em] mb-8">
          {t('privacy.lastUpdated')}
        </p>

        {/* Inro */}
        <p className="font-sans text-[#C8C0B8] text-[15px] md:text-[16px] leading-[1.85] font-light mb-10">
          {t('privacy.intro')}
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-[rgba(201,162,74,0.15)] mb-10" />

        {/* Sections */}
        <div className="space-y-8">
          {Array.isArray(sections) &&
            sections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h2 className="font-serif text-[#F5EFE7] text-[20px] md:text-[22px] font-medium">
                  {section.title}
                </h2>
                <p className="font-sans text-[#C8C0B8] text-[14px] md:text-[15px] leading-[1.8] font-light whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
