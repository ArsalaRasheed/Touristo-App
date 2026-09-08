import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  MapPin,
  Search,
  Star
} from 'lucide-react';

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
          Number(b.rating_score || b.avgRating || 0) -
          Number(a.rating_score || a.avgRating || 0)
      );
  }, [hosts, query]);

  const getInitial = (name) =>
    name?.trim()?.charAt(0)?.toUpperCase() || 'T';

  const getBadgeClass = (badge) => {
    switch (badge) {
      case 'Top Rated':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';

      case 'Highly Recommended':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';

      case 'Rising Host':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';

      case 'Trusted Operator':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';

      default:
        return 'bg-[color:var(--surface-secondary)] text-[color:var(--text-secondary)] border-[color:var(--border-primary)]';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] p-4">
        <div className="max-w-6xl mx-auto animate-pulse">

          <div className="h-10 w-72 bg-[color:var(--surface-secondary)] rounded-xl mb-6" />

          <div className="h-14 bg-[color:var(--surface-secondary)] rounded-2xl mb-8" />

          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-48 bg-[color:var(--surface-secondary)] rounded-3xl"
              />
            ))}
          </div>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">
            Unable to Load Search
          </h2>

          <p className="text-[color:var(--text-secondary)] mb-5">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="px-5 py-3 rounded-xl bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] font-bold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] pb-24">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black">
            Find Your Perfect Trip
          </h1>

          <p className="mt-2 text-[color:var(--text-secondary)]">
            Search destinations, packages and trusted tour operators.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-secondary)]"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destinations, packages, tour companies..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-9">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => toggleFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition border ${
                selectedFilters.includes(filter)
                  ? 'bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] border-[color:var(--accent-primary)]'
                  : 'bg-[color:var(--surface-primary)] text-[color:var(--text-secondary)] border-[color:var(--border-primary)] hover:text-[color:var(--text-primary)]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Packages */}
        <section className="mb-12">

          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black">
                Tour Packages
              </h2>

              <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                {filteredPackages.length} package
                {filteredPackages.length === 1 ? '' : 's'} found
              </p>
            </div>
          </div>

          {filteredPackages.length === 0 ? (
            <div className="bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-3xl p-10 text-center">
              <p className="font-semibold">
                No packages found
              </p>

              <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                Try another search.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

              {filteredPackages.map((pkg) => (
                <Link
                  key={pkg.id}
                  to={`/package/${pkg.id}`}
                  className="group"
                >
                  <article className="h-full bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition">

                    <div className="h-44 overflow-hidden">
                      <img
                        src={
                          pkg.image ||
                          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=85'
                        }
                        alt={pkg.title || 'Tour package'}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>

                    <div className="p-5">

                      <div className="flex items-center gap-1 text-sm mb-2">
                        <Star
                          size={15}
                          className="text-amber-500"
                          fill="currentColor"
                        />

                        <span className="font-bold">
                          {Number(
                            pkg.avg_rating || pkg.rating || 0
                          ).toFixed(1)}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg line-clamp-2">
                        {pkg.title || 'Tour Package'}
                      </h3>

                      <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                        {pkg.host_name || 'Tour Operator'}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <span className="font-black text-[color:var(--accent-primary)]">
                          PKR {Number(pkg.price || 0).toLocaleString()}
                        </span>

                        <span className="text-sm text-[color:var(--text-secondary)]">
                          {pkg.duration_days || 0} days
                        </span>
                      </div>

                    </div>
                  </article>
                </Link>
              ))}

            </div>
          )}

        </section>

        {/* Tour Companies */}
        <section>

          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black">
                Trusted Tour Operators
              </h2>

              <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                {filteredHosts.length} operator
                {filteredHosts.length === 1 ? '' : 's'} found
              </p>
            </div>

            <Link
              to="/host-discovery"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[color:var(--accent-primary)]"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          {filteredHosts.length === 0 ? (
            <div className="bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-3xl p-10 text-center">
              <p className="font-semibold">
                No tour operators found
              </p>

              <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                Try another company name or location.
              </p>
            </div>
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
                    className="group"
                  >
                    <article className="h-full bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-3xl p-6 hover:-translate-y-1 hover:shadow-xl transition">

                      <div className="flex items-start gap-4">

                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[color:var(--accent-primary)] to-[color:var(--accent-primary-hover)] flex items-center justify-center text-white font-black text-2xl shrink-0">
                          {getInitial(host.company_name)}
                        </div>

                        <div className="flex-1 min-w-0">

                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-lg truncate">
                              {host.company_name || 'Tour Operator'}
                            </h3>

                            {host.verified && (
                              <BadgeCheck
                                size={18}
                                className="text-[color:var(--accent-primary)] shrink-0"
                              />
                            )}
                          </div>

                          {host.location && (
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-[color:var(--text-secondary)]">
                              <MapPin size={14} />
                              {host.location}
                            </div>
                          )}

                        </div>

                        <ArrowRight
                          size={20}
                          className="text-[color:var(--text-secondary)] group-hover:text-[color:var(--accent-primary)] group-hover:translate-x-1 transition"
                        />

                      </div>

                      {host.ranking_badge && (
                        <div className="mt-5">
                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full border text-xs font-bold ${getBadgeClass(
                              host.ranking_badge
                            )}`}
                          >
                            {host.ranking_badge}
                          </span>
                        </div>
                      )}

                      <p className="mt-4 text-sm text-[color:var(--text-secondary)] leading-6 line-clamp-2">
                        {host.description ||
                          'Explore packages and travel experiences from this trusted operator.'}
                      </p>

                      <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[color:var(--border-primary)]">

                        <div>
                          <div className="flex items-center gap-1.5">
                            <Star
                              size={15}
                              className="text-amber-500"
                              fill="currentColor"
                            />
                            <span className="font-bold">
                              {rating.toFixed(1)}
                            </span>
                          </div>

                          <p className="text-xs text-[color:var(--text-secondary)] mt-1">
                            Rating
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <BriefcaseBusiness
                              size={15}
                              className="text-[color:var(--accent-primary)]"
                            />
                            <span className="font-bold">
                              {packageCount}
                            </span>
                          </div>

                          <p className="text-xs text-[color:var(--text-secondary)] mt-1">
                            Packages
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <Clock3
                              size={15}
                              className="text-[color:var(--accent-primary)]"
                            />
                            <span className="font-bold">
                              {host.avgResponseTime
                                ? `${host.avgResponseTime}h`
                                : '—'}
                            </span>
                          </div>

                          <p className="text-xs text-[color:var(--text-secondary)] mt-1">
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

export default SearchScreen;