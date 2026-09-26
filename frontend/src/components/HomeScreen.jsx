import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HomeScreen = () => {
  const [recommendedPackages, setRecommendedPackages] = useState([]);
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  const heroImage =
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2200&q=85';

  const fallbackImage =
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80';

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Fetch homepage data from backend
  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        const response = await fetch('/api/homepage-data');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setRecommendedPackages(
          data.data?.recommendedPackages || []
        );

        setFeaturedPackages(
          data.data?.featuredPackages || []
        );

        setPopularDestinations(
          data.data?.popularDestinations || []
        );
      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[28px] p-8 shadow-[var(--shadow-md)] text-center">
            <div className="mx-auto w-11 h-11 rounded-full border-2 border-[color:var(--brand-primary-soft)] border-t-[color:var(--brand-primary)] animate-spin" />

            <h2 className="mt-6 text-lg font-semibold text-[color:var(--text-primary)]">
              Preparing your journey
            </h2>

            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
              Discovering destinations and experiences for you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[28px] p-8 shadow-[var(--shadow-md)] text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-[color:var(--danger-soft)] flex items-center justify-center text-[color:var(--danger)] text-xl">
              !
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[color:var(--text-primary)]">
              We couldn't load your journey
            </h2>

            <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
              Something went wrong while loading destinations and packages.
              Please try again.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary mt-6 w-full sm:w-auto"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative min-h-[92vh] lg:min-h-[94vh] overflow-hidden">

        {/* Hero image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Mountain landscape in Pakistan"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/65" />

          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/10" />
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="relative z-30 px-5 sm:px-8 lg:px-10 pt-5 lg:pt-7">
          <div className="max-w-7xl mx-auto">

            <div className="flex items-center justify-between">

              {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-[color:var(--brand-gold)] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <span className="text-lg font-bold text-[#1E241F]">
                    T
                  </span>
                </div>

                <div>
                  <div className="text-xl font-semibold tracking-tight text-white">
                    Touristo
                  </div>

                  <div className="hidden sm:block text-[10px] tracking-[0.2em] uppercase text-white/65">
                    Explore Pakistan
                  </div>
                </div>
              </Link>

              {/* Desktop navigation */}
              <div className="hidden md:flex items-center gap-7 lg:gap-9">

                <Link
                  to="/destinations"
                  className="text-sm font-medium text-white/90 hover:text-white transition-colors"
                >
                  Destinations
                </Link>

                <Link
                  to="/experiences"
                  className="text-sm font-medium text-white/90 hover:text-white transition-colors"
                >
                  Experiences
                </Link>

                <Link
                  to="/about"
                  className="text-sm font-medium text-white/90 hover:text-white transition-colors"
                >
                  About
                </Link>

                <Link
                  to="/contact"
                  className="text-sm font-medium text-white/90 hover:text-white transition-colors"
                >
                  Contact
                </Link>

                <Link
                  to="/destinations"
                  className="inline-flex items-center justify-center min-h-10 px-5 rounded-full bg-white text-[color:var(--brand-primary)] text-sm font-semibold hover:bg-[color:var(--brand-gold-light)] transition-colors"
                >
                  Start Exploring
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center text-lg"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/30 shadow-[var(--shadow-lg)] overflow-hidden">
                <div className="p-3 flex flex-col">

                  <Link
                    to="/destinations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-[color:var(--text-primary)] hover:bg-[color:var(--brand-primary-soft)] transition"
                  >
                    Destinations
                  </Link>

                  <Link
                    to="/experiences"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-[color:var(--text-primary)] hover:bg-[color:var(--brand-primary-soft)] transition"
                  >
                    Experiences
                  </Link>

                  <Link
                    to="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-[color:var(--text-primary)] hover:bg-[color:var(--brand-primary-soft)] transition"
                  >
                    About
                  </Link>

                  <Link
                    to="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-[color:var(--text-primary)] hover:bg-[color:var(--brand-primary-soft)] transition"
                  >
                    Contact
                  </Link>

                  <Link
                    to="/destinations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 px-4 py-3 rounded-xl bg-[color:var(--brand-primary)] text-white text-sm font-semibold text-center"
                  >
                    Start Exploring
                  </Link>

                </div>
              </div>
            )}
          </div>
        </nav>

        {/* =================================================
            HERO CONTENT
        ================================================= */}

        <div className="relative z-20 min-h-[calc(92vh-88px)] lg:min-h-[calc(94vh-100px)] flex items-center px-5 sm:px-8 lg:px-10 pb-16">

          <div className="max-w-7xl mx-auto w-full">

            <div className="max-w-4xl">

              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs sm:text-sm font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--brand-gold)]" />
                Curated journeys across Pakistan
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[76px] font-semibold tracking-[-0.045em] leading-[0.98] text-white max-w-4xl">
                Discover Pakistan,
                <span className="block text-[color:var(--brand-gold-light)]">
                  your way.
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl leading-8 text-white/80">
                Explore remarkable destinations, trusted tour operators,
                and experiences designed around the way you want to travel.
              </p>

              {/* CTA */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">

                <Link
                  to="/destinations"
                  className="inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-white text-[color:var(--brand-primary)] text-sm sm:text-base font-semibold hover:bg-[color:var(--brand-gold-light)] transition-colors shadow-lg"
                >
                  Explore Destinations
                  <span className="ml-2">→</span>
                </Link>

                <Link
                  to="/host-discovery"
                  className="inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-white/10 backdrop-blur-md border border-white/25 text-white text-sm sm:text-base font-semibold hover:bg-white/15 transition-colors"
                >
                  Find Trusted Operators
                </Link>

              </div>

            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="mt-12 max-w-3xl">

              <form
                onSubmit={handleSearch}
                className="relative"
              >
                <div className="flex items-center bg-white rounded-2xl shadow-[var(--shadow-lg)] p-1.5">

                  <div className="flex-1 flex items-center min-w-0">

                    <div className="w-11 h-11 ml-1 flex items-center justify-center text-[color:var(--brand-primary)]">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search destinations, packages, or experiences..."
                      className="flex-1 min-w-0 h-12 bg-transparent border-0 outline-none text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] text-sm sm:text-base"
                    />

                  </div>

                  <button
                    type="submit"
                    className="hidden sm:inline-flex items-center justify-center min-h-12 px-6 rounded-xl bg-[color:var(--brand-primary)] text-white text-sm font-semibold hover:bg-[color:var(--brand-primary-hover)] transition-colors"
                  >
                    Search
                  </button>

                </div>
              </form>

            </div>

          </div>
        </div>

        {/* Bottom scroll indicator */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 hidden sm:flex flex-col items-center gap-2 text-white/60">
          <span className="text-[10px] uppercase tracking-[0.25em]">
            Explore
          </span>

          <div className="w-px h-8 bg-gradient-to-b from-white/60 to-transparent" />
        </div>

      </section>

      {/* =====================================================
          RECOMMENDED
      ===================================================== */}

      {recommendedPackages.length > 0 && (
        <section className="py-16 sm:py-20 px-5 sm:px-8 bg-[color:var(--bg-primary)]">

          <div className="max-w-7xl mx-auto">

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">

              <div>
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[color:var(--brand-gold)]">
                  Curated for you
                </span>

                <h2 className="mt-2 text-3xl md:text-4xl font-semibold">
                  Recommended journeys
                </h2>

                <p className="mt-2 text-sm sm:text-base text-[color:var(--text-secondary)]">
                  Experiences worth discovering.
                </p>
              </div>

              <Link
                to="/destinations"
                className="link font-semibold text-sm"
              >
                View all →
              </Link>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {recommendedPackages.map((pkg) => (

                <Link
                  to={`/package/${pkg.id}`}
                  key={pkg.id}
                  className="group"
                >

                  <article className="bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[20px] overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-300 h-full">

                    <div className="relative h-52 overflow-hidden">

                      <img
                        src={pkg.image || fallbackImage}
                        alt={pkg.title || 'Tour package'}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                        loading="lazy"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {pkg.comparisonBadge === 'Top Match' && (
                        <div className="absolute top-3 left-3 badge badge-gold shadow-sm">
                          Top Match
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/35 backdrop-blur-md text-white text-xs">
                        <span className="text-[color:var(--brand-gold-light)]">
                          ★
                        </span>

                        <span className="font-medium">
                          {pkg.avg_rating || pkg.rating || 0}
                        </span>
                      </div>

                    </div>

                    <div className="p-5">

                      <p className="text-xs font-medium text-[color:var(--text-muted)] truncate">
                        {pkg.host_name || 'Trusted host'}
                      </p>

                      <h3 className="mt-1.5 text-base font-semibold truncate">
                        {pkg.title}
                      </h3>

                      <div className="mt-4 flex items-end justify-between gap-3">

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-[color:var(--text-muted)]">
                            From
                          </p>

                          <p className="mt-0.5 font-semibold text-[color:var(--brand-primary)]">
                            PKR {parseInt(pkg.price || 0).toLocaleString()}
                          </p>
                        </div>

                        <span className="text-xs text-[color:var(--text-secondary)]">
                          {pkg.duration_days || 0} days
                        </span>

                      </div>

                    </div>

                  </article>

                </Link>

              ))}

            </div>

          </div>

        </section>
      )}

      {/* =====================================================
          DESTINATIONS
      ===================================================== */}

      <section className="py-16 sm:py-20 px-5 sm:px-8 bg-[color:var(--surface-primary)]">

        <div className="max-w-7xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-10">

            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[color:var(--brand-gold)]">
              Start somewhere unforgettable
            </span>

            <h2 className="mt-2 text-3xl md:text-4xl font-semibold">
              Popular destinations
            </h2>

            <p className="mt-3 text-sm sm:text-base text-[color:var(--text-secondary)]">
              From high-altitude valleys to coastal escapes, discover places
              that make every journey memorable.
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {popularDestinations.map((destination, index) => {

              const packageId = destination.packages?.[0]?.id;

              return (
                <Link
                  key={destination.id || index}
                  to={packageId ? `/package/${packageId}` : '/destinations'}
                  className="group"
                >

                  <article className="relative h-[360px] rounded-[24px] overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-shadow duration-300">

                    <img
                      src={
                        destination.packages?.[0]?.image ||
                        fallbackImage
                      }
                      alt={destination.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                    <div className="absolute left-5 right-5 bottom-5 text-white">

                      <div className="flex items-center justify-between gap-3">

                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {destination.name}
                          </h3>

                          <p className="mt-1 text-sm text-white/70">
                            {destination.packageCount || 0} packages
                          </p>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-[color:var(--brand-primary)] transition-colors">
                          →
                        </div>

                      </div>

                    </div>

                  </article>

                </Link>
              );
            })}

          </div>

          <div className="text-center mt-10">

            <Link
              to="/destinations"
              className="btn btn-secondary"
            >
              Explore all destinations
              <span>→</span>
            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          FEATURED EXPERIENCES
      ===================================================== */}

      {featuredPackages.length > 0 && (
        <section className="py-16 sm:py-20 px-5 sm:px-8 bg-[color:var(--bg-secondary)]">

          <div className="max-w-7xl mx-auto">

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">

              <div>
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[color:var(--brand-gold)]">
                  Handpicked
                </span>

                <h2 className="mt-2 text-3xl md:text-4xl font-semibold">
                  Featured experiences
                </h2>
              </div>

              <Link
                to="/destinations"
                className="link font-semibold text-sm"
              >
                Discover more →
              </Link>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {featuredPackages.slice(0, 6).map((pkg) => (

                <Link
                  key={pkg.id}
                  to={`/package/${pkg.id}`}
                  className="group"
                >

                  <article className="bg-[color:var(--surface-primary)] rounded-[22px] overflow-hidden border border-[color:var(--border-light)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-300">

                    <div className="relative h-56 overflow-hidden">

                      <img
                        src={pkg.image || fallbackImage}
                        alt={pkg.title || 'Featured experience'}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                        loading="lazy"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">

                        <div className="text-white">

                          <p className="text-xs text-white/70">
                            {pkg.host_name || 'Trusted host'}
                          </p>

                          <h3 className="mt-1 text-lg font-semibold text-white">
                            {pkg.title}
                          </h3>

                        </div>

                        {pkg.avg_rating || pkg.rating ? (
                          <div className="shrink-0 px-2.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs">
                            ★ {pkg.avg_rating || pkg.rating}
                          </div>
                        ) : null}

                      </div>

                    </div>

                    <div className="p-5 flex items-center justify-between gap-4">

                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[color:var(--text-muted)]">
                          From
                        </p>

                        <p className="mt-0.5 font-semibold text-[color:var(--brand-primary)]">
                          PKR {parseInt(pkg.price || 0).toLocaleString()}
                        </p>
                      </div>

                      <span className="text-sm font-medium text-[color:var(--text-secondary)] group-hover:text-[color:var(--brand-primary)] transition-colors">
                        View experience →
                      </span>

                    </div>

                  </article>

                </Link>

              ))}

            </div>

          </div>

        </section>
      )}

      {/* =====================================================
          TRUST / BRAND STATEMENT
      ===================================================== */}

      <section className="px-5 sm:px-8 py-16 sm:py-20 bg-[color:var(--brand-primary)] text-white">

        <div className="max-w-5xl mx-auto text-center">

          <span className="text-xs uppercase tracking-[0.25em] text-[color:var(--brand-gold-light)] font-semibold">
            Travel with confidence
          </span>

          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight">
            Your journey should feel
            <span className="block text-[color:var(--brand-gold-light)]">
              effortless.
            </span>
          </h2>

          <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-base leading-7 text-white/70">
            Discover destinations, compare experiences, connect with hosts,
            and plan your trip from one place.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row justify-center gap-3">

            <Link
              to="/destinations"
              className="inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-white text-[color:var(--brand-primary)] font-semibold hover:bg-[color:var(--brand-gold-light)] transition-colors"
            >
              Explore Pakistan
            </Link>

            <Link
              to="/ai-planner"
              className="inline-flex items-center justify-center min-h-12 px-7 rounded-full border border-white/25 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Plan with AI
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
};

export default HomeScreen;