import { useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Instagram, MessageCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function FooterSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(content.children,
        { y: '3vh', opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: content,
            start: 'top 90%',
            end: 'top 70%',
            scrub: 0.4,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={sectionRef}
      className="relative w-full bg-[#0B0B0C] py-[6vh] z-[80]"
    >
      {/* Social & Footer Content */}
      <div
        ref={contentRef}
        className="px-[6vw] flex flex-col items-center justify-center max-w-[900px] mx-auto"
      >
        {/* Social Icons */}
        <div className="text-center">
          <h3 className="font-mono text-[#C9A24A] text-[11px] uppercase tracking-[0.18em] mb-6">
            {t('footer.title')}
          </h3>
          <div className="flex items-center justify-center gap-6">
            <a
              href="https://www.instagram.com/raviprakashtabjul?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F5EFE7] hover:text-[#C9A24A] transition-colors duration-300"
              aria-label="Instagram"
            >
              <Instagram size={24} strokeWidth={1.5} />
            </a>
            <a
              href="https://wa.me/919247611116"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F5EFE7] hover:text-[#C9A24A] transition-colors duration-300"
              aria-label="WhatsApp"
            >
              <MessageCircle size={24} strokeWidth={1.5} />
            </a>
          </div>
        </div>

        {/* Footer Navigation Links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-[0.15em] font-sans">
          <Link
            to="/"
            onClick={() => {
              if (window.location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="text-[#B8B0A8] hover:text-[#C9A24A] transition-colors duration-300"
          >
            {t('footer.links.home')}
          </Link>
          <Link
            to="/#collections"
            className="text-[#B8B0A8] hover:text-[#C9A24A] transition-colors duration-300"
          >
            {t('footer.links.collections')}
          </Link>
          <Link
            to="/blog"
            className="text-[#B8B0A8] hover:text-[#C9A24A] transition-colors duration-300"
          >
            {t('footer.links.blog')}
          </Link>
          <Link
            to="/#contact"
            className="text-[#B8B0A8] hover:text-[#C9A24A] transition-colors duration-300"
          >
            {t('footer.links.contact')}
          </Link>
          <Link
            to="/gold-rate-dharmavaram"
            className="text-[#B8B0A8] hover:text-[#C9A24A] transition-colors duration-300"
          >
            {t('footer.links.goldRate')}
          </Link>
          <Link
            to="/privacy"
            className="text-[#B8B0A8] hover:text-[#C9A24A] transition-colors duration-300"
          >
            {t('footer.links.privacy')}
          </Link>
        </div>

        {/* Business Details */}
        <div className="mt-8 text-center space-y-2">
          <p className="font-serif text-[#F5EFE7] text-[14px] md:text-[15px] font-medium tracking-wide">
            {t('footer.businessName')}
          </p>
          <p className="font-sans text-[#B8B0A8] text-[12px] md:text-[13px] font-light leading-relaxed whitespace-pre-line">
            {t('footer.address')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-1">
            <a
              href="tel:+919247611116"
              className="font-sans text-[#B8B0A8] text-[12px] md:text-[13px] font-light hover:text-[#C9A24A] transition-colors duration-300"
            >
              {t('footer.phone')}
            </a>
            <span className="text-[#F5EFE7]/15 text-[10px]">|</span>
            <a
              href="mailto:tabjulprabhakargupta@gmail.com"
              className="font-sans text-[#B8B0A8] text-[12px] md:text-[13px] font-light hover:text-[#C9A24A] transition-colors duration-300"
            >
              {t('footer.email')}
            </a>
          </div>
          <a
            href="https://maps.google.com/?q=Tabjul+Prabhakar+Gupta+Jewellers,Dharmavaram"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-sans text-[#C9A24A] text-[11px] md:text-[12px] uppercase tracking-[0.12em] hover:text-[#F5EFE7] transition-colors duration-300 mt-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {t('footer.mapsLink')}
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-[6vh] mx-[6vw] h-px bg-[rgba(245,239,231,0.08)]" />

      {/* Copyright */}
      <div className="mt-6 text-center">
        <p className="font-sans text-[#B8B0A8] text-[11px] md:text-[12px] tracking-wide">
          {t('footer.copyright')}
        </p>
      </div>
    </footer>
  );
}
