import { useEffect, useState } from 'react';
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
  Sparkles,
} from 'lucide-react';

import MapView from './MapView';

const FALLBACK_IMAGE =
  'https://images.pexels.com/photos/27468879/pexels-photo-27468879.jpeg?auto=compress&cs=tinysrgb&w=1200';

const destinationImages = {
  'hunza valley':
    'https://images.pexels.com/photos/31839253/pexels-photo-31839253.jpeg?auto=compress&cs=tinysrgb&w=1200',

  skardu:
    'https://images.pexels.com/photos/35302567/pexels-photo-35302567.jpeg?auto=compress&cs=tinysrgb&w=1200',

  'swat valley':
    'https://images.pexels.com/photos/37385405/pexels-photo-37385405.jpeg?auto=compress&cs=tinysrgb&w=1200',

  naran:
    'https://images.pexels.com/photos/32889687/pexels-photo-32889687.jpeg?auto=compress&cs=tinysrgb&w=1200',

  'babusar top':
    'https://images.pexels.com/photos/38667203/pexels-photo-38667203.jpeg?auto=compress&cs=tinysrgb&w=1200',

  lahore:
    'https://images.pexels.com/photos/6255712/pexels-photo-6255712.jpeg?auto=compress&cs=tinysrgb&w=1200',

  'mohenjo-daro':
    'https://images.pexels.com/photos/25548851/pexels-photo-25548851.jpeg?auto=compress&cs=tinysrgb&w=1200',

  gwadar:
    'https://images.pexels.com/photos/12180798/pexels-photo-12180798.jpeg?auto=compress&cs=tinysrgb&w=1200',

  islamabad:
    'https://images.pexels.com/photos/27698081/pexels-photo-27698081.jpeg?auto=compress&cs=tinysrgb&w=1200',

  murree:
    'https://images.pexels.com/photos/30368208/pexels-photo-30368208.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

const getDestinationImage = (name) => {
  const key = String(name || '')
    .trim()
    .toLowerCase();

  return destinationImages[key] || FALLBACK_IMAGE;
};

const getPackageImage = (pkg, destinationName) => {
  return (
    pkg?.image ||
    pkg?.image_url ||
    pkg?.photo ||
    getDestinationImage(destinationName)
  );
};

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
      // Continue with comma-separated text.
    }

    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const InfoCard = ({
  icon,
  title,
  subtitle,
  children,
}) => {
  const Icon = icon;

  return (
    <div className="h-full rounded-[24px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 sm:p-6 shadow-[var(--shadow-sm)]">
      <div className="flex items-start gap-3.5 mb-5">
        <div className="w-11 h-11 shrink-0 rounded-2xl bg-[color:var(--brand-primary-soft)] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[color:var(--brand-primary)]" />
        </div>

        <div>
          <h3 className="text-base sm:text-lg">
            {title}
          </h3>

          <p className="text-xs text-[color:var(--text-muted)] mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
};

const DestinationExploreScreen = () => {
  const { destination } = useParams();
  const navigate = useNavigate();

  const [destinationData, setDestinationData] =
    useState(null);

  const [packages, setPackages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          <div className="h-10 w-40 bg-[color:var(--surface-secondary)] rounded-full animate-pulse mb-5" />

          <div className="h-[360px] sm:h-[460px] rounded-[30px] bg-[color:var(--surface-secondary)] animate-pulse mb-8" />

          <div className="max-w-3xl">
            <div className="h-4 w-36 bg-[color:var(--surface-secondary)] rounded-full animate-pulse mb-3" />
            <div className="h-8 w-80 bg-[color:var(--surface-secondary)] rounded-xl animate-pulse mb-4" />
            <div className="h-4 w-full bg-[color:var(--surface-secondary)] rounded-full animate-pulse mb-2" />
            <div className="h-4 w-4/5 bg-[color:var(--surface-secondary)] rounded-full animate-pulse" />
          </div>

        </div>
      </div>
    );
  }

  if (error || !destinationData) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center px-5 pb-28">

        <div className="max-w-md w-full text-center rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-8 shadow-[var(--shadow-md)]">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-[color:var(--brand-primary-soft)] flex items-center justify-center mb-5">
            <MapPin className="w-7 h-7 text-[color:var(--brand-primary)]" />
          </div>

          <h2 className="text-xl mb-2">
            Destination Not Found
          </h2>

          <p role="alert" className="text-sm leading-6 text-[color:var(--text-secondary)] mb-6">
            {error ||
              "We couldn't load this destination."}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[color:var(--brand-primary)] text-white font-semibold hover:bg-[color:var(--brand-primary-hover)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] pb-28">

      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <div className="sticky top-0 z-40 bg-[color:var(--surface-primary)]/90 backdrop-blur-xl border-b border-[color:var(--border-light)]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-secondary)] hover:text-[color:var(--brand-primary)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Destinations
          </button>

        </div>
      </div>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">

        <div className="relative h-[330px] sm:h-[430px] lg:h-[500px] overflow-hidden rounded-[28px] sm:rounded-[34px] shadow-[var(--shadow-lg)]">

          <img
            src={heroImage}
            alt={destinationName}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(event) => {
              event.currentTarget.src =
                FALLBACK_IMAGE;
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />

          {/* Top location badge */}

          <div className="absolute top-5 left-5 right-5 flex items-start justify-between">

            <span className="inline-flex items-center gap-2 rounded-full bg-black/30 backdrop-blur-md border border-white/15 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white">
              <MapPin className="w-4 h-4 text-[color:var(--brand-gold-light)]" />
              Pakistan
            </span>

            <span className="w-10 h-10 rounded-full bg-black/25 backdrop-blur-md border border-white/15 flex items-center justify-center">
              <Heart className="w-4.5 h-4.5 text-white" />
            </span>

          </div>

          {/* Hero content */}

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-12">

            <div className="inline-flex items-center gap-2 text-white/75 text-xs sm:text-sm font-medium mb-3">
              <Compass className="w-4 h-4 text-[color:var(--brand-gold-light)]" />
              Explore Destination
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-none drop-shadow-lg mb-4">
              {destinationName}
            </h1>

            <div className="flex flex-wrap items-center gap-2">

              {destinationData.category && (
                <span className="inline-flex items-center rounded-full bg-white/12 backdrop-blur-md border border-white/20 text-white px-3.5 py-1.5 text-xs sm:text-sm font-medium capitalize">
                  {destinationData.category}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 backdrop-blur-md border border-white/20 text-white px-3.5 py-1.5 text-xs sm:text-sm">
                <Sparkles className="w-3.5 h-3.5 text-[color:var(--brand-gold-light)]" />
                {packages.length} travel {packages.length === 1 ? 'package' : 'packages'}
              </span>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-9 sm:py-12">

        {/* INTRO */}

        <section className="max-w-4xl mb-10 sm:mb-12">

          <p className="text-xs sm:text-sm uppercase tracking-[0.18em] font-bold text-[color:var(--brand-gold-ink)] mb-2">
            About {destinationName}
          </p>

          <h2 className="text-2xl sm:text-3xl tracking-tight mb-4">
            Discover {destinationName}
          </h2>

          <p className="text-sm sm:text-base text-[color:var(--text-secondary)] leading-7">
            {destinationData.history ||
              `Discover the beauty, culture and heritage of ${destinationName}.`}
          </p>

        </section>

        {/* HISTORY + CULTURE */}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">

          <InfoCard
            icon={Landmark}
            title="History"
            subtitle="Heritage & background"
          >
            <p className="text-sm text-[color:var(--text-secondary)] leading-7">
              {destinationData.history ||
                'Historical information will be available soon.'}
            </p>
          </InfoCard>

          <InfoCard
            icon={Heart}
            title="Culture & Traditions"
            subtitle="Local life & traditions"
          >
            <p className="text-sm text-[color:var(--text-secondary)] leading-7">
              {destinationData.culture ||
                'Cultural information will be available soon.'}
            </p>
          </InfoCard>

        </section>

        {/* PLACES + FOOD */}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-12">

          <InfoCard
            icon={Mountain}
            title="Places to Visit"
            subtitle="Must-see attractions"
          >
            {famousSpots.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {famousSpots.map(
                  (spot, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 rounded-xl bg-[color:var(--surface-secondary)] border border-[color:var(--border-light)] text-sm text-[color:var(--text-secondary)]"
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
          </InfoCard>

          <InfoCard
            icon={Utensils}
            title="Local Food"
            subtitle="Taste the destination"
          >
            {famousFood.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {famousFood.map(
                  (food, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 rounded-xl bg-[color:var(--surface-secondary)] border border-[color:var(--border-light)] text-sm text-[color:var(--text-secondary)]"
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
          </InfoCard>

        </section>

        {/* =====================================================
            LOCATION MAP
        ====================================================== */}

        <section className="mb-12">

          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4.5 h-4.5 text-[color:var(--brand-gold-ink)]" />

            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--brand-gold-ink)]">
              Location
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl tracking-tight mb-4">
            Where is {destinationName}?
          </h2>

          <MapView
            latitude={destinationData.latitude}
            longitude={destinationData.longitude}
            label={destinationName}
            zoom={11}
            height={380}
          />

        </section>

        {/* =====================================================
            PACKAGES
        ====================================================== */}

        <section>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">

            <div>

              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4.5 h-4.5 text-[color:var(--brand-gold-ink)]" />

                <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--brand-gold-ink)]">
                  Travel Packages
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl tracking-tight">
                Tours in {destinationName}
              </h2>

              <p className="text-sm text-[color:var(--text-secondary)] mt-1.5">
                Compare packages from different tour companies.
              </p>

            </div>

            <span className="inline-flex w-fit px-3 py-1.5 rounded-full bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] text-xs font-semibold">
              {packages.length}{' '}
              {packages.length === 1
                ? 'package'
                : 'packages'}
            </span>

          </div>

          {packages.length === 0 ? (

            <div className="rounded-[26px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-10 sm:p-14 text-center shadow-[var(--shadow-sm)]">

              <div className="w-14 h-14 mx-auto rounded-2xl bg-[color:var(--brand-primary-soft)] flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-[color:var(--brand-primary)]" />
              </div>

              <h3 className="text-lg mb-2">
                No Packages Available Yet
              </h3>

              <p className="text-sm text-[color:var(--text-secondary)] max-w-md mx-auto leading-6">
                Tour companies have not added packages for this destination yet.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

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
                      className="group overflow-hidden rounded-[26px] bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] shadow-[var(--shadow-sm)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-md)] transition-all duration-300"
                    >

                      {/* PACKAGE IMAGE */}

                      <div className="relative h-52 sm:h-56 overflow-hidden bg-[color:var(--surface-secondary)]">

                        <img
                          src={image}
                          alt={getPackageName(pkg)}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.src =
                              getDestinationImage(
                                destinationName
                              );
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                        {pkg?.host_verified && (
                          <div className="absolute top-3.5 right-3.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-bold text-[color:var(--brand-primary)] shadow-[var(--shadow-sm)]">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Verified
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg sm:text-xl text-white leading-snug line-clamp-2 drop-shadow-lg">
                            {getPackageName(pkg)}
                          </h3>
                        </div>

                      </div>

                      {/* PACKAGE CONTENT */}

                      <div className="p-5">

                        <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[color:var(--text-muted)] mb-1">
                          Offered by
                        </p>

                        <p className="font-semibold text-sm mb-4">
                          {pkg?.host_name ||
                            'Tour Company'}
                        </p>

                        <div className="flex flex-wrap items-center gap-3.5 mb-4">

                          {rating && (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="w-7 h-7 rounded-lg bg-[color:var(--brand-gold-soft)] flex items-center justify-center">
                                <Star className="w-3.5 h-3.5 fill-[color:var(--brand-gold-ink)] text-[color:var(--brand-gold-ink)]" />
                              </span>

                              <span className="text-sm font-semibold">
                                {rating}
                              </span>
                            </div>
                          )}

                          {pkg?.duration_days && (
                            <div className="inline-flex items-center gap-1.5 text-[color:var(--text-secondary)]">
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
                          <p className="text-sm text-[color:var(--text-secondary)] leading-6 line-clamp-2 mb-5">
                            {pkg.description}
                          </p>
                        )}

                        <div className="flex items-end justify-between gap-3 pt-4 border-t border-[color:var(--border-light)]">

                          <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-wide text-[color:var(--text-muted)] mb-1">
                              Starting from
                            </p>

                            <p className="text-lg font-bold text-[color:var(--brand-primary)]">
                              {getPrice(pkg)}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              navigate(
                                `/package/${pkg.id}`
                              )
                            }
                            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[color:var(--brand-primary)] text-white text-sm font-semibold hover:bg-[color:var(--brand-primary-hover)] transition-colors"
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
