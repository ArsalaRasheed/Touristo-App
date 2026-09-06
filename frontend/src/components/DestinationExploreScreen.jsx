import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Package,
  ChevronRight,
  Utensils,
  Landmark,
  Mountain,
  Heart,
  ShieldCheck,
  Compass,
} from 'lucide-react';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=85';

// =========================================================
// ACTUAL DESTINATION IMAGE LIBRARY
// =========================================================

const destinationImages = {
  'hunza valley':
    'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1600&q=90',

  skardu:
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1600&q=90',

  'swat valley':
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=90',

  naran:
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=90',

  'babusar top':
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=90',

  lahore:
    'https://images.unsplash.com/photo-1584285417130-12d00386b4fa?auto=format&fit=crop&w=1600&q=90',

  'mohenjo-daro':
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1600&q=90',

  gwadar:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=90',
};

// =========================================================
// IMAGE HELPER
// =========================================================

const getDestinationImage = (name) => {
  const key = String(name || '')
    .trim()
    .toLowerCase();

  return (
    destinationImages[key] ||
    FALLBACK_IMAGE
  );
};

// =========================================================
// PACKAGE IMAGE
// IMPORTANT:
// Package's own image comes FIRST.
// Destination image is only fallback.
// =========================================================

const getPackageImage = (
  pkg,
  destinationName
) => {
  return (
    pkg?.image ||
    pkg?.image_url ||
    pkg?.photo ||
    getDestinationImage(destinationName)
  );
};

// =========================================================
// NORMALIZE POSTGRES ARRAYS / STRINGS
// =========================================================

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch {
      // normal comma-separated text
    }

    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

// =========================================================
// COMPONENT
// =========================================================

