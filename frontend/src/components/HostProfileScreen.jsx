import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Users,
  X
} from 'lucide-react';

const FALLBACK_PACKAGE_IMAGE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=85';

const HostProfileScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hostData, setHostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('overview');

  const [guidePreference, setGuidePreference] = useState('');
  const [guideRecommendation, setGuideRecommendation] = useState(null);
  const [recommending, setRecommending] = useState(false);

  const [chatLoading, setChatLoading] = useState(false);

  const getRankingBadge = (badge) => {
    switch (badge) {
      case 'Top Rated':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Highly Recommended':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Rising Host':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Trusted Operator':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'New Host':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default:
        return 'bg-[color:var(--surface-secondary)] text-[color:var(--text-secondary)] border-[color:var(--border-primary)]';
    }
  };

  const getInitial = (name) =>
    name?.trim()?.charAt(0)?.toUpperCase() || 'T';

  const handleChatWithHost = async () => {
    if (!hostData?.id) {
      alert('Host information is not available.');
      return;
    }

    const token = localStorage.getItem('touristo_token');

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
          hostId: hostData.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || 'Unable to open host conversation.'
        );
      }

      const conversationId = result?.data?.conversation_id;

      if (!conversationId) {
        throw new Error('Conversation could not be created.');
      }

      navigate(
        `/inbox?conversation=${encodeURIComponent(conversationId)}`
      );
    } catch (err) {
      console.error('Chat with host error:', err);
      alert(err.message || 'Unable to open host chat.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleGetRecommendation = async () => {
    if (!guidePreference.trim() || !hostData?.tourGuides?.length) return;

    try {
      setRecommending(true);
      setGuideRecommendation(null);

      const response = await fetch('/api/tour-guides/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          guides: hostData.tourGuides,
          preference: guidePreference
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || 'Could not get a recommendation.'
        );
      }

      setGuideRecommendation(data?.data || null);
    } catch (err) {
      setGuideRecommendation({
        error: err.message || 'Could not get a recommendation right now.'
      });
    } finally {
      setRecommending(false);
    }
  };

  useEffect(() => {
    const fetchHostData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/hosts/${id}`);

        if (!response.ok) {
          throw new Error(`Unable to load host (${response.status})`);
        }

        const data = await response.json();

        const host = data?.data?.host || data?.host;

        if (!host) {
          throw new Error('Host not found.');
        }

        setHostData(host);
      } catch (err) {
        console.error('Error fetching host:', err);
        setError(err.message || 'Unable to load host profile.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHostData();
    } else {
      setError('Invalid host ID.');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] p-4">
        <div className="max-w-6xl mx-auto animate-pulse space-y-6">

          <div className="h-8 w-24 rounded-lg bg-[color:var(--surface-secondary)]" />

          <div className="h-56 md:h-72 rounded-3xl bg-[color:var(--surface-secondary)]" />

          <div className="h-64 rounded-3xl bg-[color:var(--surface-secondary)]" />

          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 rounded-2xl bg-[color:var(--surface-secondary)]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !hostData) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-3xl p-8">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <X className="text-red-500" size={26} />
          </div>

          <h2 className="text-xl font-bold mb-2">
            Unable to Load Host
          </h2>

          <p className="text-[color:var(--text-secondary)] mb-6">
            {error || 'The requested host could not be found.'}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-3 rounded-xl bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const packages = Array.isArray(hostData.packages)
    ? hostData.packages
    : [];

  const guides = Array.isArray(hostData.tourGuides)
    ? hostData.tourGuides
    : [];

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] pb-24">

      {/* Back */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[color:var(--accent-primary)] via-[color:var(--accent-primary-hover)] to-slate-900 min-h-[280px]">

          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-black blur-3xl" />
          </div>

          <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-7 items-start md:items-center">

            {/* Logo */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-xl">
              <span className="text-5xl font-black text-white">
                {getInitial(hostData.company_name)}
              </span>
            </div>

            <div className="flex-1 text-white">

              <div className="flex flex-wrap gap-2 mb-3">

                {hostData.verified && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-sm font-semibold">
                    <BadgeCheck size={16} />
                    Verified Operator
                  </span>
                )}

                {hostData.ranking_badge && (
                  <span className="px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-sm font-semibold">
                    {hostData.ranking_badge}
                  </span>
                )}

              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                {hostData.company_name || 'Tour Operator'}
              </h1>

              <div className="flex flex-wrap gap-4 mt-3 text-white/85 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Star size={16} fill="currentColor" />
                  {Number(hostData.avgRating || 0).toFixed(1)}
                  <span>rating</span>
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseBusiness size={16} />
                  {hostData.packageCount || packages.length} packages
                </span>

                {hostData.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={16} />
                    {hostData.location}
                  </span>
                )}
              </div>

              <p className="mt-4 max-w-2xl text-white/80 leading-relaxed">
                {hostData.description ||
                  'Discover trusted travel experiences and tour packages from this operator.'}
              </p>

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-3 mt-6">

                <button
                  onClick={handleChatWithHost}
                  disabled={chatLoading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-white/90 transition disabled:opacity-60"
                >
                  <MessageCircle size={18} />
                  {chatLoading ? 'Opening...' : 'Chat with Host'}
                </button>

                {hostData.contact_email && (
                  <a
                    href={`mailto:${hostData.contact_email}`}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 border border-white/25 text-white font-semibold hover:bg-white/20 transition"
                  >
                    <Mail size={18} />
                    Email
                  </a>
                )}

                {hostData.contact_phone && (
                  <a
                    href={`tel:${hostData.contact_phone}`}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 border border-white/25 text-white font-semibold hover:bg-white/20 transition"
                  >
                    <Phone size={18} />
                    Call
                  </a>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-2xl p-5">
            <Star className="text-[color:var(--accent-primary)] mb-3" size={21} />
            <p className="text-2xl font-black">
              {Number(hostData.avgRating || 0).toFixed(1)}
            </p>
            <p className="text-sm text-[color:var(--text-secondary)]">
              Average Rating
            </p>
          </div>

          <div className="bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-2xl p-5">
            <Clock3 className="text-[color:var(--accent-primary)] mb-3" size={21} />
            <p className="text-2xl font-black">
              {hostData.avgResponseTime || '?'}h
            </p>
            <p className="text-sm text-[color:var(--text-secondary)]">
              Avg Response
            </p>
          </div>

          <div className="bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-2xl p-5">
            <CheckCircle2 className="text-[color:var(--accent-primary)] mb-3" size={21} />
            <p className="text-2xl font-black">
              {hostData.completionRate || 0}%
            </p>
            <p className="text-sm text-[color:var(--text-secondary)]">
              Completion Rate
            </p>
          </div>

          <div className="bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-2xl p-5">
            <Users className="text-[color:var(--accent-primary)] mb-3" size={21} />
            <p className="text-2xl font-black">
              {hostData.trips_completed || 0}
            </p>
            <p className="text-sm text-[color:var(--text-secondary)]">
              Trips Completed
            </p>
          </div>

        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">

        <div className="flex gap-1 p-1 bg-[color:var(--surface-secondary)] border border-[color:var(--border-primary)] rounded-2xl overflow-x-auto">

          {[
            ['overview', 'Overview'],
            ['packages', `Packages (${packages.length})`],
            ['guides', `Tour Guides (${guides.length})`]
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 min-w-max px-5 py-3 rounded-xl text-sm font-bold transition ${
                activeTab === key
                  ? 'bg-[color:var(--surface-primary)] text-[color:var(--accent-primary)] shadow-sm'
                  : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
              }`}
            >
              {label}
            </button>
          ))}

        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-6">

            <div className="bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck
                  className="text-[color:var(--accent-primary)]"
                  size={22}
                />
                <h2 className="text-xl font-bold">
                  About {hostData.company_name}
                </h2>
              </div>

              <p className="text-[color:var(--text-secondary)] leading-7">
                {hostData.description ||
                  'This tour company provides travel experiences and packages for travelers exploring Pakistan.'}
              </p>
            </div>

            {packages.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">
                    Featured Packages
                  </h2>

                  <button
                    onClick={() => setActiveTab('packages')}
                    className="text-sm font-bold text-[color:var(--accent-primary)]"
                  >
                    View all →
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {packages.slice(0, 4).map((pkg) => (
                    <Link
                      key={pkg.id}
                      to={`/package/${pkg.id}`}
                      className="group bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition"
                    >
                      <div className="h-44 overflow-hidden">
                        <img
                          src={pkg.image || FALLBACK_PACKAGE_IMAGE}
                          alt={pkg.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>

                      <div className="p-5">
                        <h3 className="font-bold line-clamp-1">
                          {pkg.title}
                        </h3>

                        <div className="flex justify-between items-center mt-3">
                          <span className="font-black text-[color:var(--accent-primary)]">
                            PKR {Number(pkg.price || 0).toLocaleString()}
                          </span>

                          <span className="text-sm text-[color:var(--text-secondary)]">
                            {pkg.duration_days || 0} days
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* PACKAGES */}
        {activeTab === 'packages' && (
          <div className="mt-6">

            {packages.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {packages.map((pkg) => (
                  <Link
                    key={pkg.id}
                    to={`/package/${pkg.id}`}
                    className="group bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition"
                  >
                    <div className="h-44 overflow-hidden">
                      <img
                        src={pkg.image || FALLBACK_PACKAGE_IMAGE}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold line-clamp-2 min-h-[48px]">
                        {pkg.title}
                      </h3>

                      <div className="flex items-center justify-between mt-4">
                        <span className="font-black text-[color:var(--accent-primary)]">
                          PKR {Number(pkg.price || 0).toLocaleString()}
                        </span>

                        <span className="text-sm text-[color:var(--text-secondary)]">
                          {pkg.duration_days || 0} days
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-3 text-xs text-[color:var(--text-secondary)]">
                        <Users size={14} />
                        {pkg.group_size || '2-6 people'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-14">
                <BriefcaseBusiness
                  size={42}
                  className="mx-auto mb-4 text-[color:var(--text-secondary)]"
                />
                <h3 className="font-bold text-lg">
                  No packages available
                </h3>
                <p className="text-[color:var(--text-secondary)] mt-1">
                  This operator has not listed any packages yet.
                </p>
              </div>
            )}

          </div>
        )}

        {/* TOUR GUIDES */}
        {activeTab === 'guides' && (
          <div className="mt-6">

            {/* AI Recommendation */}
            {guides.length > 1 && (
              <div className="bg-gradient-to-br from-[color:var(--surface-primary)] to-[color:var(--surface-secondary)] border border-[color:var(--border-primary)] rounded-3xl p-6 mb-6">

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[color:var(--accent-primary)]/10 flex items-center justify-center">
                    <span className="text-lg">✨</span>
                  </div>

                  <div>
                    <h2 className="font-bold text-lg">
                      Find the Right Guide with AI
                    </h2>

                    <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                      Tell us what kind of guide you need and AI will recommend the best match.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={guidePreference}
                    onChange={(e) =>
                      setGuidePreference(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleGetRecommendation();
                      }
                    }}
                    placeholder="e.g. Urdu-speaking guide for a family trip"
                    className="flex-1 px-4 py-3 rounded-xl border border-[color:var(--border-primary)] bg-[color:var(--surface-primary)] outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]"
                  />

                  <button
                    onClick={handleGetRecommendation}
                    disabled={recommending || !guidePreference.trim()}
                    className="px-5 py-3 rounded-xl bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] font-bold disabled:opacity-50"
                  >
                    {recommending ? 'Finding...' : 'Ask AI'}
                  </button>
                </div>

                {guideRecommendation &&
                  !guideRecommendation.error && (
                    <div className="mt-4 p-4 rounded-2xl bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)]">
                      <p className="font-bold text-[color:var(--accent-primary)]">
                        {guideRecommendation.recommendedGuideName}
                      </p>

                      <p className="text-sm text-[color:var(--text-secondary)] mt-1 leading-6">
                        {guideRecommendation.reason}
                      </p>
                    </div>
                  )}

                {guideRecommendation?.error && (
                  <p className="text-sm text-red-500 mt-3">
                    {guideRecommendation.error}
                  </p>
                )}
              </div>
            )}

            {/* Guides */}
            {guides.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

                {guides.map((guide) => (
                  <article
                    key={guide.id}
                    className="bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-3xl p-5 hover:-translate-y-1 hover:shadow-lg transition"
                  >
                    <div className="flex items-center gap-4">

                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[color:var(--surface-secondary)] flex-shrink-0">

                        {guide.photo ? (
                          <img
                            src={guide.photo}
                            alt={guide.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-black text-[color:var(--accent-primary)]">
                            {getInitial(guide.name)}
                          </div>
                        )}

                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold truncate">
                          {guide.name || 'Tour Guide'}
                        </h3>

                        <p className="text-sm text-[color:var(--accent-primary)] font-semibold truncate">
                          {guide.specialty || 'Local Guide'}
                        </p>

                        <div className="flex items-center gap-1 mt-1 text-sm">
                          <Star
                            size={14}
                            className="text-amber-500"
                            fill="currentColor"
                          />
                          {Number(guide.rating || 0).toFixed(1)}
                        </div>
                      </div>

                    </div>

                    <div className="mt-5 pt-4 border-t border-[color:var(--border-primary)]">
                      <div className="flex items-center gap-2 text-xs text-[color:var(--text-secondary)]">
                        <ShieldCheck
                          size={15}
                          className="text-[color:var(--accent-primary)]"
                        />
                        Available through this tour operator
                      </div>
                    </div>

                  </article>
                ))}

              </div>
            ) : (
              <div className="text-center py-14">
                <Users
                  size={42}
                  className="mx-auto mb-4 text-[color:var(--text-secondary)]"
                />

                <h3 className="font-bold text-lg">
                  No tour guides available
                </h3>

                <p className="text-[color:var(--text-secondary)] mt-1">
                  This operator has not added tour guides yet.
                </p>
              </div>
            )}

          </div>
        )}

      </section>
    </div>
  );
};

export default HostProfileScreen;