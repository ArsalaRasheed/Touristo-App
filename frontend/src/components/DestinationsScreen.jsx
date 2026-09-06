import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  ArrowRight,
  Compass,
  Mountain,
  Landmark,
  Waves,
} from 'lucide-react';

const DestinationsScreen = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // ACTUAL DESTINATIONS FROM YOUR BACKEND
  // =========================================================

  const destinationImages = {
    'hunza valley':
      'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1400&q=85',

    skardu:
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1400&q=85',

    'swat valley':
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85',

    naran:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85',

    'babusar top':
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=85',

    lahore:
      'https://images.unsplash.com/photo-1584285417130-12d00386b4fa?auto=format&fit=crop&w=1400&q=85',

    'mohenjo-daro':
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1400&q=85',

    gwadar:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85',
  };

  const fallbackImage =
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=85';

  // =========================================================
  // DESTINATION IMAGE
  // =========================================================

  const getDestinationImage = (destination) => {
    const name = String(destination?.name || '')
      .trim()
      .toLowerCase();

    return destinationImages[name] || fallbackImage;
  };

  // =========================================================
  // CATEGORY ICON
  // =========================================================

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

  // =========================================================
  // FETCH DESTINATIONS
  // =========================================================

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

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          <div className="mb-8">
            <div className="h-4 w-36 bg-[color:var(--surface-secondary)] rounded animate-pulse mb-3" />

            <div className="h-9 w-72 bg-[color:var(--surface-secondary)] rounded-lg animate-pulse mb-3" />

            <div className="h-4 w-full max-w-xl bg-[color:var(--surface-secondary)] rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="rounded-2xl overflow-hidden bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)]"
              >
                <div className="h-56 bg-[color:var(--surface-secondary)] animate-pulse" />

                <div className="p-5">
                  <div className="h-5 w-2/3 bg-[color:var(--surface-secondary)] rounded animate-pulse mb-3" />
                  <div className="h-4 w-full bg-[color:var(--surface-secondary)] rounded animate-pulse mb-2" />
                  <div className="h-4 w-1/2 bg-[color:var(--surface-secondary)] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] pb-24">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8">

          <div className="flex items-center gap-2 text-[color:var(--accent-primary)] mb-2">
            <Compass className="w-5 h-5" />

            <span className="text-sm font-semibold">
              Explore Pakistan
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Discover Destinations
          </h1>

          <p className="text-[color:var(--text-secondary)] max-w-2xl leading-relaxed">
            Discover Pakistan's breathtaking landscapes,
            rich history, local culture and unforgettable
            travel experiences.
          </p>

        </div>

        {/* =====================================================
            DESTINATION GRID
        ====================================================== */}

        {destinations.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">
              🌍
            </div>

            <h2 className="text-xl font-bold mb-2">
              No destinations available
            </h2>

            <p className="text-[color:var(--text-secondary)]">
              Please try again later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {destinations.map((destination) => {
              const name =
                destination?.name ||
                'Destination';

              const image =
                getDestinationImage(destination);

              const category =
                destination?.category ||
                'destination';

              return (
                <Link
                  key={destination.id}
                  /*
                   * IMPORTANT:
                   * Use DATABASE ID, NOT slug.
                   */
                  to={`/destination/${destination.id}`}
                  className="group block"
                >

                  <article className="bg-[color:var(--surface-primary)] rounded-2xl overflow-hidden border border-[color:var(--border-primary)] shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">

                    {/* IMAGE */}

                    <div className="relative h-56 overflow-hidden bg-[color:var(--surface-secondary)]">

                      <img
                        src={image}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(event) => {
                          event.currentTarget.src =
                            fallbackImage;
                        }}
                      />

                      {/* Gradient */}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                      {/* Category */}

                      <div className="absolute top-4 left-4">

                        <span className="inline-flex items-center gap-1.5 bg-black/35 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium capitalize">

                          {getCategoryIcon(category)}

                          {category}

                        </span>

                      </div>

                      {/* Name */}

                      <div className="absolute bottom-4 left-5 right-5">

                        <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                          {name}
                        </h2>

                      </div>

                    </div>

                    {/* CONTENT */}

                    <div className="p-5">

                      <p className="text-sm text-[color:var(--text-secondary)] line-clamp-2 min-h-[40px] leading-6">
                        {destination?.history ||
                          destination?.culture ||
                          `Explore the beauty, culture and experiences of ${name}.`}
                      </p>

                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-[color:var(--border-primary)]">

                        <span className="font-semibold text-[color:var(--accent-primary)]">
                          Explore Destination
                        </span>

                        <span className="w-9 h-9 rounded-full bg-[color:var(--surface-secondary)] flex items-center justify-center text-[color:var(--accent-primary)] group-hover:bg-[color:var(--accent-primary)] group-hover:text-white transition-all">

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

      </div>
    </div>
  );
};

export default DestinationsScreen;