const DestinationExploreScreen = () => {
  const { destination } = useParams();
  const navigate = useNavigate();

  const [destinationData, setDestinationData] =
    useState(null);

  const [packages, setPackages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  // =========================================================
  // FETCH DESTINATION BY DATABASE ID
  // =========================================================

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `/api/destinations/${encodeURIComponent(
            destination
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              'Destination not found'
          );
        }

        const destinationInfo =
          data?.data?.destination;

        const packageList =
          data?.data?.packages || [];

        if (!destinationInfo) {
          throw new Error(
            'Destination information is unavailable'
          );
        }

        setDestinationData(
          destinationInfo
        );

        setPackages(
          Array.isArray(packageList)
            ? packageList
            : []
        );
      } catch (err) {
        console.error(
          'Destination error:',
          err
        );

        setError(
          err.message ||
            'Unable to load destination.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (destination) {
      fetchDestination();
    }
  }, [destination]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center pb-24">

        <div className="text-center">

          <div className="w-11 h-11 border-4 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-[color:var(--text-secondary)]">
            Loading destination...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !destinationData) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center px-5 pb-24">

        <div className="max-w-md w-full text-center bg-[color:var(--surface-primary)] rounded-2xl border border-[color:var(--border-primary)] p-8 shadow-sm">

          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-7 h-7 text-red-500" />
          </div>

          <h2 className="text-xl font-bold mb-2">
            Destination Not Found
          </h2>

          <p className="text-[color:var(--text-secondary)] mb-6">
            {error ||
              "We couldn't load this destination."}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl bg-[color:var(--accent-primary)] text-white font-semibold hover:opacity-90 transition"
          >
            Go Back
          </button>

        </div>

      </div>
    );
  }

  // =========================================================
  // DATA
  // =========================================================

  const destinationName =
    destinationData.name;

  const heroImage =
    getDestinationImage(
      destinationName
    );

  const famousSpots =
    normalizeList(
      destinationData.famous_spots
    );

  const famousFood =
    normalizeList(
      destinationData.famous_food
    );

  // =========================================================
  // PACKAGE HELPERS
  // =========================================================

  const getPackageName = (pkg) =>
    pkg?.title ||
    pkg?.name ||
    'Travel Package';

  const getPrice = (pkg) => {
    const price = Number(pkg?.price);

    if (Number.isNaN(price)) {
      return 'Contact for price';
    }

    return `PKR ${price.toLocaleString()}`;
  };

  const getRating = (pkg) => {
    const rating = Number(
      pkg?.host_rating
    );

    return Number.isNaN(rating)
      ? null
      : rating.toFixed(1);
  };

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] pb-24">

      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <div className="sticky top-0 z-40 bg-[color:var(--surface-primary)]/95 backdrop-blur-md border-b border-[color:var(--border-primary)]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--text-secondary)] hover:text-[color:var(--accent-primary)] transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Destinations
          </button>

        </div>

      </div>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">

        <div className="relative h-[320px] sm:h-[400px] lg:h-[470px] rounded-3xl overflow-hidden shadow-xl">

          <img
            src={heroImage}
            alt={destinationName}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(event) => {
              event.currentTarget.src =
                FALLBACK_IMAGE;
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          {/* LOCATION */}

          <div className="absolute top-5 left-5">

            <span className="inline-flex items-center gap-2 bg-black/35 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm">

              <MapPin className="w-4 h-4" />

              Pakistan

            </span>

          </div>

          {/* HERO TEXT */}

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">

            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <Compass className="w-4 h-4" />
              Explore Destination
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg mb-3">
              {destinationName}
            </h1>

            {destinationData.category && (
              <span className="inline-block bg-white/15 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-sm capitalize">
                {destinationData.category}
              </span>
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          DESTINATION CONTENT
      ====================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* ===================================================
            INTRO / HISTORY
        ==================================================== */}

        <section className="mb-10 max-w-4xl">

          <p className="text-sm font-semibold text-[color:var(--accent-primary)] uppercase tracking-wide mb-2">
            About {destinationName}
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Discover {destinationName}
          </h2>

          <p className="text-[color:var(--text-secondary)] leading-7">
            {destinationData.history ||
              `Discover the beauty and heritage of ${destinationName}.`}
          </p>

        </section>

        {/* ===================================================
            HISTORY + CULTURE
        ==================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">

          {/* HISTORY */}

          <div className="bg-[color:var(--surface-primary)] rounded-2xl border border-[color:var(--border-primary)] p-6 shadow-sm">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-11 h-11 rounded-xl bg-[color:var(--surface-secondary)] flex items-center justify-center">
                <Landmark className="w-5 h-5 text-[color:var(--accent-primary)]" />
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  History
                </h3>

                <p className="text-xs text-[color:var(--text-secondary)]">
                  Heritage & background
                </p>
              </div>

            </div>

            <p className="text-sm text-[color:var(--text-secondary)] leading-7">
              {destinationData.history ||
                'Historical information will be available soon.'}
            </p>

          </div>

          {/* CULTURE */}

          <div className="bg-[color:var(--surface-primary)] rounded-2xl border border-[color:var(--border-primary)] p-6 shadow-sm">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-11 h-11 rounded-xl bg-[color:var(--surface-secondary)] flex items-center justify-center">
                <Heart className="w-5 h-5 text-[color:var(--accent-primary)]" />
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Culture & Traditions
                </h3>

                <p className="text-xs text-[color:var(--text-secondary)]">
                  Local life & traditions
                </p>
              </div>

            </div>

            <p className="text-sm text-[color:var(--text-secondary)] leading-7">
              {destinationData.culture ||
                'Cultural information will be available soon.'}
            </p>

          </div>

        </section>

        {/* ===================================================
            PLACES + FOOD
        ==================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-12">

          {/* PLACES */}

          <div className="bg-[color:var(--surface-primary)] rounded-2xl border border-[color:var(--border-primary)] p-6 shadow-sm">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-11 h-11 rounded-xl bg-[color:var(--surface-secondary)] flex items-center justify-center">
                <Mountain className="w-5 h-5 text-[color:var(--accent-primary)]" />
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Places to Visit
                </h3>

                <p className="text-xs text-[color:var(--text-secondary)]">
                  Must-see attractions
                </p>
              </div>

            </div>

            {famousSpots.length > 0 ? (
              <div className="flex flex-wrap gap-2">

                {famousSpots.map(
                  (spot, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 rounded-xl bg-[color:var(--surface-secondary)] text-sm"
                    >
                      {spot}
                    </span>
                  )
                )}

              </div>
            ) : (
              <p className="text-sm text-[color:var(--text-secondary)]">
                Attraction information will be available soon.
              </p>
            )}

          </div>

          {/* FOOD */}

          <div className="bg-[color:var(--surface-primary)] rounded-2xl border border-[color:var(--border-primary)] p-6 shadow-sm">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-11 h-11 rounded-xl bg-[color:var(--surface-secondary)] flex items-center justify-center">
                <Utensils className="w-5 h-5 text-[color:var(--accent-primary)]" />
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  Local Food
                </h3>

                <p className="text-xs text-[color:var(--text-secondary)]">
                  Taste the destination
                </p>
              </div>

            </div>

            {famousFood.length > 0 ? (
              <div className="flex flex-wrap gap-2">

                {famousFood.map(
                  (food, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 rounded-xl bg-[color:var(--surface-secondary)] text-sm"
                    >
                      {food}
                    </span>
                  )
                )}

              </div>
            ) : (
              <p className="text-sm text-[color:var(--text-secondary)]">
                Local food information will be available soon.
              </p>
            )}

          </div>

        </section>

        {/* =====================================================
            PACKAGES
        ====================================================== */}

        <section>

          <div className="flex items-end justify-between gap-4 mb-6">

            <div>

              <div className="flex items-center gap-2 mb-1">
                <Package className="w-5 h-5 text-[color:var(--accent-primary)]" />

                <span className="text-sm font-semibold text-[color:var(--accent-primary)]">
                  Travel Packages
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold">
                Tours in {destinationName}
              </h2>

              <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                Compare packages from different tour companies.
              </p>

            </div>

            <span className="hidden sm:block text-sm text-[color:var(--text-secondary)]">
              {packages.length}{' '}
              {packages.length === 1
                ? 'package'
                : 'packages'}
            </span>

          </div>

          {/* ===================================================
              PACKAGES
          ==================================================== */}

          {packages.length === 0 ? (

            <div className="bg-[color:var(--surface-primary)] rounded-2xl border border-[color:var(--border-primary)] p-10 text-center">

              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />

              <h3 className="font-bold text-lg mb-2">
                No Packages Available Yet
              </h3>

              <p className="text-sm text-[color:var(--text-secondary)]">
                Tour companies have not added packages for this destination yet.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {packages.map(
                (pkg, index) => {

                  const image =
                    getPackageImage(
                      pkg,
                      destinationName
                    );

                  const rating =
                    getRating(pkg);

                  return (
                    <article
                      key={
                        pkg?.id ||
                        index
                      }
                      className="bg-[color:var(--surface-primary)] rounded-2xl overflow-hidden border border-[color:var(--border-primary)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >

                      {/* IMAGE */}

                      <div className="relative h-52 overflow-hidden bg-[color:var(--surface-secondary)]">

                        <img
                          src={image}
                          alt={getPackageName(pkg)}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.src =
                              getDestinationImage(
                                destinationName
                              );
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                        {pkg?.host_verified && (
                          <div className="absolute top-3 right-3">

                            <span className="inline-flex items-center gap-1 bg-white/95 text-green-700 px-2.5 py-1.5 rounded-full text-xs font-semibold shadow">

                              <ShieldCheck className="w-3.5 h-3.5" />

                              Verified

                            </span>

                          </div>
                        )}

                        <div className="absolute bottom-3 left-4 right-4">

                          <h3 className="text-lg font-bold text-white line-clamp-2 drop-shadow-lg">
                            {getPackageName(pkg)}
                          </h3>

                        </div>

                      </div>

                      {/* CONTENT */}

                      <div className="p-5">

                        <p className="text-xs text-[color:var(--text-secondary)] mb-1">
                          Offered by
                        </p>

                        <p className="font-semibold text-sm mb-4">
                          {pkg?.host_name ||
                            'Tour Company'}
                        </p>

                        <div className="flex items-center gap-4 mb-4">

                          {rating && (
                            <div className="flex items-center gap-1">

                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />

                              <span className="text-sm font-semibold">
                                {rating}
                              </span>

                            </div>
                          )}

                          {pkg?.duration_days && (
                            <div className="flex items-center gap-1 text-[color:var(--text-secondary)]">

                              <Clock className="w-4 h-4" />

                              <span className="text-sm">
                                {pkg.duration_days}{' '}
                                {Number(
                                  pkg.duration_days
                                ) === 1
                                  ? 'Day'
                                  : 'Days'}
                              </span>

                            </div>
                          )}

                        </div>

                        {pkg?.description && (
                          <p className="text-sm text-[color:var(--text-secondary)] line-clamp-2 leading-6 mb-5">
                            {pkg.description}
                          </p>
                        )}

                        <div className="flex items-end justify-between gap-3 pt-4 border-t border-[color:var(--border-primary)]">

                          <div>

                            <p className="text-xs text-[color:var(--text-secondary)] mb-1">
                              Starting from
                            </p>

                            <p className="text-lg font-bold text-[color:var(--accent-primary)]">
                              {getPrice(pkg)}
                            </p>

                          </div>

                          <button
                            onClick={() =>
                              navigate(
                                `/package/${pkg.id}`
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[color:var(--accent-primary)] text-white text-sm font-semibold hover:opacity-90 transition"
                          >
                            View Package

                            <ChevronRight className="w-4 h-4" />

                          </button>

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
};

export default DestinationExploreScreen;