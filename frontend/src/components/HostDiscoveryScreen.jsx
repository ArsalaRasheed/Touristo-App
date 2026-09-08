import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Users
} from 'lucide-react';

const HostDiscoveryScreen = () => {
  const [hosts, setHosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/hosts');

        if (!response.ok) {
          throw new Error(`Unable to load tour operators (${response.status})`);
        }

        const data = await response.json();

        const fetchedHosts =
          data?.data?.hosts ||
          data?.hosts ||
          [];

        setHosts(Array.isArray(fetchedHosts) ? fetchedHosts : []);
      } catch (err) {
        console.error('Error fetching hosts:', err);
        setError(
          err.message || 'Unable to load tour operators.'
        );
        setHosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHosts();
  }, []);

  const filteredHosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

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
  }, [hosts, searchQuery]);

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
      <div className="min-h-screen bg-[color:var(--bg-primary)] pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-pulse">

          <div className="h-10 w-72 rounded-xl bg-[color:var(--surface-secondary)] mb-3" />

          <div className="h-5 w-96 max-w-full rounded bg-[color:var(--surface-secondary)] mb-8" />

          <div className="h-14 rounded-2xl bg-[color:var(--surface-secondary)] mb-8" />

          <div className="grid md:grid-cols-2 gap-5">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-52 rounded-3xl bg-[color:var(--surface-secondary)]"
              />
            ))}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] pb-24">

      {/* Header */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[color:var(--accent-primary)]/10 text-[color:var(--accent-primary)] text-xs font-bold mb-3">
              <ShieldCheck size={15} />
              Trusted Marketplace
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Find Trusted Tour Operators
            </h1>

            <p className="mt-2 text-[color:var(--text-secondary)] max-w-2xl">
              Compare verified and highly-rated tour companies before choosing your next Pakistan adventure.
            </p>
          </div>

          <div className="text-sm text-[color:var(--text-secondary)]">
            {hosts.length} operators available
          </div>

        </div>

        {/* Search */}
        <div className="relative mt-7">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-secondary)]"
          />

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tour companies or locations..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] shadow-sm"
          />
        </div>

      </section>

      {/* Error */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-500">
            {error}
          </div>
        </div>
      )}

      {/* Operators */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-7">

        {filteredHosts.length === 0 ? (
          <div className="text-center py-20">

            <div className="w-16 h-16 rounded-2xl bg-[color:var(--surface-secondary)] flex items-center justify-center mx-auto mb-5">
              <BriefcaseBusiness
                size={28}
                className="text-[color:var(--text-secondary)]"
              />
            </div>

            <h2 className="text-xl font-bold">
              No tour operators found
            </h2>

            <p className="text-[color:var(--text-secondary)] mt-2">
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
                  <article className="h-full bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-3xl p-6 hover:-translate-y-1 hover:shadow-xl transition duration-300">

                    {/* Top */}
                    <div className="flex items-start gap-4">

                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[color:var(--accent-primary)] to-[color:var(--accent-primary-hover)] flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-lg">
                        {getInitial(host.company_name)}
                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="font-black text-lg truncate">
                            {host.company_name || 'Tour Operator'}
                          </h2>

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

                    {/* Badge */}
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

                    {/* Description */}
                    <p className="mt-4 text-sm leading-6 text-[color:var(--text-secondary)] line-clamp-2">
                      {host.description ||
                        'Explore travel packages and experiences from this tour operator.'}
                    </p>

                    {/* Stats */}
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

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-5">

                      <span className="text-sm font-bold text-[color:var(--accent-primary)]">
                        View company
                      </span>

                      <div className="flex items-center gap-1 text-xs text-[color:var(--text-secondary)]">
                        <Users size={14} />
                        Trusted marketplace
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
  );
};

export default HostDiscoveryScreen;