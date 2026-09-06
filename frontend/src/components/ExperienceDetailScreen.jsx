import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Mountain,
  Star,
  Users,
  Utensils,
  Waves,
  Landmark,
  Trees,
  Bike,
  Search,
  PackageOpen
} from 'lucide-react';

const experiences = [
  {
    id: 'mountain-adventures',
    name: 'Mountain Adventures',
    shortDescription: 'Trekking, hiking and unforgettable mountain landscapes.',
    description:
      'Explore Pakistan’s spectacular northern mountains through scenic treks, cultural encounters, high-altitude adventures and breathtaking viewpoints.',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=85',
    icon: Mountain,
    keywords: [
      'mountain',
      'trek',
      'trekking',
      'hiking',
      'skardu',
      'hunza',
      'naran',
      'babusar',
      'swat'
    ],
    highlights: [
      'Scenic mountain landscapes',
      'Guided trekking experiences',
      'Northern Pakistan destinations',
      'Adventure and photography opportunities'
    ]
  },
  {
    id: 'cultural-tours',
    name: 'Cultural Tours',
    shortDescription: 'Discover history, heritage, traditions and local life.',
    description:
      'Step into Pakistan’s rich cultural heritage with historical landmarks, ancient civilizations, traditional communities and authentic local experiences.',
    image:
      'https://images.unsplash.com/photo-1597944356808-424870f8e6f5?auto=format&fit=crop&w=1400&q=85',
    icon: Landmark,
    keywords: [
      'cultural',
      'culture',
      'historical',
      'history',
      'lahore',
      'mohenjo',
      'heritage',
      'archaeological'
    ],
    highlights: [
      'Historical landmarks',
      'Ancient heritage sites',
      'Local traditions and culture',
      'Authentic sightseeing'
    ]
  },
  {
    id: 'coastal-getaways',
    name: 'Coastal Getaways',
    shortDescription: 'Relax by the sea and discover Pakistan’s coastline.',
    description:
      'Escape to Pakistan’s coastline for beaches, ocean views, relaxing stays and memorable coastal adventures.',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85',
    icon: Waves,
    keywords: [
      'coastal',
      'coast',
      'beach',
      'sea',
      'ocean',
      'gwadar',
      'marine'
    ],
    highlights: [
      'Beautiful coastal scenery',
      'Beach experiences',
      'Sea views and relaxation',
      'Coastal exploration'
    ]
  },
  {
    id: 'wildlife-safaris',
    name: 'Wildlife Safaris',
    shortDescription: 'Experience nature, forests and Pakistan’s wild side.',
    description:
      'Reconnect with nature through forests, valleys, wildlife areas and scenic outdoor exploration across Pakistan.',
    image:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=85',
    icon: Trees,
    keywords: [
      'wildlife',
      'nature',
      'forest',
      'safari',
      'swat',
      'naran',
      'mountain'
    ],
    highlights: [
      'Nature exploration',
      'Forest landscapes',
      'Outdoor photography',
      'Scenic valleys'
    ]
  },
  {
    id: 'food-culinary',
    name: 'Food & Culinary',
    shortDescription: 'Taste authentic local food and discover regional flavors.',
    description:
      'Discover the flavors of Pakistan through regional cuisine, famous local dishes, food streets and authentic culinary experiences.',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1400&q=85',
    icon: Utensils,
    keywords: [
      'food',
      'culinary',
      'cuisine',
      'restaurant',
      'local food',
      'lahore',
      'hunza',
      'swat'
    ],
    highlights: [
      'Regional Pakistani cuisine',
      'Local food discovery',
      'Traditional flavors',
      'Food-focused experiences'
    ]
  },
  {
    id: 'adventure-sports',
    name: 'Adventure Sports',
    shortDescription: 'Add adrenaline to your journey with outdoor activities.',
    description:
      'For travelers looking for excitement, discover outdoor adventures, challenging landscapes and action-packed activities.',
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1400&q=85',
    icon: Bike,
    keywords: [
      'adventure',
      'sports',
      'rafting',
      'paragliding',
      'climbing',
      'trek',
      'mountain',
      'skardu',
      'swat'
    ],
    highlights: [
      'Outdoor adventure activities',
      'Action-packed experiences',
      'Mountain and valley exploration',
      'Thrill-focused trips'
    ]
  }
];

const formatPrice = (price) => {
  const value = Number(price);

  if (!Number.isFinite(value)) {
    return 'Price on request';
  }

  return `PKR ${value.toLocaleString()}`;
};

const getPackageImage = (pkg, fallback) => {
  return (
    pkg?.image ||
    fallback ||
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80'
  );
};

