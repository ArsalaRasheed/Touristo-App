import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  MapPin,
  Search,
  Star,
  SlidersHorizontal,
  X
} from 'lucide-react';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=85';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [packages, setPackages] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = ['Price', 'Region', 'Category', 'Duration'];

  const toggleFilter = (filter) => {
    setSelectedFilters((current) =>
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [packagesResponse, hostsResponse] = await Promise.all([
          fetch('/api/packages'),
          fetch('/api/hosts')
        ]);

        if (!packagesResponse.ok) {
          throw new Error(
            `Unable to load packages (${packagesResponse.status})`
          );
        }

        if (!hostsResponse.ok) {
          throw new Error(
            `Unable to load tour operators (${hostsResponse.status})`
          );
        }

        const packagesData = await packagesResponse.json();
        const hostsData = await hostsResponse.json();

        setPackages(
          packagesData?.data?.packages ||
            packagesData?.packages ||
            []
        );

        setHosts(
          hostsData?.data?.hosts ||
            hostsData?.hosts ||
            []
        );
      } catch (err) {
        console.error('Search data error:', err);

        setError(
          err.message || 'Unable to load search results.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const query = searchQuery.trim().toLowerCase();

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      if (!query) return true;

      return (
        String(pkg.title || '')
          .toLowerCase()
          .includes(query) ||
        String(pkg.destination || '')
          .toLowerCase()
          .includes(query) ||
        String(pkg.location || '')
          .toLowerCase()
          .includes(query) ||
        String(pkg.host_name || '')
          .toLowerCase()
          .includes(query)
      );
    });
  }, [packages, query]);

  const filteredHosts = useMemo(() => {
    return hosts
      .filter((host) => {
        if (!query) return true;

        return (
          String(host.company_name || '')
            .toLowerCase()
            .includes(query) ||
          String(host.description || '')
            .toLowerCase()
            .includes(query) ||
          String(host.location || '')
            .toLowerCase()
            .includes(query)
        );
      })
      .sort(
        (a, b) =>
          Number(
            b.rating_score || b.avgRating || 0
          ) -
          Number(
            a.rating_score || a.avgRating || 0
          )
      );
  }, [hosts, query]);

  const getInitial = (name) =>
    name?.trim()?.charAt(0)?.toUpperCase() || 'T';

  const getBadgeClass = (badge) => {
    switch (badge) {
      case 'Top Rated':
        return 'bg-[color:var(--brand-gold-soft)] text-[color:var(--brand-gold)] border-[color:var(--brand-gold-light)]';

      case 'Highly Recommended':
        return 'bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] border-[color:var(--brand-primary-soft)]';

      case 'Rising Host':
        return 'bg-[color:var(--success-soft)] text-[color:var(--success)] border-[color:var(--success-soft)]';

      case 'Trusted Operator':
        return 'bg-[color:var(--brand-gold-soft)] text-[color:var(--brand-primary)] border-[color:var(--brand-gold-light)]';

      default:
        return 'bg-[color:var(--surface-secondary)] text-[color:var(--text-secondary)] border-[color:var(--border-light)]';
    }
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] pb-24">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          <div className="animate-pulse">

            <div className="h-3 w-24 rounded-full bg-[color:var(--surface-secondary)] mb-3" />

            <div className="h-10 w-72 max-w-full rounded-xl bg-[color:var(--surface-secondary)] mb-3" />

            <div className="h-5 w-96 max-w-full rounded-lg bg-[color:var(--surface-secondary)] mb-8" />

            <div className="h-16 rounded-2xl bg-[color:var(--surface-secondary)] mb-5" />

            <div className="flex gap-2 mb-10">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-10 w-24 rounded-full bg-[color:var(--surface-secondary)]"
                />
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-80 rounded-[24px] bg-[color:var(--surface-secondary)]"
                />
              ))}

            </div>

          </div>

        </div>

      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center px-5 pb-24">

        <div className="w-full max-w-md bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[28px] p-8 text-center shadow-[var(--shadow-md)]">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-[color:var(--danger-soft)] text-[color:var(--danger)] flex items-center justify-center text-xl font-bold">
            !
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            Unable to Load Search
          </h2>

          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary mt-6"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] pb-24">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="mb-7">

          <div className="flex items-end justify-between gap-4">

            <div>

              <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[color:var(--brand-gold)]">
                Discover
              </p>

              <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
                Find your next journey
              </h1>

              <p className="mt-2 max-w-2xl text-sm sm:text-base text-[color:var(--text-secondary)]">
                Search destinations, curated packages, and trusted tour operators.
              </p>

            </div>

          </div>

        </header>

        {/* =====================================================
            SEARCH BAR
        ===================================================== */}

        <div className="relative mb-5">

          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] flex items-center justify-center pointer-events-none">

            <Search size={19} />

          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destinations, packages, tour companies..."
            className="w-full h-16 pl-[68px] pr-12 rounded-[22px] bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] shadow-[var(--shadow-sm)] outline-none text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--brand-primary)] focus:ring-4 focus:ring-[color:var(--brand-primary-soft)] transition"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[color:var(--surface-secondary)] text-[color:var(--text-secondary)] flex items-center justify-center hover:text-[color:var(--text-primary)] transition"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}

        </div>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-9 scrollbar-hide">

          <div className="shrink-0 flex items-center gap-2 px-3.5 h-10 rounded-full bg-[color:var(--surface-secondary)] border border-[color:var(--border-light)] text-xs font-semibold text-[color:var(--text-secondary)]">

            <SlidersHorizontal size={14} />

            Filters

          </div>

          {filters.map((filter) => {

            const active =
              selectedFilters.includes(filter);

            return (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className={`shrink-0 h-10 px-4 rounded-full text-xs sm:text-sm font-semibold transition border ${
                  active
                    ? 'bg-[color:var(--brand-primary)] text-white border-[color:var(--brand-primary)] shadow-[var(--shadow-sm)]'
                    : 'bg-[color:var(--surface-primary)] text-[color:var(--text-secondary)] border-[color:var(--border-light)] hover:border-[color:var(--brand-primary)] hover:text-[color:var(--brand-primary)]'
                }`}
              >
                {filter}
              </button>
            );
          })}

          {selectedFilters.length > 0 && (
            <button
              onClick={clearFilters}
              className="shrink-0 h-10 px-4 rounded-full text-xs sm:text-sm font-semibold text-[color:var(--danger)] hover:bg-[color:var(--danger-soft)] transition"
            >
              Clear
            </button>
          )}

        </div>

        {/* =====================================================
            TOUR PACKAGES
        ===================================================== */}

        <section className="mb-14">

          <div className="flex items-end justify-between gap-4 mb-5">

            <div>

              <p className="text-xs uppercase tracking-[0.18em] font-semibold text-[color:var(--brand-gold)]">
                Experiences
              </p>

              <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight">
                Tour Packages
              </h2>

              <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                {filteredPackages.length}{' '}
                {filteredPackages.length === 1
                  ? 'package'
                  : 'packages'}{' '}
                found
              </p>

            </div>

          </div>

          {filteredPackages.length === 0 ? (
            <EmptyState
              title="No packages found"
              description="Try a different destination, package name, or search term."
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {filteredPackages.map((pkg) => (

                <Link
                  key={pkg.id}
                  to={`/package/${pkg.id}`}
                  className="group block h-full"
                >

                  <article className="h-full overflow-hidden bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[24px] shadow-[var(--shadow-sm)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all duration-300">

                    {/* Image */}

                    <div className="relative h-52 overflow-hidden bg-[color:var(--surface-secondary)]">

                      <img
                        src={pkg.image || FALLBACK_IMAGE}
                        alt={pkg.title || 'Tour package'}
                        className="w-full h-full object-cover group-hover:scale-[1.045] transition-transform duration-700"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src =
                            FALLBACK_IMAGE;
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 pointer-events-none" />

                      {/* Rating */}

                      <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/35 backdrop-blur-md text-white text-xs font-semibold">

                        <Star
                          size={13}
                          className="text-[color:var(--brand-gold-light)]"
                          fill="currentColor"
                        />

                        {Number(
                          pkg.avg_rating ||
                            pkg.rating ||
                            0
                        ).toFixed(1)}

                      </div>

                      {/* Duration */}

                      <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[color:var(--text-primary)] text-xs font-semibold">

                        <Clock3 size={13} />

                        {pkg.duration_days || 0} days

                      </div>

                    </div>

                    {/* Content */}

                    <div className="p-5">

                      <div className="flex items-center gap-2 min-w-0">

                        <div className="w-7 h-7 rounded-lg bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] flex items-center justify-center shrink-0">

                          <BriefcaseBusiness size={13} />

                        </div>

                        <p className="text-xs font-medium text-[color:var(--text-secondary)] truncate">
                          {pkg.host_name ||
                            'Tour Operator'}
                        </p>

                      </div>

                      <h3 className="mt-3 font-semibold text-lg leading-6 line-clamp-2 group-hover:text-[color:var(--brand-primary)] transition-colors">
                        {pkg.title ||
                          'Tour Package'}
                      </h3>

                      {(pkg.destination ||
                        pkg.location) && (
                        <div className="mt-2 flex items-center gap-1.5 text-sm text-[color:var(--text-secondary)]">

                          <MapPin size={14} className="shrink-0" />

                          <span className="truncate">
                            {pkg.destination ||
                              pkg.location}
                          </span>

                        </div>
                      )}

                      <div className="mt-5 pt-4 border-t border-[color:var(--border-light)] flex items-end justify-between gap-3">

                        <div>

                          <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[color:var(--text-muted)]">
                            From
                          </p>

                          <p className="mt-0.5 text-lg font-semibold text-[color:var(--brand-primary)]">
                            PKR{' '}
                            {Number(
                              pkg.price || 0
                            ).toLocaleString()}
                          </p>

                        </div>

                        <div className="w-9 h-9 rounded-full bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] flex items-center justify-center group-hover:bg-[color:var(--brand-primary)] group-hover:text-white transition-colors">

                          <ArrowRight size={16} />

                        </div>

                      </div>

                    </div>

                  </article>

                </Link>

              ))}

            </div>
          )}

        </section>

        {/* =====================================================
            TOUR OPERATORS
        ===================================================== */}

        <section>

          <div className="flex items-end justify-between gap-4 mb-5">

            <div>

              <p className="text-xs uppercase tracking-[0.18em] font-semibold text-[color:var(--brand-gold)]">
                Trusted partners
              </p>

              <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight">
                Tour Operators
              </h2>

              <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                {filteredHosts.length}{' '}
                {filteredHosts.length === 1
                  ? 'operator'
                  : 'operators'}{' '}
                found
              </p>

            </div>

            <Link
              to="/host-discovery"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--brand-primary)] hover:text-[color:var(--brand-primary-hover)]"
            >
              View all
              <ArrowRight size={15} />
            </Link>

          </div>

          {filteredHosts.length === 0 ? (
            <EmptyState
              title="No tour operators found"
              description="Try another company name or location."
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-5">

              {filteredHosts.map((host) => {

                const rating = Number(
                  host.avgRating ??
                    host.rating_score ??
                    host.rating ??
                    0
                );

                const packageCount =
                  host.packageCount ??
                  host.package_count ??
                  host.packages?.length ??
                  0;

                return (
                  <Link
                    key={host.id}
                    to={`/host-profile/${host.id}`}
                    className="group block h-full"
                  >

                    <article className="h-full bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[24px] p-5 sm:p-6 shadow-[var(--shadow-sm)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all duration-300">

                      {/* Top */}

                      <div className="flex items-start gap-4">

                        <div className="w-16 h-16 rounded-2xl bg-[color:var(--brand-primary)] flex items-center justify-center text-[color:var(--brand-gold-light)] font-semibold text-2xl shrink-0 shadow-[var(--shadow-sm)]">

                          {getInitial(
                            host.company_name
                          )}

                        </div>

                        <div className="flex-1 min-w-0">

                          <div className="flex items-center gap-2">

                            <h3 className="font-semibold text-lg truncate">
                              {host.company_name ||
                                'Tour Operator'}
                            </h3>

                            {host.verified && (
                              <BadgeCheck
                                size={18}
                                className="text-[color:var(--brand-gold)] shrink-0"
                                fill="currentColor"
                                strokeWidth={1.5}
                              />
                            )}

                          </div>

                          {host.location && (
                            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-[color:var(--text-secondary)]">

                              <MapPin size={14} />

                              <span className="truncate">
                                {host.location}
                              </span>

                            </div>
                          )}

                        </div>

                        <div className="w-9 h-9 rounded-full bg-[color:var(--surface-secondary)] text-[color:var(--text-muted)] flex items-center justify-center shrink-0 group-hover:bg-[color:var(--brand-primary-soft)] group-hover:text-[color:var(--brand-primary)] transition">

                          <ArrowRight size={16} />

                        </div>

                      </div>

                      {/* Badge */}

                      {host.ranking_badge && (
                        <div className="mt-5">

                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full border text-xs font-semibold ${getBadgeClass(
                              host.ranking_badge
                            )}`}
                          >
                            {host.ranking_badge}
                          </span>

                        </div>
                      )}

                      {/* Description */}

                      <p className="mt-4 text-sm text-[color:var(--text-secondary)] leading-6 line-clamp-2">
                        {host.description ||
                          'Explore packages and travel experiences from this tour operator.'}
                      </p>

                      {/* Stats */}

                      <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[color:var(--border-light)]">

                        <div>

                          <div className="flex items-center gap-1.5">

                            <Star
                              size={14}
                              className="text-[color:var(--brand-gold)]"
                              fill="currentColor"
                            />

                            <span className="font-semibold text-sm">
                              {rating.toFixed(1)}
                            </span>

                          </div>

                          <p className="text-[11px] text-[color:var(--text-muted)] mt-1">
                            Rating
                          </p>

                        </div>

                        <div>

                          <div className="flex items-center gap-1.5">

                            <BriefcaseBusiness
                              size={14}
                              className="text-[color:var(--brand-primary)]"
                            />

                            <span className="font-semibold text-sm">
                              {packageCount}
                            </span>

                          </div>

                          <p className="text-[11px] text-[color:var(--text-muted)] mt-1">
                            Packages
                          </p>

                        </div>

                        <div>

                          <div className="flex items-center gap-1.5">

                            <Clock3
                              size={14}
                              className="text-[color:var(--brand-primary)]"
                            />

                            <span className="font-semibold text-sm">
                              {host.avgResponseTime
                                ? `${host.avgResponseTime}h`
                                : '—'}
                            </span>

                          </div>

                          <p className="text-[11px] text-[color:var(--text-muted)] mt-1">
                            Response
                          </p>

                        </div>

                      </div>

                    </article>

                  </Link>
                );
              })}

            </div>
          )}

        </section>

      </div>

    </div>
  );
};

/* =============================================================
   EMPTY STATE
============================================================= */

const EmptyState = ({
  title,
  description
}) => {
  return (
    <div className="bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] rounded-[24px] p-10 sm:p-14 text-center shadow-[var(--shadow-sm)]">

      <div className="w-14 h-14 mx-auto rounded-2xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] flex items-center justify-center">

        <Search size={22} />

      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-[color:var(--text-secondary)] max-w-md mx-auto leading-6">
        {description}
      </p>

    </div>
  );
};

export default SearchScreen;