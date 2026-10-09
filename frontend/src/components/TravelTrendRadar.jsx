import {
  useCallback,
  useEffect,
  useState
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  Flame,
  TrendingUp,
  Play,
  Eye,
  Users,
  Sparkles,
  ArrowUpRight,
  ArrowLeft,
  RefreshCw,
  Video,
  UserRound,
  WifiOff
} from 'lucide-react';


/*
|--------------------------------------------------------------------------
| Travel Trend Radar
|--------------------------------------------------------------------------
| Full travel intelligence experience.
| Every number shown here comes from /api/travel-radar, which measures
| real YouTube signals. Nothing on this screen is hardcoded.
|--------------------------------------------------------------------------
*/


const formatViews = views => {
  const value = Number(views || 0);

  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toLocaleString();
};


const getScoreLabel = score => {
  const value = Number(score || 0);

  if (value >= 80) {
    return 'Rising Fast';
  }

  if (value >= 60) {
    return 'Trending';
  }

  if (value >= 35) {
    return 'Rising';
  }

  return 'Stable';
};


const getScoreBadgeClass = score => {
  const value = Number(score || 0);

  if (value >= 80) {
    return 'badge-danger';
  }

  if (value >= 60) {
    return 'badge-gold';
  }

  if (value >= 35) {
    return 'badge-primary';
  }

  return 'badge-success';
};


