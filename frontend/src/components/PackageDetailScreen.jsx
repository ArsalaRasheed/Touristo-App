import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  Users,
  UserRound,
  X,
  CheckCircle2,
  Navigation,
  BriefcaseBusiness
} from 'lucide-react';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=85';

const GUIDE_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80';

const PackageDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [packageData, setPackageData] = useState(null);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [tourGuides, setTourGuides] = useState([]);

  const [loading, setLoading] = useState(true);
  const [guidesLoading, setGuidesLoading] = useState(true);

  const [error, setError] = useState(null);
  const [guidesError, setGuidesError] = useState('');

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [saved, setSaved] = useState(false);

  const [chatLoading, setChatLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const formatPrice = (price) => {
    const value = Number(price || 0);
    return `PKR ${value.toLocaleString()}`;
  };

  const getInitial = (name, fallback = 'H') => {
    return name?.trim()?.charAt(0)?.toUpperCase() || fallback;
  };

  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return [];
  };

  const packageImages = useMemo(() => {
    const images = [];

    if (packageData?.image) {
      images.push(packageData.image);
    }

    if (packageData?.destination_image) {
      images.push(packageData.destination_image);
    }

    if (images.length === 0) {
      images.push(FALLBACK_IMAGE);
    }

    return [...new Set(images)];
  }, [packageData]);

  /*
  |--------------------------------------------------------------------------
  | Fetch Package
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/packages/${id}`);

        if (!response.ok) {
          throw new Error(`Unable to load package (${response.status})`);
        }

        const data = await response.json();

        const pkg = data?.data?.package;

        if (!pkg) {
          throw new Error('Package not found');
        }

        setPackageData(pkg);

        if (data?.data?.reviewSummary) {
          setReviewSummary(data.data.reviewSummary);
        }
      } catch (err) {
        console.error('Error fetching package:', err);
        setError(err.message || 'Unable to load package.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Fetch Tour Guides
  |--------------------------------------------------------------------------
  | Guides are displayed only.
  | NO chat action is provided here.
  */

  useEffect(() => {
    const fetchTourGuides = async () => {
      if (!packageData?.host_id) {
        setGuidesLoading(false);
        return;
      }

      try {
        setGuidesLoading(true);
        setGuidesError('');

        const response = await fetch(
          `/api/tour-guides/host/${packageData.host_id}`
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load tour guides (${response.status})`
          );
        }

        const data = await response.json();

        setTourGuides(data?.data || []);
      } catch (err) {
        console.error('Error fetching tour guides:', err);
        setGuidesError(err.message || 'Unable to load tour guides.');
        setTourGuides([]);
      } finally {
        setGuidesLoading(false);
      }
    };

    fetchTourGuides();
  }, [packageData?.host_id]);

  /*
  |--------------------------------------------------------------------------
  | Chat with Host
  |--------------------------------------------------------------------------
  */

  const handleChatWithHost = async () => {
    if (!packageData?.host_id) {
      alert('Host information is not available for this package.');
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setChatLoading(true);

      const response = await fetch('/api/messages/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          hostId: packageData.host_id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || 'Unable to open host conversation.'
        );
      }

      const conversationId =
        result?.data?.conversation_id;

      if (!conversationId) {
        throw new Error('Conversation could not be created.');
      }

      navigate(
        `/inbox?conversation=${encodeURIComponent(
          conversationId
        )}&package=${encodeURIComponent(packageData.id)}`
      );
    } catch (err) {
      console.error('Chat error:', err);
      alert(err.message || 'Unable to open host chat.');
    } finally {
      setChatLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">

            <div className="h-5 w-28 rounded bg-[color:var(--surface-secondary)]" />

            <div className="h-[320px] md:h-[430px] rounded-3xl bg-[color:var(--surface-secondary)]" />

            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              <div className="space-y-4">
                <div className="h-9 w-3/4 rounded bg-[color:var(--surface-secondary)]" />
                <div className="h-5 w-1/2 rounded bg-[color:var(--surface-secondary)]" />
                <div className="h-32 rounded-2xl bg-[color:var(--surface-secondary)]" />
              </div>

              <div className="h-64 rounded-2xl bg-[color:var(--surface-secondary)]" />
            </div>

          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">
        <div className="max-w-xl mx-auto px-4 py-20 text-center">

          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
            <X className="text-red-500" size={28} />
          </div>

          <h1 className="text-2xl font-bold mb-2">
            Unable to load package
          </h1>

          <p className="text-[color:var(--text-secondary)] mb-7">
            {error}
          </p>

          <div className="flex justify-center gap-3">

            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[color:var(--border-primary)] font-semibold"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-5 py-3 rounded-xl bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] font-semibold"
            >
              Try Again
            </button>

          </div>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg-primary)]">
        <p className="text-[color:var(--text-secondary)]">
          Package not found.
        </p>
      </div>
    );
  }

  const inclusions = normalizeArray(packageData.inclusions);
  const exclusions = normalizeArray(packageData.exclusions);
  const itinerary = normalizeArray(packageData.itinerary);

  const hostName =
    packageData.host_name || 'Tour Operator';

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] mb-5 transition"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* ======================================================
            HERO
        ====================================================== */}

        <section className="relative overflow-hidden rounded-3xl h-[320px] md:h-[430px] shadow-xl">

          <img
            src={
              packageImages[currentImageIndex] ||
              FALLBACK_IMAGE
            }
            alt={packageData.title}
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          {/* Image counter */}
          {packageImages.length > 1 && (
            <div className="absolute top-5 right-5 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md text-white text-xs">
              {currentImageIndex + 1} / {packageImages.length}
            </div>
          )}

          {/* Hero content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-10">

            <div className="max-w-4xl text-white">

              {packageData.destination && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-sm mb-4">
                  <MapPin size={15} />
                  {packageData.destination}
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight mb-4">
                {packageData.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">

                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={16} />
                  {packageData.duration_days || 0} days
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Users size={16} />
                  {packageData.group_size || '2-6 people'}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Star
                    size={16}
                    className="fill-current text-[color:var(--accent-primary)]"
                  />
                  {Number(packageData.avg_rating || 0).toFixed(1)}
                  <span className="text-white/70">
                    ({packageData.total_reviews || 0})
                  </span>
                </span>

              </div>
            </div>
          </div>

          {/* Image controls */}
          {packageImages.length > 1 && (
            <div className="absolute bottom-5 right-5 flex gap-2">

              <button
                onClick={() =>
                  setCurrentImageIndex(
                    (currentImageIndex - 1 + packageImages.length) %
                      packageImages.length
                  )
                }
                className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/65 transition"
                aria-label="Previous image"
              >
                <ArrowLeft size={18} />
              </button>

              <button
                onClick={() =>
                  setCurrentImageIndex(
                    (currentImageIndex + 1) %
                      packageImages.length
                  )
                }
                className="w-10 h-10 rounded-full bg-black/45 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/65 transition"
                aria-label="Next image"
              >
                <ArrowRight size={18} />
              </button>

            </div>
          )}

        </section>

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="grid lg:grid-cols-[1fr_330px] gap-6 mt-7">

          {/* LEFT */}
          <main>

            {/* Title / Price */}
            <div className="bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-2xl p-5 sm:p-7 mb-6">

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

                <div>
                  <p className="text-sm text-[color:var(--text-secondary)] mb-1">
                    Hosted by
                  </p>

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-[color:var(--accent-primary)]/10 flex items-center justify-center text-[color:var(--accent-primary)] font-bold">
                      {getInitial(hostName)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold">
                          {hostName}
                        </h2>

                        {packageData.host_verified && (
                          <ShieldCheck
                            size={17}
                            className="text-[color:var(--accent-primary)]"
                          />
                        )}
                      </div>

                      <p className="text-xs text-[color:var(--text-secondary)]">
                        Verified tour operator
                      </p>
                    </div>

                  </div>
                </div>

                <div className="sm:text-right">

                  <div className="text-2xl sm:text-3xl font-bold text-[color:var(--accent-primary)]">
                    {formatPrice(packageData.price)}
                  </div>

                  <p className="text-sm text-[color:var(--text-secondary)]">
                    per person
                  </p>

                </div>

              </div>
            </div>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">

              <Link
                to={{
                  pathname: '/booking',
                  state: {
                    packageInfo: {
                      id: packageData.id,
                      title: packageData.title,
                      host: hostName,
                      hostId: packageData.host_id,
                      pricePerPerson: packageData.price,
                      totalDays: packageData.duration_days,
                      image: packageData.image
                    }
                  }
                }}
                className="flex items-center justify-center gap-2 bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-3.5 px-5 rounded-xl font-bold transition shadow-sm"
              >
                Book Now
                <ArrowRight size={18} />
              </Link>

              <button
                onClick={handleChatWithHost}
                disabled={chatLoading}
                className="flex items-center justify-center gap-2 border-2 border-[color:var(--accent-primary)] text-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary)] hover:text-[color:var(--nav-text)] py-3.5 px-5 rounded-xl font-bold transition disabled:opacity-60"
              >
                <MessageCircle size={18} />

                {chatLoading
                  ? 'Opening...'
                  : 'Chat with Host'}
              </button>

              <button
                onClick={() => setSaved(!saved)}
                className={`flex items-center justify-center gap-2 border border-[color:var(--border-primary)] py-3.5 px-5 rounded-xl font-semibold transition ${
                  saved
                    ? 'text-[color:var(--accent-primary)] bg-[color:var(--accent-primary)]/10'
                    : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
                }`}
              >
                <Heart
                  size={18}
                  className={saved ? 'fill-current' : ''}
                />
                {saved ? 'Saved' : 'Save'}
              </button>

            </div>

            {/* ==================================================
                TABS
            ================================================== */}

            <div className="bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-2xl overflow-hidden">

              <div className="overflow-x-auto border-b border-[color:var(--border-primary)]">

                <div className="flex min-w-max">

                  {[
                    ['overview', 'Overview'],
                    ['details', 'Package Details'],
                    ['itinerary', 'Itinerary'],
                    ['guides', 'Tour Guides'],
                    ['reviews', `Reviews (${packageData.reviews?.length || 0})`]
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`px-5 py-4 text-sm font-semibold whitespace-nowrap transition ${
                        activeTab === key
                          ? 'text-[color:var(--accent-primary)] border-b-2 border-[color:var(--accent-primary)]'
                          : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}

                </div>
              </div>

              <div className="p-5 sm:p-7">

                {/* ==============================================
                    OVERVIEW
                ============================================== */}

                {activeTab === 'overview' && (
                  <div>

                    <h2 className="text-xl font-bold mb-4">
                      About This Package
                    </h2>

                    <p className="text-[color:var(--text-secondary)] leading-7 mb-7">
                      {packageData.description ||
                        'Detailed package description will appear here.'}
                    </p>

                    <div className="grid md:grid-cols-2 gap-7">

                      <div>
                        <h3 className="font-bold mb-4">
                          What's Included
                        </h3>

                        {inclusions.length > 0 ? (
                          <div className="space-y-3">
                            {inclusions.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3"
                              >
                                <CheckCircle2
                                  size={19}
                                  className="mt-0.5 shrink-0 text-[color:var(--accent-primary)]"
                                />

                                <span className="text-sm text-[color:var(--text-secondary)]">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-[color:var(--text-secondary)]">
                            No inclusion details provided.
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold mb-4">
                          What's Not Included
                        </h3>

                        {exclusions.length > 0 ? (
                          <div className="space-y-3">
                            {exclusions.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3"
                              >
                                <X
                                  size={19}
                                  className="mt-0.5 shrink-0 text-red-500"
                                />

                                <span className="text-sm text-[color:var(--text-secondary)]">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-[color:var(--text-secondary)]">
                            No exclusion details provided.
                          </p>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* ==============================================
                    DETAILS
                ============================================== */}

                {activeTab === 'details' && (
                  <div>

                    <h2 className="text-xl font-bold mb-5">
                      Package Details
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-4">

                      <div className="p-5 rounded-xl bg-[color:var(--surface-secondary)]">
                        <Clock3
                          size={20}
                          className="text-[color:var(--accent-primary)] mb-3"
                        />
                        <p className="text-xs text-[color:var(--text-secondary)] mb-1">
                          Duration
                        </p>
                        <p className="font-bold">
                          {packageData.duration_days || 0} days
                        </p>
                      </div>

                      <div className="p-5 rounded-xl bg-[color:var(--surface-secondary)]">
                        <Users
                          size={20}
                          className="text-[color:var(--accent-primary)] mb-3"
                        />
                        <p className="text-xs text-[color:var(--text-secondary)] mb-1">
                          Group Size
                        </p>
                        <p className="font-bold">
                          {packageData.group_size || 'Not specified'}
                        </p>
                      </div>

                      <div className="p-5 rounded-xl bg-[color:var(--surface-secondary)]">
                        <MapPin
                          size={20}
                          className="text-[color:var(--accent-primary)] mb-3"
                        />
                        <p className="text-xs text-[color:var(--text-secondary)] mb-1">
                          Destination
                        </p>
                        <p className="font-bold">
                          {packageData.destination || 'Not specified'}
                        </p>
                      </div>

                      <div className="p-5 rounded-xl bg-[color:var(--surface-secondary)]">
                        <Navigation
                          size={20}
                          className="text-[color:var(--accent-primary)] mb-3"
                        />
                        <p className="text-xs text-[color:var(--text-secondary)] mb-1">
                          Location
                        </p>
                        <p className="font-bold">
                          {packageData.location || 'Not specified'}
                        </p>
                      </div>

                    </div>

                    {/* Host */}
                    <div className="mt-7">

                      <h3 className="font-bold mb-4">
                        Host Information
                      </h3>

                      <div className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-[color:var(--surface-secondary)]">

                        <div className="flex items-center gap-4">

                          <div className="w-14 h-14 rounded-full bg-[color:var(--accent-primary)]/10 flex items-center justify-center text-xl font-bold text-[color:var(--accent-primary)]">
                            {getInitial(hostName)}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold">
                                {hostName}
                              </h4>

                              {packageData.host_verified && (
                                <ShieldCheck
                                  size={17}
                                  className="text-[color:var(--accent-primary)]"
                                />
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-sm text-[color:var(--text-secondary)]">
                              <Star
                                size={14}
                                className="fill-current text-[color:var(--accent-primary)]"
                              />
                              {Number(
                                packageData.host_rating || 0
                              ).toFixed(1)}

                              <span>•</span>

                              <span>
                                Verified Tour Operator
                              </span>
                            </div>
                          </div>

                        </div>

                        <button
                          onClick={handleChatWithHost}
                          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[color:var(--accent-primary)] text-[color:var(--accent-primary)] font-semibold hover:bg-[color:var(--accent-primary)] hover:text-[color:var(--nav-text)] transition"
                        >
                          <MessageCircle size={17} />
                          Ask Host
                        </button>

                      </div>

                    </div>
                  </div>
                )}

                {/* ==============================================
                    ITINERARY
                ============================================== */}

                {activeTab === 'itinerary' && (
                  <div>

                    <h2 className="text-xl font-bold mb-6">
                      Trip Itinerary
                    </h2>

                    {itinerary.length > 0 ? (
                      <div className="space-y-5">

                        {itinerary.map((day, index) => (
                          <div
                            key={index}
                            className="relative pl-12"
                          >

                            <div className="absolute left-0 top-0 w-9 h-9 rounded-full bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] flex items-center justify-center font-bold text-sm">
                              {day.day || index + 1}
                            </div>

                            {index < itinerary.length - 1 && (
                              <div className="absolute left-[17px] top-9 bottom-[-20px] w-px bg-[color:var(--border-primary)]" />
                            )}

                            <div className="p-5 rounded-2xl bg-[color:var(--surface-secondary)]">

                              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-primary)] mb-1">
                                Day {day.day || index + 1}
                              </p>

                              <h3 className="font-bold mb-2">
                                {day.title || 'Day Activity'}
                              </h3>

                              <p className="text-sm text-[color:var(--text-secondary)] leading-6">
                                {day.description ||
                                  'Activity details will appear here.'}
                              </p>

                            </div>

                          </div>
                        ))}

                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CalendarDays
                          size={40}
                          className="mx-auto mb-4 text-[color:var(--accent-primary)]"
                        />

                        <h3 className="font-bold mb-2">
                          Itinerary coming soon
                        </h3>

                        <p className="text-sm text-[color:var(--text-secondary)]">
                          The host has not added detailed itinerary information yet.
                        </p>
                      </div>
                    )}

                  </div>
                )}

                {/* ==============================================
                    TOUR GUIDES
                ============================================== */}

                {activeTab === 'guides' && (
                  <div>

                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-primary)] mb-1">
                          YOUR ON-TRIP TEAM
                        </p>

                        <h2 className="text-xl font-bold">
                          Tour Guides
                        </h2>
                      </div>

                      <p className="text-sm text-[color:var(--text-secondary)]">
                        Guides assigned by this tour operator
                      </p>

                    </div>

                    {guidesLoading ? (
                      <div className="grid sm:grid-cols-2 gap-5">

                        {[1, 2].map((item) => (
                          <div
                            key={item}
                            className="animate-pulse rounded-2xl border border-[color:var(--border-primary)] p-5"
                          >
                            <div className="flex gap-4">
                              <div className="w-16 h-16 rounded-full bg-[color:var(--surface-secondary)]" />

                              <div className="flex-1 space-y-3">
                                <div className="h-4 w-32 rounded bg-[color:var(--surface-secondary)]" />
                                <div className="h-3 w-24 rounded bg-[color:var(--surface-secondary)]" />
                                <div className="h-3 w-20 rounded bg-[color:var(--surface-secondary)]" />
                              </div>
                            </div>
                          </div>
                        ))}

                      </div>
                    ) : guidesError ? (
                      <div className="rounded-2xl bg-[color:var(--surface-secondary)] p-6 text-center">
                        <UserRound
                          size={36}
                          className="mx-auto mb-3 text-[color:var(--accent-primary)]"
                        />

                        <p className="font-semibold mb-1">
                          Tour guide information unavailable
                        </p>

                        <p className="text-sm text-[color:var(--text-secondary)]">
                          {guidesError}
                        </p>
                      </div>
                    ) : tourGuides.length === 0 ? (
                      <div className="rounded-2xl bg-[color:var(--surface-secondary)] p-8 text-center">

                        <UserRound
                          size={42}
                          className="mx-auto mb-4 text-[color:var(--accent-primary)]"
                        />

                        <h3 className="font-bold mb-2">
                          No tour guides listed yet
                        </h3>

                        <p className="text-sm text-[color:var(--text-secondary)] max-w-md mx-auto">
                          The tour operator has not added guide information
                          for this package yet.
                        </p>

                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-5">

                        {tourGuides.map((guide) => (
                          <article
                            key={guide.id}
                            className="rounded-2xl border border-[color:var(--border-primary)] bg-[color:var(--surface-primary)] p-5 hover:shadow-lg transition"
                          >

                            <div className="flex items-start gap-4">

                              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-[color:var(--surface-secondary)]">

                                <img
                                  src={
                                    guide.photo ||
                                    GUIDE_FALLBACK_IMAGE
                                  }
                                  alt={guide.name}
                                  className="w-full h-full object-cover"
                                  onError={(event) => {
                                    event.currentTarget.src =
                                      GUIDE_FALLBACK_IMAGE;
                                  }}
                                />

                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-center justify-between gap-3">

                                  <h3 className="font-bold truncate">
                                    {guide.name || 'Tour Guide'}
                                  </h3>

                                  <div className="inline-flex items-center gap-1 shrink-0 text-sm">
                                    <Star
                                      size={14}
                                      className="fill-current text-[color:var(--accent-primary)]"
                                    />
                                    {Number(
                                      guide.rating || 0
                                    ).toFixed(1)}
                                  </div>

                                </div>

                                <p className="text-sm text-[color:var(--accent-primary)] font-medium mt-1">
                                  {guide.specialty ||
                                    'Tour & Travel Guide'}
                                </p>

                              </div>

                            </div>

                            <div className="mt-5 pt-4 border-t border-[color:var(--border-primary)] flex items-center gap-2 text-xs text-[color:var(--text-secondary)]">

                              <BriefcaseBusiness size={14} />

                              <span>
                                Available for this tour
                              </span>

                            </div>

                            {/* IMPORTANT:
                                No chat button here.
                                Communication remains with Host.
                            */}

                          </article>
                        ))}

                      </div>
                    )}

                  </div>
                )}

                {/* ==============================================
                    REVIEWS
                ============================================== */}

                {activeTab === 'reviews' && (
                  <div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                      <div>
                        <h2 className="text-xl font-bold">
                          Traveler Reviews
                        </h2>

                        <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                          What previous travelers say about this tour
                        </p>
                      </div>

                      <div className="flex items-center gap-2">

                        <Star
                          size={20}
                          className="fill-current text-[color:var(--accent-primary)]"
                        />

                        <span className="text-xl font-bold">
                          {Number(
                            packageData.avg_rating || 0
                          ).toFixed(1)}
                        </span>

                        <span className="text-sm text-[color:var(--text-secondary)]">
                          / 5
                        </span>

                      </div>

                    </div>

                    {reviewSummary && (
                      <div className="mb-6 rounded-2xl bg-[color:var(--surface-secondary)] p-5">

                        <div className="flex items-center gap-2 mb-2">
                          <Star
                            size={17}
                            className="text-[color:var(--accent-primary)]"
                          />

                          <h3 className="font-bold">
                            AI Review Summary
                          </h3>
                        </div>

                        <p className="text-sm text-[color:var(--text-secondary)] leading-6">
                          {typeof reviewSummary === 'string'
                            ? reviewSummary
                            : reviewSummary.summary ||
                              reviewSummary.text ||
                              'Review summary is available.'}
                        </p>

                      </div>
                    )}

                    {packageData.reviews?.length > 0 ? (
                      <div className="space-y-4">

                        {packageData.reviews.map((review) => (
                          <article
                            key={review.id}
                            className="p-5 rounded-2xl bg-[color:var(--surface-secondary)]"
                          >

                            <div className="flex items-start gap-3 mb-3">

                              <div className="w-10 h-10 rounded-full bg-[color:var(--accent-primary)]/10 flex items-center justify-center text-sm font-bold text-[color:var(--accent-primary)] shrink-0">
                                {getInitial(
                                  review.reviewer_name,
                                  'U'
                                )}
                              </div>

                              <div className="min-w-0">

                                <h4 className="font-bold">
                                  {review.reviewer_name ||
                                    'Anonymous'}
                                </h4>

                                <div className="flex items-center gap-2 mt-1">

                                  <div className="flex items-center gap-0.5">
                                    {Array.from({
                                      length: 5
                                    }).map((_, index) => (
                                      <Star
                                        key={index}
                                        size={13}
                                        className={
                                          index <
                                          Number(
                                            review.rating || 0
                                          )
                                            ? 'fill-current text-[color:var(--accent-primary)]'
                                            : 'text-[color:var(--text-secondary)]'
                                        }
                                      />
                                    ))}
                                  </div>

                                  <span className="text-xs text-[color:var(--text-secondary)]">
                                    {new Date(
                                      review.created_at
                                    ).toLocaleDateString()}
                                  </span>

                                </div>

                              </div>
                            </div>

                            <p className="text-sm text-[color:var(--text-secondary)] leading-6">
                              {review.comment ||
                                'No comment provided.'}
                            </p>

                          </article>
                        ))}

                      </div>
                    ) : (
                      <div className="text-center py-12">

                        <Star
                          size={42}
                          className="mx-auto mb-4 text-[color:var(--accent-primary)]"
                        />

                        <h3 className="font-bold mb-2">
                          No reviews yet
                        </h3>

                        <p className="text-sm text-[color:var(--text-secondary)]">
                          Be one of the first travelers to review this experience.
                        </p>

                      </div>
                    )}

                  </div>
                )}

              </div>
            </div>

          </main>

          {/* ==================================================
              RIGHT SIDEBAR
          ================================================== */}

          <aside className="lg:sticky lg:top-6 lg:self-start">

            <div className="rounded-2xl bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] shadow-sm p-5">

              <p className="text-xs uppercase tracking-wider text-[color:var(--text-secondary)] mb-2">
                From
              </p>

              <div className="text-3xl font-bold text-[color:var(--accent-primary)]">
                {formatPrice(packageData.price)}
              </div>

              <p className="text-sm text-[color:var(--text-secondary)] mb-5">
                per person
              </p>

              <div className="space-y-3 mb-6">

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[color:var(--text-secondary)]">
                    Duration
                  </span>
                  <span className="font-semibold">
                    {packageData.duration_days || 0} days
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[color:var(--text-secondary)]">
                    Group
                  </span>
                  <span className="font-semibold">
                    {packageData.group_size || '2-6 people'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[color:var(--text-secondary)]">
                    Rating
                  </span>

                  <span className="inline-flex items-center gap-1 font-semibold">
                    <Star
                      size={14}
                      className="fill-current text-[color:var(--accent-primary)]"
                    />
                    {Number(
                      packageData.avg_rating || 0
                    ).toFixed(1)}
                  </span>
                </div>

              </div>

              <Link
                to={{
                  pathname: '/booking',
                  state: {
                    packageInfo: {
                      id: packageData.id,
                      title: packageData.title,
                      host: hostName,
                      hostId: packageData.host_id,
                      pricePerPerson: packageData.price,
                      totalDays: packageData.duration_days,
                      image: packageData.image
                    }
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] py-3.5 rounded-xl font-bold hover:bg-[color:var(--accent-primary-hover)] transition"
              >
                Book This Tour
                <ArrowRight size={18} />
              </Link>

              <button
                onClick={handleChatWithHost}
                disabled={chatLoading}
                className="w-full mt-3 flex items-center justify-center gap-2 border border-[color:var(--accent-primary)] text-[color:var(--accent-primary)] py-3.5 rounded-xl font-semibold hover:bg-[color:var(--accent-primary)] hover:text-[color:var(--nav-text)] transition disabled:opacity-60"
              >
                <MessageCircle size={18} />

                {chatLoading
                  ? 'Opening chat...'
                  : 'Ask Host a Question'}
              </button>

              <div className="flex items-center gap-2 mt-5 pt-5 border-t border-[color:var(--border-primary)] text-xs text-[color:var(--text-secondary)]">
                <ShieldCheck
                  size={16}
                  className="text-[color:var(--accent-primary)]"
                />

                <span>
                  Communicate directly with the verified tour operator.
                </span>
              </div>

            </div>

          </aside>

        </div>
      </div>
    </div>
  );
};

export default PackageDetailScreen;