import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import i18n from './i18n';
import Navigation from './components/Navigation';
import HeroSection from './sections/HeroSection';
import MarqueeSection from './sections/MarqueeSection';
import CollectionsSection from './sections/CollectionsSection';
import HouseFavouritesSection from './sections/HouseFavouritesSection';
import TrustSection from './sections/TrustSection';
import LegacySection from './sections/LegacySection';
import ShowroomSection from './sections/ShowroomSection';
import GoogleReviewsSection from './sections/GoogleReviewsSection';
import BlogPreviewSection from './sections/BlogPreviewSection';
import InstagramSection from './sections/InstagramSection';
import ContactSection from './sections/ContactSection';
import LocalSeoSection from './sections/LocalSeoSection';
import FooterSection from './sections/FooterSection';
import BlogPage from './pages/BlogPage';
import BlogArticlePage from './pages/BlogArticlePage';
import PrivacyPage from './pages/PrivacyPage';
import GoldRatePage from './pages/GoldRatePage';

gsap.registerPlugin(ScrollTrigger);

function HomePage() {
  useEffect(() => {
    const setupSnap = () => {
      // Get all pinned ScrollTriggers, sorted by start position
      const pinned = ScrollTrigger.getAll()
        .filter(st => !!st.vars.pin)
        .sort((a, b) => a.start - b.start);

      const maxScroll = ScrollTrigger.maxScroll(window);

      if (!maxScroll || pinned.length === 0) return;

      // Build ranges and snap targets from pinned sections
      const pinnedRanges = pinned.map(st => {
        const start = st.start / maxScroll;
        const end = (st.end ?? st.start) / maxScroll;
        const len = end - start;
        const trigger = st.trigger as any;

        // Check if this is the legacy section
        const isLegacy = trigger && (
          (trigger instanceof HTMLElement && trigger.id === 'legacy-section') ||
          (typeof trigger === 'string' && trigger.includes('legacy-section'))
        );

        if (isLegacy) {
          // For legacy section, we define three stable snap targets:
          // 1. 1991 phase (around 15% of the pinned duration)
          // 2. Today phase (around 43% of the pinned duration)
          // 3. Stats / End phase (around 75% of the pinned duration)
          return {
            start,
            end,
            targets: [
              start + len * 0.15,
              start + len * 0.43,
              start + len * 0.75,
            ],
          };
        }

        // Standard pinned sections snap to their center
        return {
          start,
          end,
          targets: [start + len * 0.45],
        };
      });

      // Create global snap
      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            // Find the active range, including a small buffer
            const matchedRange = pinnedRanges.find(
              r => value >= r.start - 0.015 && value <= r.end + 0.015
            );

            // If not inside any pinned section, allow free scroll
            if (!matchedRange) return value;

            // Find nearest target within the matched range
            const target = matchedRange.targets.reduce(
              (closest, t) =>
                Math.abs(t - value) < Math.abs(closest - value) ? t : closest,
              matchedRange.targets[0]
            );

            return target;
          },
          duration: { min: 0.18, max: 0.45 },
          delay: 0.05, // small delay to allow natural scroll momentum before snapping
          ease: 'power2.out',
        },
      });
    };

    // Setup snap after a short delay to ensure all ScrollTriggers are created
    const timer = setTimeout(setupSnap, 500);

    // Refresh ScrollTrigger on resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      // Only kill the global snap trigger, not all triggers
      const allTriggers = ScrollTrigger.getAll();
      const globalSnap = allTriggers.find(st => st.vars.snap && !st.vars.pin);
      if (globalSnap) globalSnap.kill();
    };
  }, []);

  return (
    <main className="relative">
      {/* Section 1: Hero - z-10 */}
      <HeroSection />

      {/* Section 2: Marquee - z-20 */}
      <MarqueeSection />

      {/* Section 3: Collections - z-30 (flowing) */}
      <CollectionsSection />

      {/* Section 4: House Favourites - z-40 */}
      <HouseFavouritesSection />

      {/* Section 5: Trust - z-50 (flowing) */}
      <TrustSection />

      {/* Section 6: Legacy & Transformation - z-55 (pinned) */}
      <LegacySection />

      {/* Section 6.25: Showroom - z-56 (flowing) */}
      <ShowroomSection />

      {/* Section 6.5: Google Reviews - z-57 (flowing) */}
      <GoogleReviewsSection />

      {/* Section 7: Blog Preview - z-60 */}
      <BlogPreviewSection />

      {/* Section 8: Instagram - z-70 (flowing) */}
      <InstagramSection />

      {/* Section 8.5: Contact - z-75 (flowing) */}
      <ContactSection />

      {/* Section 8.75: Local SEO - z-77 (flowing) */}
      <LocalSeoSection />

      {/* Section 9: Footer - z-80 (flowing) */}
      <FooterSection />
    </main>
  );
}

function App() {
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    const handleChange = (e: Event) => {
      const lang = (e as CustomEvent).detail;
      if (i18n.language === lang) return;
      setIsSwitching(true);
      setTimeout(() => {
        i18n.changeLanguage(lang);
        localStorage.setItem('i18nextLng', lang);
        document.documentElement.lang = lang;
        // Let React update the text content and recalculate layouts before refreshing scroll bounds
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 50);
        setIsSwitching(false);
      }, 250);
    };
    window.addEventListener('change-language', handleChange);
    return () => window.removeEventListener('change-language', handleChange);
  }, []);

  return (
    <div className="grain-overlay relative">
      <Navigation />

      <div className={`lang-container ${isSwitching ? 'lang-switching' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogArticlePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/gold-rate-dharmavaram" element={<GoldRatePage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
