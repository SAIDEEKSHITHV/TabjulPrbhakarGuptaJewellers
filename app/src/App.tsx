import { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import { initAnalytics, trackPageView } from './lib/analytics';
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

// Lazy-loaded routes for code splitting
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogArticlePage = lazy(() => import('./pages/BlogArticlePage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const GoldRatePage = lazy(() => import('./pages/GoldRatePage'));
const CollectionDetailPage = lazy(() => import('./pages/CollectionDetailPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col justify-center items-center text-[#F5EFE7]">
      <div className="w-8 h-8 border-2 border-[#C9A24A] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-mono text-xs uppercase tracking-widest text-[#B8B0A8]">
        Loading Masterpiece...
      </p>
    </div>
  );
}

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

gsap.registerPlugin(ScrollTrigger);

function HomePage() {
  useEffect(() => {
    let globalSnapTrigger: ScrollTrigger | null = null;

    const setupSnap = () => {
      if (globalSnapTrigger) {
        globalSnapTrigger.kill();
        globalSnapTrigger = null;
      }

      // Create global snap with dynamic snapTo calculations
      globalSnapTrigger = ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const maxScroll = ScrollTrigger.maxScroll(window);
            if (!maxScroll) return value;

            // Get all pinned ScrollTriggers dynamically, excluding the global snap trigger itself
            const pinned = ScrollTrigger.getAll()
              .filter(st => !!st.vars.pin && st !== globalSnapTrigger)
              .sort((a, b) => a.start - b.start);

            if (pinned.length === 0) return value;

            // Build ranges and snap targets dynamically from current ScrollTriggers
            const pinnedRanges = pinned.map(st => {
              const start = st.start / maxScroll;
              const end = (st.end ?? st.start) / maxScroll;
              const len = end - start;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      if (globalSnapTrigger) {
        globalSnapTrigger.kill();
      }
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
      <AnalyticsTracker />
      <Navigation />

      <div className={`lang-container ${isSwitching ? 'lang-switching' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/blog"
            element={
              <Suspense fallback={<PageLoader />}>
                <BlogPage />
              </Suspense>
            }
          />
          <Route
            path="/blog/:slug"
            element={
              <Suspense fallback={<PageLoader />}>
                <BlogArticlePage />
              </Suspense>
            }
          />
          <Route
            path="/privacy"
            element={
              <Suspense fallback={<PageLoader />}>
                <PrivacyPage />
              </Suspense>
            }
          />
          <Route
            path="/gold-rate-dharmavaram"
            element={
              <Suspense fallback={<PageLoader />}>
                <GoldRatePage />
              </Suspense>
            }
          />
          <Route
            path="/collections/:slug"
            element={
              <Suspense fallback={<PageLoader />}>
                <CollectionDetailPage />
              </Suspense>
            }
          />
          <Route
            path="/products/:slug"
            element={
              <Suspense fallback={<PageLoader />}>
                <ProductDetailPage />
              </Suspense>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
