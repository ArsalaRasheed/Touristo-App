import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  Mountain,
  Landmark,
  Waves,
  MapPin,
  Sparkles,
} from 'lucide-react';

const DestinationsScreen = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const destinationImages = {
    'hunza valley':
      'https://images.pexels.com/photos/31839253/pexels-photo-31839253.jpeg?auto=compress&cs=tinysrgb&w=1000',

    skardu:
      'https://images.pexels.com/photos/35302567/pexels-photo-35302567.jpeg?auto=compress&cs=tinysrgb&w=1000',

    'swat valley':
      'https://images.pexels.com/photos/37385405/pexels-photo-37385405.jpeg?auto=compress&cs=tinysrgb&w=1000',

    naran:
      'https://images.pexels.com/photos/32889687/pexels-photo-32889687.jpeg?auto=compress&cs=tinysrgb&w=1000',

    'babusar top':
      'https://images.pexels.com/photos/38667203/pexels-photo-38667203.jpeg?auto=compress&cs=tinysrgb&w=1000',

    lahore:
      'https://images.pexels.com/photos/6255712/pexels-photo-6255712.jpeg?auto=compress&cs=tinysrgb&w=1000',

    'mohenjo-daro':
      'https://images.pexels.com/photos/25548851/pexels-photo-25548851.jpeg?auto=compress&cs=tinysrgb&w=1000',

    gwadar:
      'https://images.pexels.com/photos/12180798/pexels-photo-12180798.jpeg?auto=compress&cs=tinysrgb&w=1000',

    islamabad:
      'https://images.pexels.com/photos/27698081/pexels-photo-27698081.jpeg?auto=compress&cs=tinysrgb&w=1000',

    murree:
      'https://images.pexels.com/photos/30368208/pexels-photo-30368208.jpeg?auto=compress&cs=tinysrgb&w=1000',
  };

  const fallbackImage =
    'https://images.pexels.com/photos/27468879/pexels-photo-27468879.jpeg?auto=compress&cs=tinysrgb&w=1000';

  const getDestinationImage = (destination) => {
    const name = String(destination?.name || '')
      .trim()
      .toLowerCase();

    return destinationImages[name] || fallbackImage;
  };

  const getCategoryIcon = (category) => {
    const type = String(category || '').toLowerCase();

    if (type === 'coastal') {
      return <Waves className="w-3.5 h-3.5" />;
    }

    if (type === 'historical') {
      return <Landmark className="w-3.5 h-3.5" />;
    }

    return <Mountain className="w-3.5 h-3.5" />;
  };

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('/api/destinations');

        if (!response.ok) {
          throw new Error('Failed to load destinations');
        }

        const data = await response.json();

        const fetched =
          data?.data?.destinations || [];

        setDestinations(fetched);
      } catch (error) {
        console.error(
          'Error fetching destinations:',
          error
        );

        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

          {/* Header skeleton */}
          <div className="max-w-2xl mb-10">
            <div className="h-4 w-36 bg-[color:var(--surface-secondary)] rounded-full animate-pulse mb-4" />

            <div className="h-10 sm:h-12 w-72 sm:w-96 bg-[color:var(--surface-secondary)] rounded-xl animate-pulse mb-4" />

            <div className="space-y-2">
              <div className="h-4 w-full max-w-xl bg-[color:var(--surface-secondary)] rounded-full animate-pulse" />
              <div className="h-4 w-4/5 max-w-lg bg-[color:var(--surface-secondary)] rounded-full animate-pulse" />
            </div>
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-[26px] bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] shadow-[var(--shadow-sm)]"
              >
                <div className="h-64 bg-[color:var(--surface-secondary)] animate-pulse" />

                <div className="p-5 sm:p-6">
                  <div className="h-5 w-2/3 bg-[color:var(--surface-secondary)] rounded-full animate-pulse mb-4" />
                  <div className="h-3.5 w-full bg-[color:var(--surface-secondary)] rounded-full animate-pulse mb-2" />
                  <div className="h-3.5 w-4/5 bg-[color:var(--surface-secondary)] rounded-full animate-pulse" />

                  <div className="mt-6 pt-4 border-t border-[color:var(--border-light)] flex justify-between">
                    <div className="h-4 w-28 bg-[color:var(--surface-secondary)] rounded-full animate-pulse" />
                    <div className="h-9 w-9 bg-[color:var(--surface-secondary)] rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] pb-28">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <section className="relative overflow-hidden rounded-[30px] sm:rounded-[34px] bg-[color:var(--brand-primary)] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 mb-9 shadow-[var(--shadow-md)]">

          {/* Decorative elements */}
          <div className="absolute -top-24 -right-20 w-64 h-64 rounded-full bg-[color:var(--brand-gold)]/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-28 -left-16 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl">

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 border border-white/10 text-white/90 text-xs sm:text-sm font-semibold mb-5">
              <Compass className="w-4 h-4 text-[color:var(--brand-gold-light)]" />
              Explore Pakistan
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
              Discover places worth remembering.
            </h1>

            <p className="mt-4 text-sm sm:text-base text-white/70 max-w-2xl leading-7">
              From dramatic mountain valleys to historic cities and
              peaceful coastlines, explore destinations across Pakistan
              and find your next journey.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/65">
                <MapPin className="w-4 h-4 text-[color:var(--brand-gold)]" />
                Curated destinations across Pakistan
              </div>

              <span className="hidden sm:block w-1 h-1 rounded-full bg-white/30" />

              <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-white/65">
                <Sparkles className="w-4 h-4 text-[color:var(--brand-gold)]" />
                Authentic travel experiences
              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            SECTION HEADING
        ====================================================== */}

        <div className="flex items-end justify-between gap-4 mb-5 sm:mb-6">

          <div>
            <p className="text-xs uppercase tracking-[0.18em] font-bold text-[color:var(--brand-gold-ink)] mb-2">
              Where will you go?
            </p>

            <h2 className="text-2xl sm:text-3xl tracking-tight">
              Explore destinations
            </h2>
          </div>

          {destinations.length > 0 && (
            <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)] text-xs font-semibold">
              {destinations.length} destinations
            </span>
          )}

        </div>

        {/* =====================================================
            DESTINATIONS
        ====================================================== */}

        {destinations.length === 0 ? (
          <div className="rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] shadow-[var(--shadow-sm)] px-6 py-16 text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-[color:var(--brand-primary-soft)] flex items-center justify-center mb-5">
              <Compass className="w-7 h-7 text-[color:var(--brand-primary)]" />
            </div>

            <h2 className="text-xl mb-2">
              No destinations available
            </h2>

            <p className="text-sm text-[color:var(--text-secondary)]">
              Please try again later.
            </p>

          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">

            {destinations.map((destination) => {
              const name =
                destination?.name || 'Destination';

              const image =
                getDestinationImage(destination);

              const category =
                destination?.category || 'destination';

              return (
                <Link
                  key={destination.id}
                  to={`/destination/${destination.id}`}
                  className="group block"
                >
                  <article className="h-full overflow-hidden rounded-[26px] bg-[color:var(--surface-primary)] border border-[color:var(--border-light)] shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-md)]">

                    {/* IMAGE */}
                    <div className="relative h-60 sm:h-64 overflow-hidden bg-[color:var(--surface-secondary)]">

                      <img
                        src={image}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.src = fallbackImage;
                        }}
                      />

                      {/* Image overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                      {/* Top subtle highlight */}
                      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent" />

                      {/* Category */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white capitalize shadow-[var(--shadow-sm)]">
                          {getCategoryIcon(category)}
                          {category}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="absolute top-4 right-4">
                        <span className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/15 flex items-center justify-center text-white">
                          <MapPin className="w-4 h-4" />
                        </span>
                      </div>

                      {/* Destination title */}
                      <div className="absolute bottom-5 left-5 right-5">
                        <h3 className="text-2xl sm:text-[27px] text-white tracking-tight drop-shadow-md">
                          {name}
                        </h3>
                      </div>

                    </div>

                    {/* CONTENT */}
                    <div className="p-5 sm:p-6">

                      <p className="text-sm text-[color:var(--text-secondary)] leading-6 line-clamp-2 min-h-[48px]">
                        {destination?.history ||
                          destination?.culture ||
                          `Explore the beauty, culture and experiences of ${name}.`}
                      </p>

                      <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-[color:var(--border-light)]">

                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--brand-primary)]">
                          Explore destination
                        </span>

                        <span className="w-10 h-10 rounded-full bg-[color:var(--brand-primary-soft)] flex items-center justify-center text-[color:var(--brand-primary)] transition-all duration-300 group-hover:bg-[color:var(--brand-primary)] group-hover:text-white group-hover:translate-x-0.5">
                          <ArrowRight className="w-4 h-4" />
                        </span>

                      </div>

                    </div>

                  </article>
                </Link>
              );
            })}

          </div>
        )}

      </main>
    </div>
  );
};

export default DestinationsScreen;