const ExperienceDetailScreen = () => {
  const { experienceId } = useParams();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const experience = useMemo(
    () => experiences.find((item) => item.id === experienceId),
    [experienceId]
  );

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/packages');

        if (!response.ok) {
          throw new Error(`Unable to load packages (${response.status})`);
        }

        const data = await response.json();
        const allPackages = data?.data?.packages || [];

        if (!experience) {
          setPackages([]);
          return;
        }

        const matched = allPackages.filter((pkg) => {
          const searchableText = [
            pkg.title,
            pkg.description,
            pkg.location,
            pkg.destination,
            pkg.host_name
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return experience.keywords.some((keyword) =>
            searchableText.includes(keyword.toLowerCase())
          );
        });

        setPackages(matched);
      } catch (err) {
        console.error('Error loading experience packages:', err);
        setError(err.message || 'Unable to load experiences.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [experience]);

  if (!experience) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <PackageOpen
            size={52}
            className="mx-auto mb-5 text-[color:var(--accent-primary)]"
          />

          <h1 className="text-2xl font-bold mb-2">
            Experience not found
          </h1>

          <p className="text-[color:var(--text-secondary)] mb-6">
            The experience you are looking for does not exist.
          </p>

          <button
            onClick={() => navigate('/experiences')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] font-semibold"
          >
            <ArrowLeft size={18} />
            Back to Experiences
          </button>
        </div>
      </div>
    );
  }

  const Icon = experience.icon;

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        <button
          onClick={() => navigate('/experiences')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition"
        >
          <ArrowLeft size={18} />
          Back to Experiences
        </button>
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        <div className="relative overflow-hidden rounded-3xl min-h-[360px] md:min-h-[440px] shadow-xl border border-[color:var(--border-primary)]">
          <img
            src={experience.image}
            alt={experience.name}
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

          <div className="relative min-h-[360px] md:min-h-[440px] flex items-end p-6 sm:p-10">
            <div className="max-w-3xl text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-sm mb-4">
                <Icon size={16} />
                Curated Experience
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
                {experience.name}
              </h1>

              <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-2xl">
                {experience.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About + Highlights */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-6">
          <div className="bg-[color:var(--surface-primary)] rounded-2xl border border-[color:var(--border-primary)] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-[color:var(--accent-primary)]/10 flex items-center justify-center">
                <Icon
                  size={22}
                  className="text-[color:var(--accent-primary)]"
                />
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-[color:var(--text-secondary)]">
                  Explore
                </p>

                <h2 className="text-xl font-bold">
                  About this experience
                </h2>
              </div>
            </div>

            <p className="text-[color:var(--text-secondary)] leading-7">
              {experience.description}
            </p>
          </div>

          <div className="bg-[color:var(--surface-primary)] rounded-2xl border border-[color:var(--border-primary)] p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-5">
              Experience highlights
            </h2>

            <div className="space-y-4">
              {experience.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-[color:var(--accent-primary)]"
                  />

                  <span className="text-sm text-[color:var(--text-secondary)]">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <p className="text-sm font-semibold text-[color:var(--accent-primary)] mb-1">
              AVAILABLE TOURS
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold">
              Find your experience
            </h2>

            <p className="text-[color:var(--text-secondary)] mt-2">
              Explore tours and packages related to {experience.name.toLowerCase()}.
            </p>
          </div>

          {!loading && (
            <span className="text-sm text-[color:var(--text-secondary)]">
              {packages.length} {packages.length === 1 ? 'tour' : 'tours'} found
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] animate-pulse"
              >
                <div className="h-52 bg-[color:var(--surface-secondary)]" />
                <div className="p-5 space-y-4">
                  <div className="h-5 rounded bg-[color:var(--surface-secondary)]" />
                  <div className="h-4 rounded bg-[color:var(--surface-secondary)] w-2/3" />
                  <div className="h-4 rounded bg-[color:var(--surface-secondary)] w-1/2" />
                  <div className="h-10 rounded-xl bg-[color:var(--surface-secondary)]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-[color:var(--surface-primary)] p-8 text-center">
            <p className="font-semibold text-red-500 mb-2">
              Unable to load tours
            </p>

            <p className="text-sm text-[color:var(--text-secondary)] mb-5">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : packages.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--border-primary)] bg-[color:var(--surface-primary)] p-10 text-center">
            <Search
              size={42}
              className="mx-auto mb-4 text-[color:var(--accent-primary)]"
            />

            <h3 className="text-xl font-bold mb-2">
              No matching tours yet
            </h3>

            <p className="text-[color:var(--text-secondary)] max-w-md mx-auto mb-6">
              We couldn't find a current package matching this experience.
              Explore all available tours instead.
            </p>

            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] font-semibold"
            >
              Browse all tours
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Link
                to={`/package/${pkg.id}`}
                key={pkg.id}
                className="group block"
              >
                <article className="h-full overflow-hidden rounded-2xl bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={getPackageImage(pkg, experience.image)}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                      <span className="px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md text-white text-xs font-medium">
                        {pkg.location || pkg.destination || 'Pakistan'}
                      </span>

                      <span className="px-3 py-1.5 rounded-full bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] text-xs font-bold">
                        {formatPrice(pkg.price)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-lg leading-snug group-hover:text-[color:var(--accent-primary)] transition">
                        {pkg.title}
                      </h3>
                    </div>

                    <p className="text-sm text-[color:var(--text-secondary)] line-clamp-2 leading-6 mb-4">
                      {pkg.description || 'Explore this curated travel experience.'}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-[color:var(--text-secondary)] mb-5">
                      {pkg.duration_days && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={14} />
                          {pkg.duration_days} days
                        </span>
                      )}

                      {pkg.host_rating && (
                        <span className="inline-flex items-center gap-1.5">
                          <Star
                            size={14}
                            className="fill-current text-[color:var(--accent-primary)]"
                          />
                          {Number(pkg.host_rating).toFixed(1)}
                        </span>
                      )}

                      {pkg.group_size && (
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={14} />
                          {pkg.group_size}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[color:var(--border-primary)]">
                      <div className="min-w-0">
                        <p className="text-xs text-[color:var(--text-secondary)]">
                          Hosted by
                        </p>

                        <p className="text-sm font-semibold truncate">
                          {pkg.host_name || 'Tour Operator'}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--accent-primary)]">
                        View
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ExperienceDetailScreen;