const formatRelativeTime = iso => {
  if (!iso) {
    return null;
  }

  const time = Date.parse(iso);

  if (!Number.isFinite(time)) {
    return null;
  }

  const minutes = Math.round(
    (Date.now() - time) / 60000
  );

  if (minutes < 1) {
    return 'Updated just now';
  }

  if (minutes < 60) {
    return `Updated ${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `Updated ${hours}h ago`;
  }

  return `Updated ${Math.round(hours / 24)}d ago`;
};


const TravelTrendRadar = () => {
  const navigate = useNavigate();

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    refreshing,
    setRefreshing
  ] = useState(false);

  const [error, setError] =
    useState('');

  const fetchRadar = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const response = await fetch(
          '/api/travel-radar'
        );

        if (!response.ok) {
          throw new Error(
            'Unable to load travel radar'
          );
        }

        const result =
          await response.json();

        setData(result.data || null);
      } catch (err) {
        console.error(
          'Travel radar error:',
          err
        );

        setError(
          'Travel trends are temporarily unavailable.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(
          '/api/travel-radar'
        );

        if (!response.ok) {
          throw new Error(
            'Unable to load travel radar'
          );
        }

        const result =
          await response.json();

        if (!cancelled) {
          setData(
            result.data || null
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            'Travel radar error:',
            err
          );

          setError(
            'Travel trends are temporarily unavailable.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] px-5 sm:px-8 py-7">
        <div className="max-w-6xl mx-auto animate-pulse">

          <div className="h-4 w-28 bg-[color:var(--border-light)] rounded-full" />

          <div className="mt-4 h-9 w-80 max-w-full bg-[color:var(--border-light)] rounded-xl" />

          <div className="mt-3 h-4 w-full max-w-xl bg-[color:var(--bg-secondary)] rounded-full" />

          <div className="mt-7 h-64 rounded-[28px] bg-[color:var(--brand-primary-soft)]" />

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {[1, 2, 3, 4, 5, 6].map(item => (
              <div
                key={item}
                className="h-56 rounded-[22px] bg-[color:var(--surface-primary)] border border-[color:var(--border-light)]"
              />
            ))}

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

  if (error && !data) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] px-5 sm:px-8 py-7">
        <div className="max-w-6xl mx-auto">

          <RadarHeader
            onBack={() => navigate(-1)}
          />

          <div className="mt-8 rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-7 shadow-[var(--shadow-sm)] text-center">

            <div className="mx-auto w-12 h-12 rounded-full bg-[color:var(--danger-soft)] flex items-center justify-center text-[color:var(--danger)]">
              <WifiOff size={20} />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-[color:var(--text-primary)]">
              Trend intelligence unavailable
            </h2>

            <p role="alert" className="mt-2 text-sm text-[color:var(--text-secondary)]">
              {error}
            </p>

            <button
              onClick={() => fetchRadar(true)}
              className="btn btn-primary mt-5"
            >
              <RefreshCw size={16} />
              Try again
            </button>

          </div>

        </div>
      </div>
    );
  }


  const destinations =
    data?.destinations || [];

  const featured =
    data?.featured || destinations[0] || null;

  const topCreators =
    data?.topCreators || [];

  const watchVideos = destinations
    .map(item => item.topVideo)
    .filter(
      video =>
        video?.url && video?.title
    )
    .slice(0, 6);

  const updatedLabel =
    formatRelativeTime(data?.lastUpdated);

  const hasData =
    destinations.length > 0;


  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] px-5 sm:px-8 py-7 pb-14">

      <div className="max-w-6xl mx-auto">

        {/* ============================================
            HEADER
        ============================================ */}

        <RadarHeader
          onBack={() => navigate(-1)}
          updatedLabel={updatedLabel}
          refreshing={refreshing}
          onRefresh={() => fetchRadar(true)}
        />


        {/* ============================================
            DATA NOTICE
        ============================================ */}

        {hasData && !data?.dataAvailable && (
          <div className="mt-5 rounded-2xl border border-[color:var(--border-light)] bg-[color:var(--warning-soft)] px-4 py-3.5 flex items-start gap-3">

            <WifiOff
              size={17}
              className="mt-0.5 shrink-0 text-[color:var(--warning)]"
            />

            <p className="text-sm leading-6 text-[color:var(--text-secondary)]">

              Live YouTube signals are not configured for this
              deployment, so destination rankings below are based on
              the latest data Touristo could retrieve.

            </p>

          </div>
        )}


        {error && hasData && (
          <div className="mt-5 rounded-2xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] px-4 py-3.5 flex items-center justify-between gap-3">

            <p role="alert" className="text-sm text-[color:var(--text-secondary)]">
              {error}
            </p>

            <button
              onClick={() => fetchRadar(true)}
              className="text-sm font-semibold text-[color:var(--brand-primary)]"
            >
              Retry
            </button>

          </div>
        )}


        {/* ============================================
            EMPTY STATE
        ============================================ */}

        {!hasData && (
          <div className="mt-7 rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-8 text-center shadow-[var(--shadow-sm)]">

            <div className="mx-auto w-12 h-12 rounded-full bg-[color:var(--brand-primary-soft)] flex items-center justify-center text-[color:var(--brand-primary)]">
              <Flame size={20} />
            </div>

            <h2 className="mt-4 text-xl font-semibold">
              No trend signals yet
            </h2>

            <p className="mt-2 text-sm text-[color:var(--text-secondary)] max-w-md mx-auto">

              Touristo builds the radar from destinations that have
              packages on the marketplace. Publish packages to start
              tracking travel signals.

            </p>

            <button
              onClick={() => fetchRadar(true)}
              className="btn btn-secondary mt-5"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

          </div>
        )}


        {/* ============================================
            FEATURED TREND
        ============================================ */}

        {featured && (
          <section className="mt-7">

            <div className="
              relative
              overflow-hidden
              rounded-[30px]
              bg-[color:var(--brand-primary)]
              shadow-[var(--shadow-lg)]
              p-6
              sm:p-8
            ">

              <div className="
                absolute
                -top-24
                -right-20
                w-72
                h-72
                rounded-full
                bg-[color:var(--brand-gold)]
                opacity-[0.08]
                blur-3xl
              " />

              <div className="
                absolute
                -bottom-32
                -left-20
                w-80
                h-80
                rounded-full
                bg-white
                opacity-[0.04]
                blur-3xl
              " />

              <div className="relative z-10">

                <div className="
                  inline-flex
                  items-center
                  gap-2
                  px-3
                  py-1.5
                  rounded-full
                  bg-white/10
                  border
                  border-white/10
                  text-[color:var(--brand-gold-light)]
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                ">

                  <Flame size={13} />

                  #1 Trending Destination

                </div>

                <div className="
                  mt-5
                  flex
                  flex-col
                  lg:flex-row
                  lg:items-start
                  gap-7
                ">

                  {/* -------- Main info -------- */}

                  <div className="flex-1 min-w-0">

                    <h2 className="
                      text-3xl
                      sm:text-4xl
                      lg:text-5xl
                      font-semibold
                      tracking-[-0.03em]
                      text-white
                    ">
                      {featured.destination}
                    </h2>

                    <div className="
                      mt-3
                      flex
                      flex-wrap
                      items-center
                      gap-2.5
                    ">

                      <span className={`
                        badge
                        ${getScoreBadgeClass(featured.trendScore)}
                      `}>
                        <TrendingUp size={13} />
                        {getScoreLabel(featured.trendScore)}
                      </span>

                      <span className="
                        inline-flex
                        items-center
                        gap-1.5
                        px-3
                        py-1.5
                        rounded-full
                        bg-white/10
                        border border-white/10
                        text-white/85
                        text-xs
                        font-medium
                      ">

                        <Eye size={13} />

                        {formatViews(featured.totalViews)} recent
                        YouTube views

                      </span>

                      <span className="
                        inline-flex
                        items-center
                        gap-1.5
                        px-3
                        py-1.5
                        rounded-full
                        bg-white/10
                        border border-white/10
                        text-white/85
                        text-xs
                        font-medium
                      ">

                        <Users size={13} />

                        {featured.uniqueCreators} creators

                      </span>

                    </div>

                    <p className="
                      mt-1
                      text-[11px]
                      text-white/45
                    ">
                      Score {featured.trendScore}/100 ·{' '}
                      {data?.scope}
                    </p>

                    {/* -------- Why trending -------- */}

                    <div className="
                      mt-5
                      rounded-2xl
                      bg-white/[0.07]
                      border
                      border-white/10
                      p-4
                    ">

                      <div className="flex items-center gap-2 text-[color:var(--brand-gold-light)]">

                        <Sparkles size={15} />

                        <span className="
                          text-[11px]
                          font-semibold
                          uppercase
                          tracking-[0.16em]
                        ">
                          Why it's trending
                        </span>

                      </div>

                      <p className="mt-2.5 text-sm sm:text-base leading-6 text-white/85">
                        {featured.reason}
                      </p>

                      {featured.velocityText && (
                        <p className="mt-2 text-xs font-medium text-[color:var(--brand-gold-light)]">
                          {featured.velocityText}
                        </p>
                      )}

                      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">

                        {(featured.signals || [])
                          .slice(0, 6)
                          .map(signal => (
                            <li
                              key={signal}
                              className="flex items-start gap-2 text-xs leading-5 text-white/65"
                            >

                              <span className="mt-1.5 w-1 h-1 rounded-full bg-[color:var(--brand-gold)] shrink-0" />

                              {signal}

                            </li>
                          ))}

                      </ul>

                    </div>

                  </div>

                  {/* -------- Top creator + top video -------- */}

                  <div className="w-full lg:w-80 shrink-0 space-y-4">

                    {featured.topCreator && (
                      <div className="
                        rounded-2xl
                        bg-white
                        p-4
                        shadow-[var(--shadow-md)]
                      ">

                        <div className="
                          flex
                          items-center
                          gap-2
                          text-[color:var(--text-muted)]
                        ">

                          <UserRound size={14} />

                          <span className="
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.16em]
                          ">
                            Top creator
                          </span>

                        </div>

                        <p className="mt-2 text-base font-semibold text-[color:var(--text-primary)] truncate">
                          {featured.topCreator.name}
                        </p>

                        <p className="mt-0.5 text-sm text-[color:var(--text-secondary)]">
                          {formatViews(featured.topCreator.views)}{' '}
                          views across{' '}
                          {featured.topCreator.videoCount}{' '}
                          {featured.topCreator.videoCount === 1
                            ? 'video'
                            : 'videos'}
                        </p>

                      </div>
                    )}

                    {featured.topVideo && (
                      <div className="
                        rounded-2xl
                        bg-white
                        overflow-hidden
                        shadow-[var(--shadow-md)]
                      ">

                        {featured.topVideo.thumbnail && (
                          <div className="h-32 overflow-hidden">

                            <img
                              src={
                                featured.topVideo.thumbnail
                              }
                              alt={
                                featured.topVideo.title
                              }
                              className="w-full h-full object-cover"
                            />

                          </div>
                        )}

                        <div className="p-4">

                          <div className="
                            flex
                            items-center
                            gap-2
                            text-[color:var(--text-muted)]
                          ">

                            <Video size={14} />

                            <span className="
                              text-[10px]
                              font-semibold
                              uppercase
                              tracking-[0.16em]
                            ">
                              Top video
                            </span>

                          </div>

                          <p className="mt-2 text-sm font-semibold leading-5 text-[color:var(--text-primary)] line-clamp-2">
                            {featured.topVideo.title}
                          </p>

                          <div className="mt-3 flex items-center justify-between gap-3">

                            <span className="text-xs text-[color:var(--text-secondary)]">
                              {formatViews(
                                featured.topVideo.views
                              )}{' '}
                              views
                            </span>

                            <a
                              href={
                                featured.topVideo.url
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                text-xs
                                font-semibold
                                text-[color:var(--brand-primary)]
                              "
                            >
                              Watch on YouTube
                              <ArrowUpRight size={14} />
                            </a>

                          </div>

                        </div>

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>

          </section>
        )}


        {/* ============================================
            TRENDING DESTINATIONS
        ============================================ */}

        {hasData && (
          <section className="mt-10">

            <SectionHeading
              eyebrow="Ranked by measured signals"
              title="Trending destinations"
              description="Ordered by Touristo's trend score, calculated from views, creators, publishing volume and recency."
            />

            <div className="
              mt-6
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-5
            ">

              {destinations.map(item => (
                <article
                  key={item.destination}
                  className="
                    card
                    rounded-[22px]
                    overflow-hidden
                    flex
                    flex-col
                  "
                >

                  {/* -------- Card head -------- */}

                  <div className="
                    relative
                    h-36
                    overflow-hidden
                  ">

                    {item.topVideo?.thumbnail ? (
                      <img
                        src={
                          item.topVideo.thumbnail
                        }
                        alt={item.destination}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[color:var(--brand-primary-soft)]" />
                    )}

                    <div className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/70
                      via-black/20
                      to-transparent
                    " />

                    <div className="
                      absolute
                      top-3
                      left-3
                      w-8
                      h-8
                      rounded-full
                      bg-white/90
                      backdrop-blur
                      flex
                      items-center
                      justify-center
                      text-xs
                      font-bold
                      text-[color:var(--brand-primary)]
                    ">
                      #{item.rank}
                    </div>

                    <div className="
                      absolute
                      top-3
                      right-3
                      px-2.5
                      py-1.5
                      rounded-full
                      bg-[color:var(--brand-primary)]
                      text-white
                      text-[11px]
                      font-bold
                      flex
                      items-center
                      gap-1
                    ">

                      <TrendingUp size={12} />

                      {item.trendScore}

                    </div>

                    <div className="absolute bottom-3 left-4 right-4">

                      <h3 className="text-xl font-semibold text-white">
                        {item.destination}
                      </h3>

                      <p className="mt-0.5 text-xs text-white/75">
                        {getScoreLabel(item.trendScore)}
                        {item.velocityText
                          ? ` · ${item.velocityText}`
                          : ''}
                      </p>

                    </div>

                  </div>

                  {/* -------- Metrics -------- */}

                  <div className="p-4 flex-1 flex flex-col">

                    <div className="grid grid-cols-3 gap-2">

                      <Metric
                        icon={<Eye size={13} />}
                        label="Views"
                        value={formatViews(
                          item.totalViews
                        )}
                      />

                      <Metric
                        icon={<Users size={13} />}
                        label="Creators"
                        value={
                          item.uniqueCreators || 0
                        }
                      />

                      <Metric
                        icon={<Video size={13} />}
                        label="Videos"
                        value={item.videoCount || 0}
                      />

                    </div>

                    {/* Why it's trending */}

                    <div className="mt-4">

                      <div className="
                        flex
                        items-center
                        gap-1.5
                        text-[color:var(--brand-gold-ink)]
                      ">

                        <Sparkles size={13} />

                        <span className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.14em]
                        ">
                          Why it's trending
                        </span>

                      </div>

                      <p className="mt-1.5 text-sm leading-5 text-[color:var(--text-secondary)]">
                        {item.reason}
                      </p>

                    </div>

                    {/* Signals */}

                    <ul className="mt-3 space-y-1.5">

                      {(item.signals || [])
                        .slice(0, 3)
                        .map(signal => (
                          <li
                            key={signal}
                            className="flex items-start gap-2 text-[11px] leading-4 text-[color:var(--text-muted)]"
                          >

                            <span className="mt-1.5 w-1 h-1 rounded-full bg-[color:var(--brand-gold)] shrink-0" />

                            {signal}

                          </li>
                        ))}

                    </ul>

                    {/* Top creator + video */}

                    <div className="
                      mt-4
                      pt-3
                      border-t
                      border-[color:var(--border-light)]
                      space-y-2
                    ">

                      {item.topCreator && (
                        <div className="flex items-center justify-between gap-3">

                          <div className="min-w-0">

                            <p className="text-[10px] uppercase tracking-wider text-[color:var(--text-muted)]">
                              Top creator
                            </p>

                            <p className="text-xs font-semibold text-[color:var(--text-primary)] truncate">
                              {item.topCreator.name}
                            </p>

                          </div>

                          <span className="shrink-0 text-xs font-semibold text-[color:var(--text-secondary)]">
                            {formatViews(
                              item.topCreator.views
                            )}
                          </span>

                        </div>
                      )}

                      {item.topVideo && (
                        <div className="flex items-center justify-between gap-3">

                          <div className="min-w-0">

                            <p className="text-[10px] uppercase tracking-wider text-[color:var(--text-muted)]">
                              Top video
                            </p>

                            <p className="text-xs font-semibold text-[color:var(--text-primary)] truncate">
                              {item.topVideo.title}
                            </p>

                          </div>

                          <a
                            href={item.topVideo.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Watch top video"
                            className="
                              shrink-0
                              w-8
                              h-8
                              rounded-full
                              bg-[color:var(--brand-primary-soft)]
                              text-[color:var(--brand-primary)]
                              flex
                              items-center
                              justify-center
                            "
                          >
                            <ArrowUpRight size={15} />
                          </a>

                        </div>
                      )}

                    </div>

                  </div>

                </article>
              ))}

            </div>

          </section>
        )}


        {/* ============================================
            TOP CREATOR SIGNALS
        ============================================ */}

        {topCreators.length > 0 && (
          <section className="mt-11">

            <SectionHeading
              eyebrow="Creator intelligence"
              title="Top creator signals"
              description="Channels driving the strongest recent travel view signals across tracked destinations."
            />

            <div className="
              mt-6
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-4
            ">

              {topCreators.map(creator => (
                <article
                  key={
                    creator.channelId ||
                    creator.name
                  }
                  className="card rounded-[20px] p-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="text-[10px] uppercase tracking-wider text-[color:var(--text-muted)]">
                        Creator
                      </p>

                      <h3 className="mt-1 text-base font-semibold text-[color:var(--text-primary)] truncate">
                        {creator.name}
                      </h3>

                    </div>

                    <span className="
                      shrink-0
                      badge
                      badge-primary
                    ">
                      {formatViews(creator.views)} views
                    </span>

                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">

                    <span className="text-[11px] text-[color:var(--text-secondary)]">
                      {creator.videoCount}{' '}
                      {creator.videoCount === 1
                        ? 'video'
                        : 'videos'}
                    </span>

                    <span className="text-[11px] text-[color:var(--text-muted)]">
                      ·
                    </span>

                    <span className="text-[11px] text-[color:var(--text-secondary)] truncate">
                      {(creator.destinations || []).join(', ')}
                    </span>

                  </div>

                  {creator.topVideo && (
                    <a
                      href={creator.topVideo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        mt-3
                        flex
                        items-center
                        justify-between
                        gap-3
                        rounded-xl
                        bg-[color:var(--bg-secondary)]
                        px-3
                        py-2.5
                        hover:bg-[color:var(--brand-primary-soft)]
                        transition-colors
                      "
                    >

                      <span className="text-xs font-medium text-[color:var(--text-primary)] truncate">
                        {creator.topVideo.title}
                      </span>

                      <span className="shrink-0 flex items-center gap-1 text-xs font-semibold text-[color:var(--brand-primary)]">

                        {formatViews(
                          creator.topVideo.views
                        )}

                        <ArrowUpRight size={13} />

                      </span>

                    </a>
                  )}

                </article>
              ))}

            </div>

          </section>
        )}


        {/* ============================================
            WATCH THE CONTENT
        ============================================ */}

        {watchVideos.length > 0 && (
          <section className="mt-11">

            <SectionHeading
              eyebrow="Watch the content"
              title="Videos driving these trends"
              description="Real YouTube uploads behind the signals above."
            />

            <div className="
              mt-6
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-4
            ">

              {watchVideos.map(video => (
                <a
                  key={video.url}
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group card rounded-[20px] overflow-hidden"
                >

                  <div className="relative h-40 overflow-hidden bg-[color:var(--brand-primary-soft)]">

                    {video.thumbnail && (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      />
                    )}

                    <div className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/60
                      to-transparent
                    " />

                    <div className="
                      absolute
                      bottom-3
                      left-3
                      w-9
                      h-9
                      rounded-full
                      bg-white/90
                      flex
                      items-center
                      justify-center
                      text-[color:var(--brand-primary)]
                    ">

                      <Play size={15} />

                    </div>

                    <span className="
                      absolute
                      bottom-3.5
                      right-3
                      px-2
                      py-1
                      rounded-md
                      bg-black/60
                      text-white
                      text-[11px]
                      font-semibold
                    ">
                      {formatViews(video.views)} views
                    </span>

                  </div>

                  <div className="p-4">

                    <p className="text-sm font-semibold leading-5 text-[color:var(--text-primary)] line-clamp-2">
                      {video.title}
                    </p>

                    <p className="mt-2 text-xs text-[color:var(--text-muted)] truncate">
                      {video.channel}
                    </p>

                  </div>

                </a>
              ))}

            </div>

          </section>
        )}


        {/* ============================================
            FOOTER
        ============================================ */}

        {hasData && (
          <div className="mt-11 rounded-[22px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] px-5 py-4">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-[color:var(--text-muted)]">

              <span className="inline-flex items-center gap-1.5">

                <Play size={12} />

                Signals from recent YouTube travel content ·{' '}
                {data?.windowDays}-day window ·{' '}
                {data?.trackedDestinations} tracked destinations

              </span>

              <span>

                Scores computed by Touristo · Explanations written by AI
                from measured signals

              </span>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};


/*
|--------------------------------------------------------------------------
| Sub components
|--------------------------------------------------------------------------
*/

const RadarHeader = ({
  onBack,
  updatedLabel,
  refreshing,
  onRefresh
}) => (
  <header>

    <div className="flex items-start justify-between gap-4">

      <div className="min-w-0">

        <button
          onClick={onBack}
          className="
            inline-flex
            items-center
            gap-1.5
            text-xs
            font-semibold
            uppercase
            tracking-[0.16em]
            text-[color:var(--brand-gold-ink)]
            mb-3
          "
        >

          <ArrowLeft size={14} />

          Back

        </button>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
          Travel Radar
        </h1>

        <p className="mt-2 max-w-2xl text-sm sm:text-base leading-6 text-[color:var(--text-secondary)]">

          Discover where Pakistan is trending right now — measured from
          recent travel creator activity, not opinions.

        </p>

      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh travel radar"
          className="
            shrink-0
            w-11
            h-11
            rounded-full
            border
            border-[color:var(--border-light)]
            bg-[color:var(--surface-primary)]
            text-[color:var(--text-primary)]
            flex
            items-center
            justify-center
            hover:bg-[color:var(--bg-secondary)]
            disabled:opacity-50
            transition-colors
          "
        >

          <RefreshCw
            size={17}
            className={
              refreshing
                ? 'animate-spin'
                : ''
            }
          />

        </button>
      )}

    </div>

    {updatedLabel && (
      <p className="mt-3 text-xs text-[color:var(--text-muted)]">
        {updatedLabel}
      </p>
    )}

    <div className="mt-4 flex flex-wrap items-center gap-2">

      <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
        Signal sources
      </span>

      <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--success)]/25 bg-[color:var(--success-soft)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--success)]">
        <span
          className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)]"
          aria-hidden="true"
        />
        YouTube — Live
      </span>

      {[
        'Instagram',
        'TikTok',
        'Search trends'
      ].map((source) => (
        <span
          key={source}
          className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--text-muted)]"
        >
          <span
            className="h-1.5 w-1.5 rounded-full bg-[color:var(--text-muted)]/50"
            aria-hidden="true"
          />
          {source} — Coming soon
        </span>
      ))}

    </div>

  </header>
);


const SectionHeading = ({
  eyebrow,
  title,
  description
}) => (
  <div className="max-w-2xl">

    <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[color:var(--brand-gold-ink)]">
      {eyebrow}
    </span>

    <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-[color:var(--text-primary)]">
      {title}
    </h2>

    {description && (
      <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
        {description}
      </p>
    )}

  </div>
);


const Metric = ({ icon, label, value }) => (
  <div className="rounded-xl bg-[color:var(--bg-secondary)] px-3 py-2.5">

    <div className="flex items-center gap-1.5 text-[color:var(--text-muted)]">

      {icon}

      <span className="text-[10px] uppercase tracking-wider">
        {label}
      </span>

    </div>

    <p className="mt-1 text-sm font-semibold text-[color:var(--text-primary)]">
      {value}
    </p>

  </div>
);


export default TravelTrendRadar;
