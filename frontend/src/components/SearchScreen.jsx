import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const SearchScreen = () => {
  // Read search query from URL
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [packages, setPackages] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = ["Price", "Region", "Category", "Duration"];

  // ---------------------------------------------------------
  // Load search query from URL
  // Example: /search?q=Hunza
  // ---------------------------------------------------------
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
  }, [searchParams]);

  // ---------------------------------------------------------
  // Toggle filter selection
  // ---------------------------------------------------------
  const toggleFilter = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(
        selectedFilters.filter((f) => f !== filter)
      );
    } else {
      setSelectedFilters([
        ...selectedFilters,
        filter
      ]);
    }
  };

  // ---------------------------------------------------------
  // Fetch packages and hosts from backend
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch packages
        const packagesResponse = await fetch('/api/packages');

        if (!packagesResponse.ok) {
          throw new Error(
            `Packages API error! status: ${packagesResponse.status}`
          );
        }

        const packagesData = await packagesResponse.json();

        const fetchedPackages =
          packagesData?.data?.packages || [];

        // Fetch hosts
        const hostsResponse = await fetch('/api/hosts');

        if (!hostsResponse.ok) {
          throw new Error(
            `Hosts API error! status: ${hostsResponse.status}`
          );
        }

        const hostsData = await hostsResponse.json();

        const fetchedHosts =
          hostsData?.data?.hosts || [];

        setPackages(
          Array.isArray(fetchedPackages)
            ? fetchedPackages
            : []
        );

        setHosts(
          Array.isArray(fetchedHosts)
            ? fetchedHosts
            : []
        );

      } catch (err) {
        console.error('Error fetching search data:', err);
        setError(
          err?.message ||
          'Unable to load search data.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------------------------------------------------------
  // Normalize search query
  // ---------------------------------------------------------
  const normalizedSearchQuery =
    (searchQuery || '').trim().toLowerCase();

  // ---------------------------------------------------------
  // Filter packages based on search query
  // ---------------------------------------------------------
  const filteredPackages = packages.filter((pkg) => {
    if (!normalizedSearchQuery) {
      return true;
    }

    const title =
      String(pkg?.title || '').toLowerCase();

    const destination =
      String(pkg?.destination || '').toLowerCase();

    const description =
      String(pkg?.description || '').toLowerCase();

    const category =
      String(pkg?.category || '').toLowerCase();

    const region =
      String(pkg?.region || '').toLowerCase();

    return (
      title.includes(normalizedSearchQuery) ||
      destination.includes(normalizedSearchQuery) ||
      description.includes(normalizedSearchQuery) ||
      category.includes(normalizedSearchQuery) ||
      region.includes(normalizedSearchQuery)
    );
  });

  // ---------------------------------------------------------
  // Filter hosts based on search query
  // ---------------------------------------------------------
  const filteredHosts = hosts
    .filter((host) => {
      if (!normalizedSearchQuery) {
        return true;
      }

      const companyName =
        String(host?.company_name || '').toLowerCase();

      const description =
        String(host?.description || '').toLowerCase();

      const location =
        String(host?.location || '').toLowerCase();

      return (
        companyName.includes(normalizedSearchQuery) ||
        description.includes(normalizedSearchQuery) ||
        location.includes(normalizedSearchQuery)
      );
    })
    .sort((a, b) => {
      const ratingA =
        Number(a?.rating_score);

      const ratingB =
        Number(b?.rating_score);

      const safeRatingA =
        Number.isFinite(ratingA)
          ? ratingA
          : 0;

      const safeRatingB =
        Number.isFinite(ratingB)
          ? ratingB
          : 0;

      return safeRatingB - safeRatingA;
    });

  // ---------------------------------------------------------
  // Safe rating formatter
  // ---------------------------------------------------------
  const formatRating = (rating) => {
    const numericRating = Number(rating);

    if (!Number.isFinite(numericRating)) {
      return '0.0';
    }

    return numericRating.toFixed(1);
  };

  // ---------------------------------------------------------
  // Safe price formatter
  // ---------------------------------------------------------
  const formatPrice = (price) => {
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      return '0';
    }

    return Math.round(numericPrice).toLocaleString();
  };

  // ---------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">

        <div className="text-center">

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--accent-primary)] mx-auto"></div>

          <p className="mt-4 text-[color:var(--text-secondary)]">
            Searching packages...
          </p>

        </div>

      </div>
    );
  }

  // ---------------------------------------------------------
  // Error state
  // ---------------------------------------------------------
  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">

        <div className="text-center p-6 bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-primary)] max-w-md">

          <h2 className="text-xl font-bold mb-2 text-red-500">
            Error Loading Data
          </h2>

          <p className="text-[color:var(--text-secondary)] mb-4">
            Failed to load packages: {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-2 px-4 rounded-lg"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // ---------------------------------------------------------
  // Main Search Screen
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 pb-24">

      <div className="max-w-4xl mx-auto">

        {/* Page Title */}
        <h1 className="text-2xl font-bold mb-6 text-[color:var(--text-primary)]">
          Find Your Perfect Trip
        </h1>

        {/* -------------------------------------------------
            Search Bar
        -------------------------------------------------- */}
        <div className="mb-6">

          <div className="relative">

            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search destinations, activities, or keywords..."
              className="w-full p-4 pl-12 rounded-xl bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
            />

            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[color:var(--text-secondary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

          </div>

        </div>

        {/* -------------------------------------------------
            Filter Chips
        -------------------------------------------------- */}
        <div className="flex flex-wrap gap-2 mb-6">

          {filters.map((filter) => (

            <button
              key={filter}
              onClick={() =>
                toggleFilter(filter)
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedFilters.includes(filter)
                  ? 'bg-[color:var(--accent-primary)] text-[color:var(--nav-text)]'
                  : 'bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] hover:bg-[color:var(--surface-primary)]'
              }`}
            >
              {filter}
            </button>

          ))}

        </div>

        {/* -------------------------------------------------
            Search Results
        -------------------------------------------------- */}
        <div className="space-y-8">

          {/* =================================================
              PACKAGE RESULTS
          ================================================== */}
          <div>

            <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">
              Package Results
            </h2>

            {filteredPackages.length === 0 ? (

              <div className="text-center py-6">

                <div className="text-5xl mb-4">
                  🔍
                </div>

                <h3 className="text-xl font-bold mb-2 text-[color:var(--text-primary)]">
                  No packages found
                </h3>

                <p className="text-[color:var(--text-secondary)] mb-6">
                  Try adjusting your search or check back later for new listings.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {filteredPackages.map((pkg) => (

                  <Link
                    to={`/package/${pkg?.id}`}
                    key={pkg?.id}
                    className="block"
                  >

                    <div className="bg-[color:var(--surface-primary)] rounded-xl p-4 flex items-center gap-4 hover:bg-[color:var(--surface-secondary)] transition border border-[color:var(--border-primary)] relative">

                      {/* Comparison Badge */}
                      {pkg?.comparisonBadge && (

                        <div
                          className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold ${
                            pkg.comparisonBadge === 'Best Value'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {pkg.comparisonBadge}
                        </div>

                      )}

                      {/* Package Image */}
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-[color:var(--surface-secondary)]">

                        <img
                          src={
                            pkg?.image ||
                            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
                          }
                          alt={
                            pkg?.title ||
                            'Package'
                          }
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80";
                          }}
                        />

                      </div>

                      {/* Package Information */}
                      <div className="flex-grow min-w-0">

                        {/* Rating */}
                        <div className="flex items-center mb-1">

                          <svg
                            className="w-4 h-4 text-[color:var(--accent-primary)] mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>

                          <span className="font-medium text-sm">
                            {formatRating(
                              pkg?.avg_rating ??
                              pkg?.rating ??
                              0
                            )}
                          </span>

                        </div>

                        {/* Package Title */}
                        <h3 className="font-bold text-[color:var(--text-primary)] text-sm truncate">
                          {pkg?.title ||
                            'Package Title'}
                        </h3>

                        {/* Host */}
                        <p className="text-[color:var(--text-secondary)] text-xs truncate">
                          {pkg?.host_name ||
                            'Host'}
                        </p>

                        {/* Price / Duration / Group */}
                        <div className="flex items-center mt-2 flex-wrap">

                          <span className="font-bold text-[color:var(--accent-primary)] text-sm">
                            PKR {formatPrice(pkg?.price)}
                          </span>

                          <span className="mx-2 text-xs">
                            •
                          </span>

                          <span className="text-xs text-[color:var(--text-secondary)]">
                            {pkg?.duration_days || 0} days
                          </span>

                          <span className="mx-2 text-xs">
                            •
                          </span>

                          <span className="text-xs text-[color:var(--text-secondary)]">
                            {pkg?.group_size ||
                              '2-6 people'}
                          </span>

                        </div>

                      </div>

                    </div>

                  </Link>

                ))}

              </div>

            )}

          </div>

          {/* =================================================
              TOUR COMPANIES
          ================================================== */}
          <div>

            <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">
              Tour Companies
              {normalizedSearchQuery
                ? ` for "${searchQuery}"`
                : ''}
            </h2>

            {filteredHosts.length === 0 ? (

              <div className="text-center py-6">

                <h3 className="text-lg font-medium text-[color:var(--text-secondary)]">
                  No tour companies found for this search
                </h3>

              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {filteredHosts.map((host) => (

                  <Link
                    to={`/host-profile/${host?.id}`}
                    key={host?.id}
                    className="block"
                  >

                    <div className="bg-[color:var(--surface-primary)] rounded-xl p-4 hover:bg-[color:var(--surface-secondary)] transition border border-[color:var(--border-primary)] relative">

                      {/* Ranking Badge */}
                      {host?.ranking && (

                        <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-bold">
                          #{host.ranking}
                        </div>

                      )}

                      <div className="flex items-center">

                        {/* Company Initial */}
                        <div className="w-12 h-12 rounded-full bg-[color:var(--accent-primary)] flex items-center justify-center text-[color:var(--nav-text)] font-bold mr-3 flex-shrink-0">

                          {String(
                            host?.company_name ||
                            'T'
                          )
                            .charAt(0)
                            .toUpperCase()}

                        </div>

                        <div className="flex-grow min-w-0">

                          <div className="flex items-center">

                            {/* Verified Badge */}
                            {host?.verified && (

                              <span className="bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] px-2 py-1 rounded-full text-xs flex items-center mr-2 flex-shrink-0">

                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>

                                Verified

                              </span>

                            )}

                            {/* Company Name */}
                            <h3 className="font-bold text-[color:var(--text-primary)] truncate">
                              {host?.company_name ||
                                'Tour Company'}
                            </h3>

                          </div>

                          {/* Location */}
                          <p className="text-sm text-[color:var(--text-secondary)] truncate">
                            {host?.location ||
                              'Pakistan'}
                          </p>

                          {/* Rating and Trips */}
                          <div className="flex items-center mt-1">

                            <svg
                              className="w-4 h-4 text-[color:var(--accent-primary)] mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784-.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>

                            {/* FIXED RATING */}
                            <span className="text-sm">
                              {formatRating(
                                host?.rating_score
                              )}
                            </span>

                            <span className="mx-2">
                              •
                            </span>

                            <span className="text-sm">
                              {host?.trips_completed || 0}{' '}
                              trips
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* Ranking Badge */}
                      {host?.ranking_badge && (

                        <div className="mt-3">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              host.ranking_badge ===
                              'Top Rated'
                                ? 'bg-yellow-100 text-yellow-800'
                                : host.ranking_badge ===
                                  'Highly Recommended'
                                ? 'bg-blue-100 text-blue-800'
                                : host.ranking_badge ===
                                  'Rising Host'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {host.ranking_badge}
                          </span>

                        </div>

                      )}

                    </div>

                  </Link>

                ))}

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default SearchScreen;
