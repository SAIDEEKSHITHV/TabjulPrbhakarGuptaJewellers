import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ArrowLeft, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { getGoldRates, type GoldRateItem } from '../lib/goldRates';
import FooterSection from '../sections/FooterSection';

interface FAQItem {
  q: string;
  a: string;
}

export default function GoldRatePage() {
  const { t, i18n } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [rates, setRates] = useState<GoldRateItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Set page title & meta description
    document.title = t('goldRatePage.metaTitle') || "Today's Gold Rate in Dharmavaram | Tabjul Prabhakar Gupta Jewellers";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        t('goldRatePage.metaDesc') || "Check today's live 22K and 24K gold rates in Dharmavaram. Updated regularly by Tabjul Prabhakar Gupta Jewellers."
      );
    }

    // Load Live Gold Rates
    let isMounted = true;
    getGoldRates()
      .then((res) => {
        if (!isMounted) return;
        if (res.data && res.data.items && res.data.items.length > 0) {
          setRates(res.data.items);
          if (res.timestamp) {
            const date = new Date(res.timestamp);
            const formattedDate = date.toLocaleString(i18n.language === 'te' ? 'te-IN' : 'en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
            setLastUpdated(formattedDate);
          }
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load gold rates for page:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [t, i18n.language]);

  // Entrance animation
  useEffect(() => {
    if (loading) return;
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Animate child elements sequentially
      const animTargets = container.querySelectorAll('.animate-fade');
      gsap.fromTo(
        animTargets,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
      );
    }, container);

    return () => ctx.revert();
  }, [loading]);

  const faqs = t('goldRatePage.faqs', { returnObjects: true }) as FAQItem[];

  // Dynamic Schema.org injection
  useEffect(() => {
    if (loading || error || rates.length === 0) return;

    // 1. LocalBusiness/JewelryStore Schema
    const businessSchema = {
      "@context": "https://schema.org",
      "@type": "JewelryStore",
      "name": "Tabjul Prabhakar Gupta Jewellers",
      "image": "https://tabjulprabhakarguptajewellers.com/images/showroom_exterior.jpg",
      "@id": "https://tabjulprabhakarguptajewellers.com/#business",
      "url": "https://tabjulprabhakarguptajewellers.com",
      "telephone": "+919849289421",
      "priceRange": "$$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Teru Bazar",
        "addressLocality": "Dharmavaram",
        "addressRegion": "Andhra Pradesh",
        "postalCode": "515671",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 14.4137,
        "longitude": 77.7145
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "10:00",
          "closes": "20:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Sunday",
          "opens": "10:00",
          "closes": "13:30"
        }
      ]
    };

    // 2. FAQPage Schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": Array.isArray(faqs) ? faqs.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      })) : []
    };

    // Append script tags to document head
    const businessScript = document.createElement('script');
    businessScript.type = 'application/ld+json';
    businessScript.id = 'jewelry-store-schema';
    businessScript.innerHTML = JSON.stringify(businessSchema);
    document.head.appendChild(businessScript);

    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.id = 'gold-rate-faq-schema';
    faqScript.innerHTML = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    return () => {
      // Clean up script tags on unmount
      const oldBiz = document.getElementById('jewelry-store-schema');
      const oldFaq = document.getElementById('gold-rate-faq-schema');
      if (oldBiz) oldBiz.remove();
      if (oldFaq) oldFaq.remove();
    };
  }, [loading, error, rates, faqs]);

  // Rate Formatter helper
  const formatRate = (val?: number) => {
    if (val === undefined || val === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Extract 1g rates for primary display cards
  const oneGramRate = rates.find(r => r.gram === '1');

  return (
    <div className="min-h-screen bg-[#0B0B0C] pt-[14vh] flex flex-col justify-between">
      <div className="w-full max-w-[960px] mx-auto px-6 mb-[10vh] flex-grow flex flex-col">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#B8B0A8] text-[12px] md:text-[13px] uppercase tracking-[0.15em] font-sans hover:text-[#C9A24A] transition-colors duration-300 mb-8 self-start"
        >
          <ArrowLeft size={14} />
          {t('blogPage.back')}
        </Link>

        {loading ? (
          /* Loading State */
          <div className="flex-grow flex flex-col items-center justify-center py-[15vh]">
            <div className="w-10 h-10 border-2 border-[rgba(212,175,55,0.2)] border-t-[#D4AF37] rounded-full animate-spin mb-4" />
            <span className="font-mono text-[#B8B0A8] text-[12px] tracking-[0.2em] uppercase">
              {i18n.language === 'te' ? 'ధరలను లోడ్ చేస్తోంది...' : 'Retrieving Live Gold Rates...'}
            </span>
          </div>
        ) : error || !oneGramRate ? (
          /* Fallback Error State */
          <div className="flex-grow flex flex-col items-center justify-center py-[10vh] text-center max-w-[480px] mx-auto">
            <AlertCircle size={40} className="text-[#D4AF37]/60 mb-4" />
            <h2 className="font-serif text-[#F5EFE7] text-[20px] font-medium mb-3">
              {i18n.language === 'te' ? 'ధరల సమాచారం లోడ్ కాలేదు' : 'Gold Rates Unavailable'}
            </h2>
            <p className="font-sans text-[#B8B0A8] text-[14px] leading-[1.6] font-light mb-6">
              {i18n.language === 'te' 
                ? 'క్షమించండి, ప్రస్తుతం మార్కెట్ ధరలను లోడ్ చేయడంలో సమస్య ఏర్పడింది. దయచేసి కాసేపటి తర్వాత మళ్లీ ప్రయత్నించండి లేదా నేరుగా మా షోరూమ్‌ను సంప్రదించండి.' 
                : 'We are currently unable to retrieve today\'s live gold rates from the market. Please try again later or contact our showroom directly for current pricing.'}
            </p>
            <a
              href="tel:+919849289421"
              className="px-6 py-2.5 border border-[#D4AF37] text-[#D4AF37] text-[12px] font-sans uppercase tracking-[0.15em] font-medium hover:bg-[#D4AF37] hover:text-[#111111] transition-all duration-300"
            >
              {i18n.language === 'te' ? 'షోరూమ్‌కి కాల్ చేయండి' : 'Call Showroom'}
            </a>
          </div>
        ) : (
          /* Main Page Content */
          <div ref={containerRef} className="flex flex-col">
            {/* Header */}
            <div className="animate-fade mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px bg-[#C9A24A]" />
                <span className="font-mono text-[#C9A24A] text-[11px] md:text-[12px] uppercase tracking-[0.18em] font-medium">
                  {i18n.language === 'te' ? 'ప్రత్యక్ష మార్కెట్ రేట్లు' : 'Live Market Rates'}
                </span>
              </div>
              <h1 className="font-serif text-[#F5EFE7] text-[clamp(32px,4.5vw,56px)] leading-[1.1] tracking-[-0.01em] font-medium">
                {t('goldRatePage.title')}
              </h1>
              <div className="font-sans text-[#C9A24A] text-[12px] md:text-[13px] tracking-wide mt-2 font-medium">
                {t('goldRatePage.locationSignal')}
              </div>
              <p className="font-sans text-[#B8B0A8] text-[14px] md:text-[15px] mt-3 font-light">
                {t('goldRatePage.subtitle')}
              </p>
              
              {lastUpdated && (
                <div className="flex items-center gap-1.5 mt-4 text-[#B8B0A8]/60 font-sans text-[11px] font-light">
                  <Calendar size={12} className="text-[#C9A24A]" />
                  <span>{t('goldRatePage.lastUpdated')}: {lastUpdated}</span>
                </div>
              )}
            </div>

            {/* Live Gold Rate Cards (Premium Layout) */}
            <div className="animate-fade grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* 22K Card */}
              <div className="relative overflow-hidden backdrop-blur-md bg-[#131315]/40 border border-[rgba(201,162,74,0.15)] hover:border-[rgba(201,162,74,0.3)] p-6 transition-all duration-400 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-[11px] text-[#C9A24A] uppercase tracking-wider font-semibold">22 Karat</span>
                    <TrendingUp size={16} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="font-serif text-[#F5EFE7] text-[18px] font-medium mb-1">
                    {t('goldRatePage.k22')}
                  </h3>
                  <p className="font-sans text-[#B8B0A8] text-[12px] font-light mb-6">
                    {i18n.language === 'te' ? 'ఆభరణాల తయారీకి అనువైనది' : 'Ideal for fine jewellery'}
                  </p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-sans text-3xl font-bold text-[#FFF8F0]">
                      {formatRate(oneGramRate.today_22k)}
                    </span>
                    <span className="font-sans text-[11px] text-[#B8B0A8]/60 font-light">/ {t('goldRatePage.perGram')}</span>
                  </div>
                  <div className="h-px bg-[rgba(201,162,74,0.1)] my-3" />
                  <div className="flex justify-between text-[11px] font-sans">
                    <span className="text-[#B8B0A8]/60">{t('goldRatePage.per10Gram')}:</span>
                    <span className="text-[#FFF8F0] font-medium">{formatRate(oneGramRate.today_22k * 10)}</span>
                  </div>
                </div>
              </div>

              {/* 24K Card */}
              <div className="relative overflow-hidden backdrop-blur-md bg-[#131315]/60 border border-[#D4AF37]/35 hover:border-[#D4AF37]/65 p-6 transition-all duration-400 flex flex-col justify-between shadow-[0_4px_30px_rgba(212,175,87,0.03)]">
                {/* Gold Highlight Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/3 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-[11px] text-[#D4AF37] uppercase tracking-wider font-bold">24 Karat</span>
                    <TrendingUp size={16} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="font-serif text-[#F5EFE7] text-[18px] font-medium mb-1">
                    {t('goldRatePage.k24')}
                  </h3>
                  <p className="font-sans text-[#B8B0A8] text-[12px] font-light mb-6">
                    {i18n.language === 'te' ? 'స్వచ్ఛమైన బంగారం (పెట్టుబడికి అనువైనది)' : 'Pure Gold (Best for Investment)'}
                  </p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-sans text-3xl font-bold text-[#FFF8F0]">
                      {formatRate(oneGramRate.today_24k)}
                    </span>
                    <span className="font-sans text-[11px] text-[#B8B0A8]/60 font-light">/ {t('goldRatePage.perGram')}</span>
                  </div>
                  <div className="h-px bg-[rgba(212,175,55,0.2)] my-3" />
                  <div className="flex justify-between text-[11px] font-sans">
                    <span className="text-[#B8B0A8]/60">{t('goldRatePage.per10Gram')}:</span>
                    <span className="text-[#D4AF37] font-semibold">{formatRate(oneGramRate.today_24k * 10)}</span>
                  </div>
                </div>
              </div>

              {/* 18K Card */}
              <div className="relative overflow-hidden backdrop-blur-md bg-[#131315]/40 border border-[rgba(201,162,74,0.15)] hover:border-[rgba(201,162,74,0.3)] p-6 transition-all duration-400 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-[11px] text-[#C9A24A] uppercase tracking-wider font-semibold">18 Karat</span>
                    <TrendingUp size={16} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="font-serif text-[#F5EFE7] text-[18px] font-medium mb-1">
                    {t('goldRatePage.k18')}
                  </h3>
                  <p className="font-sans text-[#B8B0A8] text-[12px] font-light mb-6">
                    {i18n.language === 'te' ? 'డైమండ్ ఆభరణాల కోసం అనువైనది' : 'Recommended for diamond settings'}
                  </p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-sans text-3xl font-bold text-[#FFF8F0]">
                      {formatRate(oneGramRate.today_18k)}
                    </span>
                    <span className="font-sans text-[11px] text-[#B8B0A8]/60 font-light">/ {t('goldRatePage.perGram')}</span>
                  </div>
                  <div className="h-px bg-[rgba(201,162,74,0.1)] my-3" />
                  <div className="flex justify-between text-[11px] font-sans">
                    <span className="text-[#B8B0A8]/60">{t('goldRatePage.per10Gram')}:</span>
                    <span className="text-[#FFF8F0] font-medium">{formatRate(oneGramRate.today_18k * 10)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Weight Matrix Table */}
            <div className="animate-fade mb-16 overflow-hidden border border-[rgba(201,162,74,0.15)] bg-[#131315]/20 backdrop-blur-sm rounded-none">
              <div className="p-5 border-b border-[rgba(201,162,74,0.15)] flex flex-wrap justify-between items-center gap-3">
                <h2 className="font-serif text-[#F5EFE7] text-[18px] font-medium">
                  {i18n.language === 'te' ? 'వివిధ బరువుల వారీగా ధరల పట్టిక' : 'Gold Rates by Weight'}
                </h2>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#B8B0A8]/50 bg-black/30 px-3 py-1">
                  {i18n.language === 'te' ? 'భారత రూపాయలలో (₹)' : 'Rates in Indian Rupees (INR)'}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-[14px]">
                  <thead>
                    <tr className="border-b border-[rgba(201,162,74,0.1)] text-[#B8B0A8]/60 font-mono text-[10px] uppercase tracking-wider bg-black/10">
                      <th className="py-4 px-6 font-medium">{i18n.language === 'te' ? 'బరువు (గ్రాములు)' : 'Weight (Grams)'}</th>
                      <th className="py-4 px-6 font-semibold text-[#D4AF37]">{t('goldRatePage.k24')} (24K)</th>
                      <th className="py-4 px-6 font-semibold text-[#FFF8F0]">{t('goldRatePage.k22')} (22K)</th>
                      <th className="py-4 px-6 font-semibold text-[#B8B0A8]">{t('goldRatePage.k18')} (18K)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(201,162,74,0.06)] text-[#FFF8F0] font-light">
                    {rates.map((item) => (
                      <tr key={item.gram} className="hover:bg-white/[0.015] transition-colors duration-200">
                        <td className="py-4 px-6 font-mono font-medium">
                          {item.gram === '1' && (i18n.language === 'te' ? '1 గ్రాము' : '1 Gram')}
                          {item.gram === '8' && (i18n.language === 'te' ? '8 గ్రాములు (1 సవరం)' : '8 Grams (1 Sovereign)')}
                          {item.gram === '10' && (i18n.language === 'te' ? '10 గ్రాములు (1 తులం)' : '10 Grams (1 Tola)')}
                          {item.gram === '100' && (i18n.language === 'te' ? '100 గ్రాములు' : '100 Grams')}
                        </td>
                        <td className="py-4 px-6 font-mono font-semibold text-[#D4AF37]">{formatRate(item.today_24k)}</td>
                        <td className="py-4 px-6 font-mono font-medium">{formatRate(item.today_22k)}</td>
                        <td className="py-4 px-6 font-mono">{formatRate(item.today_18k)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Planning to Buy Jewellery CTA Block */}
            <div className="animate-fade my-12 p-8 border border-[#D4AF37]/30 bg-[#131315]/40 backdrop-blur-md text-center max-w-[700px] mx-auto flex flex-col items-center">
              <h2 className="font-serif text-[#F5EFE7] text-[22px] md:text-[26px] font-medium mb-3">
                {t('goldRatePage.ctaHeading')}
              </h2>
              <p className="font-sans text-[#B8B0A8] text-[14px] md:text-[15px] leading-relaxed font-light max-w-[500px] mb-8">
                {t('goldRatePage.ctaSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <a
                  href="/#contact"
                  className="px-8 py-3 border border-[#D4AF37] text-[#D4AF37] text-[12px] font-sans uppercase tracking-[0.15em] font-medium hover:bg-[#D4AF37] hover:text-[#111111] transition-all duration-300 text-center"
                >
                  {t('goldRatePage.ctaVisit')}
                </a>
                <a
                  href="https://wa.me/919849289421"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 border border-[rgba(245,239,231,0.2)] text-[#F5EFE7] text-[12px] font-sans uppercase tracking-[0.15em] font-medium hover:border-[#C9A24A] hover:text-[#C9A24A] transition-all duration-300 text-center"
                >
                  {t('goldRatePage.ctaWhatsApp')}
                </a>
              </div>
            </div>

            {/* SEO Content Section */}
            <div className="animate-fade border-t border-[rgba(201,162,74,0.15)] pt-12 pb-16">
              <h2 className="font-serif text-[#F5EFE7] text-[24px] md:text-[28px] font-medium mb-4">
                {t('goldRatePage.infoHeading')}
              </h2>
              <p className="font-sans text-[#C8C0B8] text-[15px] md:text-[16px] leading-[1.85] font-light whitespace-pre-line">
                {t('goldRatePage.infoContent')}
              </p>
            </div>

            {/* FAQ Accordion Section */}
            <div className="animate-fade border-t border-[rgba(201,162,74,0.15)] pt-12">
              <h2 className="font-serif text-[#F5EFE7] text-[24px] md:text-[28px] font-medium mb-8">
                {t('goldRatePage.faqHeading')}
              </h2>
              <div className="space-y-4">
                {Array.isArray(faqs) &&
                  faqs.map((faq, idx) => {
                    const isOpen = activeFaq === idx;
                    return (
                      <div
                        key={idx}
                        className="border border-[rgba(201,162,74,0.12)] bg-[#131315]/20 hover:border-[rgba(201,162,74,0.25)] transition-all duration-300"
                      >
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                        >
                          <span className="font-serif text-[#F5EFE7] text-[16px] md:text-[18px] font-medium pr-4">
                            {faq.q}
                          </span>
                          <span className="text-[#C9A24A] text-[20px] transition-transform duration-300 transform select-none" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                            ＋
                          </span>
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <div className="px-6 pb-6 pt-1 border-t border-[rgba(201,162,74,0.06)] font-sans text-[#B8B0A8] text-[14px] md:text-[15px] leading-[1.75] font-light whitespace-pre-line">
                            {faq.a}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Why Gold Rates in Dharmavaram Change Daily Section */}
            <div className="animate-fade border-t border-[rgba(201,162,74,0.15)] pt-12 mt-12 mb-4">
              <h2 className="font-serif text-[#F5EFE7] text-[24px] md:text-[28px] font-medium mb-4">
                {t('goldRatePage.seoMoveHeading')}
              </h2>
              <p className="font-sans text-[#C8C0B8] text-[15px] md:text-[16px] leading-[1.85] font-light whitespace-pre-line">
                {t('goldRatePage.seoMoveContent')}
              </p>
            </div>
          </div>
        )}
      </div>
      <FooterSection />
    </div>
  );
}
