import { useRef, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Clock } from 'lucide-react';
import { trackEvent } from '../lib/analytics';

gsap.registerPlugin(ScrollTrigger);

export default function ContactSection() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const info = infoRef.current;
    const map = mapRef.current;

    if (!section || !info || !map) return;

    const ctx = gsap.context(() => {
      // Info panel coming from left
      gsap.fromTo(
        info,
        { x: '-10vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            end: 'top 30%',
            scrub: 0.5,
          },
        }
      );

      // Map panel coming from right
      gsap.fromTo(
        map,
        { x: '10vw', opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            end: 'top 30%',
            scrub: 0.5,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative w-full bg-[#0B0B0C] py-[10vh] overflow-hidden z-[75]"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(201,162,74,0.03) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-[1280px] mx-auto px-[6vw] lg:px-[4vw] grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* Left Side: Information */}
        <div ref={infoRef} className="flex flex-col text-center lg:text-left z-10">
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
            <div className="w-8 h-px bg-[#C9A24A]" />
            <span className="font-mono text-[#C9A24A] text-[11px] md:text-[12px] uppercase tracking-[0.18em]">
              {t('contact.eyebrow')}
            </span>
            <div className="w-8 h-px bg-[#C9A24A] lg:hidden" />
          </div>
          
          <h2 className="font-serif text-[#F5EFE7] text-[clamp(32px,4vw,56px)] leading-[1.05] tracking-[-0.01em] font-medium mb-8">
            {t('contact.title').split('\n').map((line, idx) => (
              <span key={idx}>
                {line}
                {idx === 0 && <br />}
              </span>
            ))}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 text-[#B8B0A8] font-sans font-light">
            
            {/* Location & Contact Details */}
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-[#C9A24A] text-[13px] uppercase tracking-[0.15em] mb-3 font-medium flex items-center justify-center lg:justify-start gap-2">
                  <MapPin size={16} /> {t('contact.locationTitle')}
                </h3>
                <p className="text-[15px] leading-relaxed whitespace-pre-line">
                  {t('contact.locationDesc')}
                </p>
                <p className="text-[13px] text-[#B8B0A8]/75 leading-relaxed mt-3 italic font-light max-w-[320px] mx-auto lg:mx-0">
                  {t('contact.trustSentence')}
                </p>
              </div>

              <div>
                <h3 className="text-[#C9A24A] text-[13px] uppercase tracking-[0.15em] mb-3 font-medium flex items-center justify-center lg:justify-start gap-2">
                  <Phone size={16} /> {t('contact.contactTitle')}
                </h3>
                <a href="tel:+919849289421" className="block text-[15px] hover:text-[#F5EFE7] transition-colors mb-1">
                  +91 98492 89421
                </a>
                <a href="mailto:tabjulprabhakargupta@gmail.com" className="block text-[15px] hover:text-[#F5EFE7] transition-colors">
                  tabjulprabhakargupta@gmail.com
                </a>
              </div>
            </div>

            {/* Timings */}
            <div className="flex flex-col">
              <h3 className="text-[#C9A24A] text-[13px] uppercase tracking-[0.15em] mb-3 font-medium flex items-center justify-center lg:justify-start gap-2">
                <Clock size={16} /> {t('contact.hoursTitle')}
              </h3>
              <ul className="text-[14px] leading-[2] space-y-1">
                <li className="flex justify-between max-w-[240px] mx-auto lg:mx-0">
                  <span>{t('contact.days.monday')}</span>
                  <span>{t('contact.timings.regular')}</span>
                </li>
                <li className="flex justify-between max-w-[240px] mx-auto lg:mx-0">
                  <span>{t('contact.days.tuesday')}</span>
                  <span>{t('contact.timings.regular')}</span>
                </li>
                <li className="flex justify-between max-w-[240px] mx-auto lg:mx-0">
                  <span>{t('contact.days.wednesday')}</span>
                  <span>{t('contact.timings.regular')}</span>
                </li>
                <li className="flex justify-between max-w-[240px] mx-auto lg:mx-0">
                  <span>{t('contact.days.thursday')}</span>
                  <span>{t('contact.timings.regular')}</span>
                </li>
                <li className="flex justify-between max-w-[240px] mx-auto lg:mx-0">
                  <span>{t('contact.days.friday')}</span>
                  <span>{t('contact.timings.regular')}</span>
                </li>
                <li className="flex justify-between max-w-[240px] mx-auto lg:mx-0">
                  <span>{t('contact.days.saturday')}</span>
                  <span>{t('contact.timings.regular')}</span>
                </li>
                <li className="flex justify-between max-w-[240px] mx-auto lg:mx-0 text-[#F5EFE7]">
                  <span>{t('contact.days.sunday')}</span>
                  <span>{t('contact.timings.sunday')}</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
            {/* Call Now */}
            <a
              href="tel:+919849289421"
              onClick={() => trackEvent('click_call_contact', 'Engagement', 'Contact Section')}
              className="group inline-flex items-center justify-center gap-2.5 px-5 py-3 border border-[rgba(201,162,74,0.35)] rounded-lg text-[#F5EFE7] font-sans text-[12px] md:text-[13px] uppercase tracking-[0.12em] font-medium hover:bg-[rgba(201,162,74,0.1)] hover:border-[#C9A24A] hover:text-[#C9A24A] transition-all duration-300"
            >
              <Phone size={16} className="text-[#C9A24A]" />
              {t('contact.ctaCall')}
            </a>

            {/* Get Directions */}
            <a
              href="https://maps.google.com/?q=Tabjul+Prabhakar+Gupta+Jewellers,Dharmavaram"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('click_directions_contact', 'Engagement', 'Contact Section')}
              className="group inline-flex items-center justify-center gap-2.5 px-5 py-3 border border-[rgba(201,162,74,0.35)] rounded-lg text-[#F5EFE7] font-sans text-[12px] md:text-[13px] uppercase tracking-[0.12em] font-medium hover:bg-[rgba(201,162,74,0.1)] hover:border-[#C9A24A] hover:text-[#C9A24A] transition-all duration-300"
            >
              <MapPin size={16} className="text-[#C9A24A]" />
              {t('contact.ctaDirections')}
            </a>

            {/* Chat on WhatsApp */}
            <a
              href="https://wa.me/919849289421"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('click_whatsapp_contact', 'Engagement', 'Contact Section')}
              className="group inline-flex items-center justify-center gap-2.5 px-5 py-3 border border-[rgba(201,162,74,0.35)] rounded-lg text-[#F5EFE7] font-sans text-[12px] md:text-[13px] uppercase tracking-[0.12em] font-medium hover:bg-[rgba(201,162,74,0.1)] hover:border-[#C9A24A] hover:text-[#C9A24A] transition-all duration-300"
            >
              {/* WhatsApp SVG icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24A" className="flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t('contact.ctaWhatsApp')}
            </a>
          </div>
        </div>

        {/* Right Side: Map */}
        <div ref={mapRef} className="relative aspect-square lg:aspect-[4/3] rounded-lg overflow-hidden border border-[rgba(201,162,74,0.15)] z-10 shadow-2xl">
          <iframe
            src="https://maps.google.com/maps?q=Tabjul+Prabhakar+Gupta+Jewellers,Dharmavaram&t=&z=17&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
            title={t('contact.mapTitle')}
          />
        </div>

      </div>
    </section>
  );
}
