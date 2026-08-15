import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const navLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.collections'), href: '/#collections' },
    { label: t('nav.about'), href: '/#legacy-section' },
    { label: t('nav.goldRate'), href: '/gold-rate-dharmavaram' },
    { label: t('nav.blog'), href: '/blog' },
    { label: t('nav.contact'), href: '/#contact' },
  ];

  const handleLanguageChange = (lang: string) => {
    window.dispatchEvent(new CustomEvent('change-language', { detail: lang }));
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[1000] px-[4vw] md:px-[6vw] py-4 md:py-5 flex items-center justify-between">
        {/* Brand name — left side */}
        <div className="flex-1 min-w-0">
          <Link
            to="/"
            onClick={() => {
              if (window.location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                window.scrollTo(0, 0);
              }
            }}
          >
            <h1 className="font-serif text-[#F5EFE7] text-[11px] sm:text-[13px] md:text-[15px] tracking-[0.15em] sm:tracking-[0.25em] uppercase font-medium truncate">
              {t('nav.brandName')}
            </h1>
          </Link>
        </div>

        {/* Language switcher - beside navigation menu, left of navigation button */}
        <div className="flex items-center gap-2 mr-3 sm:mr-5 text-[11px] sm:text-[12px] md:text-[13px] tracking-widest text-[#F5EFE7]/80 flex-shrink-0 select-none">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`transition-colors duration-300 ${i18n.language === 'en' ? 'text-[#C9A24A] font-semibold' : 'hover:text-[#C9A24A]'}`}
            aria-label="Switch to English"
          >
            EN
          </button>
          <span className="text-[#F5EFE7]/20">|</span>
          <button
            onClick={() => handleLanguageChange('te')}
            className={`font-telugu transition-colors duration-300 ${i18n.language === 'te' ? 'text-[#C9A24A] font-semibold' : 'hover:text-[#C9A24A]'}`}
            aria-label="తెలుగుకి మారండి"
          >
            తెలుగు
          </button>
        </div>

        {/* Gold Rate Link — shown on desktop navbar */}
        <Link
          to="/gold-rate-dharmavaram"
          className="hidden sm:inline-flex items-center mr-4 sm:mr-6 text-[#F5EFE7]/80 hover:text-[#C9A24A] font-sans text-[10px] md:text-[11px] uppercase tracking-[0.15em] font-medium transition-colors duration-300 flex-shrink-0"
        >
          {t('nav.goldRate')}
        </Link>

        {/* Book a Visit CTA — hidden on very small screens */}
        <a
          href="/#contact"
          className="hidden sm:inline-flex items-center mr-3 sm:mr-5 px-4 py-1.5 border border-[rgba(201,162,74,0.4)] text-[#C9A24A] font-sans text-[10px] md:text-[11px] uppercase tracking-[0.15em] font-medium rounded-full hover:bg-[rgba(201,162,74,0.1)] hover:border-[#C9A24A] transition-all duration-300 flex-shrink-0"
        >
          {t('nav.cta')}
        </a>

        {/* Hamburger menu — right side */}
        <div className="flex items-center flex-shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[#F5EFE7] hover:text-[#C9A24A] transition-colors duration-300 p-1"
            aria-label="Menu"
          >
            {menuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[999] bg-[#0B0B0C]/95 backdrop-blur-md transition-all duration-500 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link, i) => {
            const isRoute = link.href.startsWith('/') && !link.href.includes('#');
            const Tag = isRoute ? Link : 'a';
            const props = isRoute
              ? {
                  to: link.href,
                  onClick: () => {
                    setMenuOpen(false);
                    if (link.href === '/' && window.location.pathname === '/') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                }
              : { href: link.href, onClick: () => setMenuOpen(false) };

            return (
              <Tag
                key={link.label}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...(props as any)}
                className="font-serif text-[#F5EFE7] text-3xl md:text-4xl hover:text-[#C9A24A] transition-colors duration-300 tracking-wide"
                style={{
                  transitionDelay: menuOpen ? `${i * 60}ms` : '0ms',
                  transform: menuOpen ? 'translateY(0)' : 'translateY(20px)',
                  opacity: menuOpen ? 1 : 0,
                }}
              >
                {link.label}
              </Tag>
            );
          })}
        </div>
      </div>
    </>
  );
}
