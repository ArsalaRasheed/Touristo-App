const Package = require('../models/Package');
const aiService = require('../services/aiService');

/*
|--------------------------------------------------------------------------
| Travel Trend Radar
|--------------------------------------------------------------------------
| Design rules for this file:
|
| 1. Every number sent to the client is measured from a real provider
|    response (YouTube Data API) or computed from those measurements.
| 2. The trend score is calculated here from weighted, observable
|    signals. Gemini is only used to EXPLAIN the measured signals.
| 3. Any AI text that contains a number which is not present in the
|    measured signals is discarded and replaced with a deterministic
|    explanation.
| 4. No percentage growth is reported unless a real earlier snapshot
|    of the same signals exists in memory.
|
| Provider layer:
|   TravelTrendProvider -> { id, fetch(destination) -> signals }
|   YouTubeProvider (implemented below)
|   InstagramProvider / TikTokProvider / SearchTrendProvider (future)
|
| A future source only has to implement the provider contract and be
| registered in `trendProviders`. Nothing else in this file changes.
|--------------------------------------------------------------------------
*/

const YOUTUBE_API_URL =
  'https://www.googleapis.com/youtube/v3';

const TREND_WINDOW_DAYS = 30;
const RECENT_WINDOW_DAYS = 14;
const MAX_DESTINATIONS = 8;
const MAX_RESULTS_PER_DESTINATION = 12;

const CACHE_TTL_MS =
  10 * 60 * 1000;

const MIN_SNAPSHOT_AGE_MS =
  60 * 1000;

const MAX_SNAPSHOT_AGE_MS =
  6 * 60 * 60 * 1000;


/*
|--------------------------------------------------------------------------
| Formatting helpers
|--------------------------------------------------------------------------
*/

const clampScore = value => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, Math.round(value))
  );
};


const formatCompact = raw => {
  const value = Number(raw || 0);

  if (value >= 1000000000) {
    return `${(
      value / 1000000000
    ).toFixed(1)}B`;
  }

  if (value >= 1000000) {
    return `${(
      value / 1000000
    ).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return String(value);
};


const daysAgoIso = days =>
  new Date(
    Date.now() -
      days * 24 * 60 * 60 * 1000
  ).toISOString();


const isWithinDays = (iso, days) => {
  if (!iso) {
    return false;
  }

  const time =
    Date.parse(iso);

  if (!Number.isFinite(time)) {
    return false;
  }

  return (
    time >=
    Date.now() -
      days * 24 * 60 * 60 * 1000
  );
};


const safeText = (value, maxLength) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLength);
};


/*
|--------------------------------------------------------------------------
| YouTube provider
|--------------------------------------------------------------------------
*/

const fetchYouTubeSignals =
  async destination => {
    const apiKey =
      process.env.YOUTUBE_API_KEY;

    const empty = {
      id: 'youtube',
      available: false,
      unavailableReason:
        'not_configured',
      destination,
      videos: [],
      totalViews: 0,
      uniqueCreators: 0
    };

    if (!apiKey) {
      return empty;
    }

    try {
      const searchParams =
        new URLSearchParams({
          part: 'snippet',
          q: `${destination} Pakistan travel`,
          type: 'video',
          order: 'relevance',
          maxResults: String(
            MAX_RESULTS_PER_DESTINATION
          ),
          publishedAfter:
            daysAgoIso(TREND_WINDOW_DAYS),
          regionCode: 'PK',
          relevanceLanguage: 'en',
          key: apiKey
        });

      const searchResponse =
        await fetch(
          `${YOUTUBE_API_URL}/search?${searchParams.toString()}`
        );

      if (
        !searchResponse.ok
      ) {
        console.error(
          `Travel Radar YouTube search failed (${searchResponse.status}) for ${destination}`
        );

        return {
          ...empty,
          unavailableReason:
            searchResponse.status === 403
              ? 'quota_exceeded'
              : 'provider_error'
        };
      }

      const searchData =
        await searchResponse.json();

      const videoIds = (
        searchData.items || []
      )
        .map(
          item =>
            item?.id?.videoId
        )
        .filter(Boolean);

      if (!videoIds.length) {
        return {
          ...empty,
          available: true,
          unavailableReason: null
        };
      }

      const videoParams =
        new URLSearchParams({
          part: 'snippet,statistics',
          id: videoIds.join(','),
          key: apiKey
        });

      const videoResponse =
        await fetch(
          `${YOUTUBE_API_URL}/videos?${videoParams.toString()}`
        );

      if (!videoResponse.ok) {
        console.error(
          `Travel Radar YouTube videos failed (${videoResponse.status}) for ${destination}`
        );

        return {
          ...empty,
          available: false,
          unavailableReason:
            'provider_error'
        };
      }

      const videoData =
        await videoResponse.json();

      const videos = (
        videoData.items || []
      )
        .map(video => {
          const id =
            video.id;

          const channelId =
            video.snippet
              ?.channelId || null;

          return {
            id,

            title:
              safeText(
                video.snippet?.title,
                200
              ),

            channel:
              safeText(
                video.snippet
                  ?.channelTitle,
                120
              ) ||
              'Unknown creator',

            channelId,

            publishedAt:
              video.snippet
                ?.publishedAt || null,

            thumbnail:
              video.snippet
                ?.thumbnails?.high
                ?.url ||
              video.snippet
                ?.thumbnails?.medium
                ?.url ||
              null,

            views:
              Number(
                video.statistics
                  ?.viewCount || 0
              ),

            likes:
              Number(
                video.statistics
                  ?.likeCount || 0
              ),

            comments:
              Number(
                video.statistics
                  ?.commentCount || 0
              ),

            url:
              `https://www.youtube.com/watch?v=${id}`
          };
        })
        .filter(video =>
          Boolean(video.id)
        );

      const totalViews =
        videos.reduce(
          (sum, video) =>
            sum + video.views,
          0
        );

      const uniqueCreators =
        new Set(
          videos
            .map(
              video =>
                video.channelId ||
                video.channel
            )
            .filter(Boolean)
        ).size;

      return {
        id: 'youtube',
        available: true,
        unavailableReason: null,
        destination,
        videos,
        totalViews,
        uniqueCreators
      };
    } catch (error) {
      console.error(
        `Travel Radar YouTube error for ${destination}:`,
        error.message
      );

      return {
        ...empty,
        unavailableReason:
          'provider_error'
      };
    }
  };


/*
|--------------------------------------------------------------------------
| Provider registry
|--------------------------------------------------------------------------
*/

const trendProviders = [
  {
    id: 'youtube',
    fetch: fetchYouTubeSignals
  }
];


const collectSignals =
  async destination => {
    const results =
      await Promise.all(
        trendProviders.map(
          async provider => {
            try {
              return await provider.fetch(
                destination
              );
            } catch (error) {
              console.error(
                `Travel Radar provider ${provider.id} failed:`,
                error.message
              );

              return {
                id: provider.id,
                available: false,
                destination,
                videos: [],
                totalViews: 0,
                uniqueCreators: 0
              };
            }
          }
        )
      );

    const videos =
      results.flatMap(
        result => result.videos || []
      );

    const availableSources =
      results
        .filter(
          result => result.available
        )
        .map(result => result.id);

    const totalViews =
      results.reduce(
        (sum, result) =>
          sum +
          Number(
            result.totalViews || 0
          ),
        0
      );

    const uniqueCreators =
      new Set(
        videos
          .map(
            video =>
              video.channelId ||
              video.channel
          )
          .filter(Boolean)
      ).size;

    return {
      destination,
      available:
        availableSources.length > 0,
      availableSources,
      videos,
      totalViews,
      uniqueCreators
    };
  };


/*
|--------------------------------------------------------------------------
| Signal measurement
|--------------------------------------------------------------------------
*/

const measureSignals = item => {
  const videos =
    item.videos || [];

  const videoCount =
    videos.length;

  const totalViews =
    Number(item.totalViews || 0);

  const uniqueCreators =
    Number(
      item.uniqueCreators || 0
    );

  const topVideo =
    videoCount
      ? videos.reduce(
          (best, video) =>
            video.views > best.views
              ? video
              : best
        )
      : null;

  const avgViews =
    videoCount > 0
      ? Math.round(
          totalViews / videoCount
        )
      : 0;

  const recentVideos =
    videos.filter(video =>
      isWithinDays(
        video.publishedAt,
        RECENT_WINDOW_DAYS
      )
    );

  const likes = videos.reduce(
    (sum, video) =>
      sum +
      Number(video.likes || 0),
    0
  );

  const comments = videos.reduce(
    (sum, video) =>
      sum +
      Number(video.comments || 0),
    0
  );

  /*
   * Strongest creator for this destination:
   * the channel with the most combined views.
   */
  const creatorMap = new Map();

  videos.forEach(video => {
    const key =
      video.channelId ||
      video.channel;

    if (!key) {
      return;
    }

    const entry =
      creatorMap.get(key) || {
        key,
        name: video.channel,
        channelId:
          video.channelId || null,
        views: 0,
        videoCount: 0,
        topVideo: video
      };

    entry.views +=
      Number(video.views || 0);
    entry.videoCount += 1;

    if (
      video.views >
      (entry.topVideo?.views || 0)
    ) {
      entry.topVideo = video;
    }

    creatorMap.set(key, entry);
  });

  const topCreator =
    [...creatorMap.values()].sort(
      (a, b) => b.views - a.views
    )[0] || null;

  return {
    destination: item.destination,
    available: item.available,
    availableSources:
      item.availableSources || [],
    videos,
    videoCount,
    recentVideoCount:
      recentVideos.length,
    totalViews,
    uniqueCreators,
    avgViews,
    likes,
    comments,
    topVideo,
    topCreator,
    creators:
      [...creatorMap.values()]
  };
};


/*
|--------------------------------------------------------------------------
| Deterministic trend score
|--------------------------------------------------------------------------
|
| Weighted, normalized, observable signals only.
| No model output is used to decide the score.
|
|--------------------------------------------------------------------------
*/

const SCORE_WEIGHTS = {
  views: 0.35,
  creators: 0.2,
  volume: 0.2,
  recency: 0.15,
  engagement: 0.1
};


const calculateTrendScore = (
  measurement,
  context
) => {
  const parts = [];
  const weights = [];

  const push = (weight, ratio) => {
    if (ratio === null) {
      return;
    }

    weights.push(weight);
    parts.push(weight * ratio);
  };

  push(
    SCORE_WEIGHTS.views,
    context.maxViews > 0
      ? measurement.totalViews /
          context.maxViews
      : null
  );

  push(
    SCORE_WEIGHTS.creators,
    context.maxCreators > 0
      ? measurement.uniqueCreators /
          context.maxCreators
      : null
  );

  push(
    SCORE_WEIGHTS.volume,
    context.maxVideos > 0
      ? measurement.videoCount /
          context.maxVideos
      : null
  );

  push(
    SCORE_WEIGHTS.recency,
    context.maxRecentVideos > 0
      ? measurement.recentVideoCount /
          context.maxRecentVideos
      : null
  );

  push(
    SCORE_WEIGHTS.engagement,
    context.maxEngagement > 0
      ? (measurement.likes +
          measurement.comments) /
          context.maxEngagement
      : null
  );

  const totalWeight =
    weights.reduce(
      (sum, weight) =>
        sum + weight,
      0
    );

  if (!totalWeight) {
    return 0;
  }

  const weighted = parts.reduce(
    (sum, part) => sum + part,
    0
  );

  return clampScore(
    (weighted / totalWeight) * 100
  );
};


const getTrendLabel = score => {
  if (score >= 80) {
    return 'Rising Fast';
  }

  if (score >= 60) {
    return 'Trending';
  }

  if (score >= 35) {
    return 'Rising';
  }

  return 'Stable';
};


/*
|--------------------------------------------------------------------------
| Signal bullets (all values are measured)
|--------------------------------------------------------------------------
*/

const buildSignals = measurement => {
  const signals = [];

  if (!measurement.available) {
    signals.push(
      'No live provider signals for this destination right now'
    );

    return signals;
  }

  if (measurement.videoCount > 0) {
    signals.push(
      `${measurement.videoCount} travel ${
        measurement.videoCount === 1
          ? 'video'
          : 'videos'
      } published in the last ${TREND_WINDOW_DAYS} days`
    );
  }

  if (
    measurement.uniqueCreators > 0
  ) {
    signals.push(
      `${measurement.uniqueCreators} unique ${
        measurement.uniqueCreators === 1
          ? 'creator'
          : 'creators'
      } publishing about this destination`
    );
  }

  signals.push(
    `${formatCompact(
      measurement.totalViews
    )} combined views on tracked recent videos`
  );

  if (measurement.topVideo) {
    signals.push(
      `Highest performing video: "${measurement.topVideo.title}" with ${formatCompact(
        measurement.topVideo.views
      )} views`
    );
  }

  if (
    measurement.recentVideoCount > 0
  ) {
    signals.push(
      `${measurement.recentVideoCount} of those videos were published in the last ${RECENT_WINDOW_DAYS} days`
    );
  }

  if (
    measurement.likes +
      measurement.comments >
    0
  ) {
    signals.push(
      `${formatCompact(
        measurement.likes +
          measurement.comments
      )} combined likes and comments`
    );
  }

  return signals;
};


const buildFallbackExplanation =
  measurement => {
    if (!measurement.available) {
      return 'No live creator signals are available for this destination yet.';
    }

    if (
      measurement.videoCount === 0
    ) {
      return `No travel videos from the last ${TREND_WINDOW_DAYS} days were found for this destination.`;
    }

    const parts = [];

    parts.push(
      `${measurement.uniqueCreators} ${
        measurement.uniqueCreators === 1
          ? 'creator is'
          : 'creators are'
      } publishing about ${
        measurement.destination
      }`
    );

    parts.push(
      `${measurement.videoCount} recent ${
        measurement.videoCount === 1
          ? 'video'
          : 'videos'
      } generating ${formatCompact(
        measurement.totalViews
      )} combined views`
    );

    if (measurement.topVideo) {
      parts.push(
        `led by "${measurement.topVideo.title}" at ${formatCompact(
          measurement.topVideo.views
        )} views`
      );
    }

    return `${parts.join(', ')} in the last ${TREND_WINDOW_DAYS} days.`;
  };


/*
|--------------------------------------------------------------------------
| Velocity
|--------------------------------------------------------------------------
| Compares the current measurement with the last snapshot kept in this
| process. If no genuine earlier snapshot exists, velocity is reported
| as null and the client must NOT show a percentage.
|--------------------------------------------------------------------------
*/

const previousSnapshots =
  new Map();


const calculateVelocity = (
  measurement
) => {
  const previous =
    previousSnapshots.get(
      measurement.destination
    );

  if (!previous) {
    return null;
  }

  const age =
    Date.now() - previous.at;

  if (
    age < MIN_SNAPSHOT_AGE_MS ||
    age > MAX_SNAPSHOT_AGE_MS
  ) {
    return null;
  }

  if (
    !previous.totalViews ||
    !previous.videoCount
  ) {
    return null;
  }

  const viewRatio =
    measurement.totalViews /
    previous.totalViews;

  const creatorChange =
    previous.uniqueCreators > 0
      ? ((measurement.uniqueCreators -
          previous.uniqueCreators) /
          previous.uniqueCreators) *
        100
      : null;

  const videoChange =
    ((measurement.videoCount -
      previous.videoCount) /
      previous.videoCount) *
    100;

  if (viewRatio >= 1.2) {
    return {
      hasHistory: true,
      text: `↑ ${viewRatio.toFixed(
        1
      )}x recent view activity`
    };
  }

  if (
    creatorChange !== null &&
    creatorChange >= 10
  ) {
    return {
      hasHistory: true,
      text: `↑ ${Math.round(
        creatorChange
      )}% creator activity`
    };
  }

  if (videoChange >= 20) {
    return {
      hasHistory: true,
      text: `↑ ${Math.round(
        videoChange
      )}% publishing activity`
    };
  }

  return {
    hasHistory: true,
    text: 'Stable activity vs last snapshot'
  };
};


const storeSnapshot = measurement => {
  previousSnapshots.set(
    measurement.destination,
    {
      at: Date.now(),
      totalViews:
        measurement.totalViews,
      uniqueCreators:
        measurement.uniqueCreators,
      videoCount:
        measurement.videoCount
    }
  );
};


/*
|--------------------------------------------------------------------------
| AI explanation
|--------------------------------------------------------------------------
| Gemini receives the already-measured signals and writes a short
| explanation. The result is validated:
|   - must be a short string
|   - every number in it must already exist in the measured signals
| Anything that fails validation is discarded.
|--------------------------------------------------------------------------
*/

const extractNumbers = text => {
  const matches =
    String(text).match(
      /\d+(?:[.,]\d+)?[KMB]?/gi
    );

  return matches || [];
};


const buildAllowedNumbers = (
  measurement,
  score
) => {
  const allowed = new Set([
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    String(score),
    String(measurement.videoCount),
    String(
      measurement.recentVideoCount
    ),
    String(
      measurement.uniqueCreators
    ),
    formatCompact(
      measurement.totalViews
    ),
    formatCompact(measurement.avgViews),
    formatCompact(
      measurement.likes +
        measurement.comments
    ),
    String(
      Math.round(
        measurement.totalViews
      )
    ),
    String(
      Math.round(measurement.avgViews)
    ),
    String(
      measurement.topVideo?.views ||
        -1
    ),
    formatCompact(
      measurement.topVideo?.views || 0
    ),
    String(
      measurement.topCreator?.views ||
        -1
    ),
    formatCompact(
      measurement.topCreator?.views || 0
    ),
    ...extractNumbers(
      buildSignals(measurement).join(
        ' '
      )
    )
  ]);

  return allowed;
};


const isExplanationSafe = (
  text,
  allowedNumbers
) => {
  if (typeof text !== 'string') {
    return false;
  }

  const cleaned = safeText(
    text,
    400
  );

  if (cleaned.length < 15) {
    return false;
  }

  const numbers =
    extractNumbers(cleaned);

  return numbers.every(number =>
    allowedNumbers.has(number)
  );
};


const explainTrendsWithAI =
  async (measurements, scores) => {
    if (!aiService.isAiConfigured()) {
      return null;
    }

    try {
      const payload =
        measurements.map(
          measurement => ({
            destination:
              measurement.destination,
            trendScore:
              scores.get(
                measurement.destination
              ),
            trendLabel: getTrendLabel(
              scores.get(
                measurement.destination
              )
            ),
            signals: buildSignals(
              measurement
            )
          })
        );

      const prompt = `
You are the travel intelligence writer for Touristo,
a Pakistani travel marketplace.

Below are MEASURED signals for destinations tracked by
Touristo. They come from real YouTube data.

Write ONE short explanation per destination explaining
why it is trending based ONLY on those signals.

Rules:
- 26 words maximum.
- Never invent statistics, creator names, video titles,
  rankings outside this list, or global claims.
- You may only repeat numbers that already appear in the
  supplied signals.
- Do not mention Instagram, TikTok, Google Trends or any
  source that is not supplied.
- Plain text only, no markdown.

Return ONLY valid JSON in this shape:

{
  "explanations": {
    "hunza": "Hunza is trending because 6 recent videos from 4 creators generated 2.4M views this month."
  }
}

Keys must be the lowercased destination name.

MEASURED SIGNALS:

${JSON.stringify(
          payload,
          null,
          2
        )}
`;

      const result =
        await aiService.generateJson({
          prompt,
          temperature: 0.4,
          timeoutMs: 10000
        });

      const parsed = result.data;

      const map =
        parsed?.explanations ||
        parsed;

      if (
        !map ||
        typeof map !== 'object'
      ) {
        return null;
      }

      return map;
    } catch (error) {
      if (
        error instanceof
        aiService.AIError
      ) {
        console.warn(
          `[travel-radar-ai] provider=${error.provider} code=${error.code}`
        );

        return null;
      }

      console.error(
        'Travel Radar AI explanation failed:',
        error
      );

      return null;
    }
  };


/*
|--------------------------------------------------------------------------
| Response cache (protects YouTube quota)
|--------------------------------------------------------------------------
*/

let radarCache = {
  at: 0,
  payload: null
};


/*
|--------------------------------------------------------------------------
| Controller
|--------------------------------------------------------------------------
*/

const getTravelRadar = async (
  req,
  res
) => {
  try {
    if (
      radarCache.payload &&
      Date.now() - radarCache.at <
        CACHE_TTL_MS
    ) {
      return res
        .status(200)
        .json(radarCache.payload);
    }

    const packages =
      await Package.findAll();

    const destinations = [
      ...new Set(
        packages
          .map(
            pkg => pkg?.destination
          )
          .filter(Boolean)
      )
    ]
      .map(name =>
        String(name).trim()
      )
      .filter(Boolean)
      .slice(
        0,
        MAX_DESTINATIONS
      );

    if (!destinations.length) {
      const emptyPayload = {
        status: 'success',
        data: {
          lastUpdated:
            new Date().toISOString(),
          source:
            'YouTube creator signals',
          sources: [],
          scope:
            "Most trending among Touristo's tracked destinations",
          windowDays:
            TREND_WINDOW_DAYS,
          trackedDestinations: 0,
          dataAvailable: false,
          aiPowered: aiService.isAiConfigured(),
          featured: null,
          destinations: [],
          topCreators: [],
          velocityAvailable: false
        }
      };

      return res
        .status(200)
        .json(emptyPayload);
    }

    const rawSignals =
      await Promise.all(
        destinations.map(
          destination =>
            collectSignals(
              destination
            )
        )
      );

    const measurements =
      rawSignals.map(
        measureSignals
      );

    /*
     * Context maxima used to normalize
     * the score across tracked destinations.
     */
    const context = {
      maxViews: Math.max(
        ...measurements.map(
          m => m.totalViews
        ),
        0
      ),
      maxCreators: Math.max(
        ...measurements.map(
          m => m.uniqueCreators
        ),
        0
      ),
      maxVideos: Math.max(
        ...measurements.map(
          m => m.videoCount
        ),
        0
      ),
      maxRecentVideos: Math.max(
        ...measurements.map(
          m => m.recentVideoCount
        ),
        0
      ),
      maxEngagement: Math.max(
        ...measurements.map(
          m =>
            m.likes + m.comments
        ),
        0
      )
    };

    const scores = new Map();

    measurements.forEach(
      measurement => {
        scores.set(
          measurement.destination,
          calculateTrendScore(
            measurement,
            context
          )
        );
      }
    );

    const aiExplanations =
      await explainTrendsWithAI(
        measurements,
        scores
      );

    const velocities =
      measurements.map(
        measurement =>
          calculateVelocity(
            measurement
          )
      );

    const radar = measurements
      .map((measurement, index) => {
        const score = scores.get(
          measurement.destination
        );

        const allowedNumbers =
          buildAllowedNumbers(
            measurement,
            score
          );

        const aiText =
          aiExplanations?.[
            measurement.destination.toLowerCase()
          ];

        const aiExplanation =
          isExplanationSafe(
            aiText,
            allowedNumbers
          )
            ? safeText(
                aiText,
                400
              )
            : null;

        const velocity =
          velocities[index];

        storeSnapshot(measurement);

        return {
          destination:
            measurement.destination,

          trendScore: score,

          trendLabel:
            getTrendLabel(score),

          reason:
            aiExplanation ||
            buildFallbackExplanation(
              measurement
            ),

          aiExplanation,

          explanationSource:
            aiExplanation
              ? 'ai'
              : 'signals',

          signals: buildSignals(
            measurement
          ),

          velocity:

            velocity,

          velocityText:
            velocity?.text ||
            (
              score >= 60
                ? 'Strong recent creator activity'
                : measurement.videoCount > 0
                  ? 'Recent creator activity detected'
                  : null
            ),

          totalViews:
            measurement.totalViews,

          uniqueCreators:
            measurement.uniqueCreators,

          videoCount:
            measurement.videoCount,

          recentVideoCount:
            measurement.recentVideoCount,

          avgViews:
            measurement.avgViews,

          topVideo:
            measurement.topVideo
              ? {
                  title:
                    measurement
                      .topVideo.title,
                  views:
                    measurement
                      .topVideo.views,
                  channel:
                    measurement
                      .topVideo.channel,
                  channelId:
                    measurement
                      .topVideo
                      .channelId,
                  publishedAt:
                    measurement
                      .topVideo
                      .publishedAt,
                  thumbnail:
                    measurement
                      .topVideo
                      .thumbnail,
                  url:
                    measurement
                      .topVideo.url
                }
              : null,

          topCreator:
            measurement.topCreator
              ? {
                  name:
                    measurement
                      .topCreator.name,
                  channelId:
                    measurement
                      .topCreator
                      .channelId,
                  views:
                    measurement
                      .topCreator.views,
                  videoCount:
                    measurement
                      .topCreator
                      .videoCount,
                  topVideoTitle:
                    measurement
                      .topCreator
                      .topVideo?.title,
                  topVideoUrl:
                    measurement
                      .topCreator
                      .topVideo?.url
                }
              : null,

          videos: [
            ...measurement.videos
          ]
            .sort(
              (a, b) =>
                b.views - a.views
            )
            .slice(0, 4),

          dataAvailable:
            measurement.available,

          availableSources:
            measurement.availableSources
        };
      })
      .sort(
        (a, b) =>
          b.trendScore -
            a.trendScore ||
          b.totalViews - a.totalViews
      )
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));

    /*
     * Aggregated creator signals across
     * all tracked destinations.
     */
    const creatorMap = new Map();

    measurements.forEach(
      measurement => {
        measurement.creators.forEach(
          creator => {
            const existing =
              creatorMap.get(
                creator.key
              ) || {
                name: creator.name,
                channelId:
                  creator.channelId,
                views: 0,
                videoCount: 0,
                destinations: [],
                topVideo:
                  creator.topVideo
              };

            existing.views +=
              creator.views;
            existing.videoCount +=
              creator.videoCount;

            if (
              !existing.destinations.includes(
                measurement.destination
              )
            ) {
              existing.destinations.push(
                measurement.destination
              );
            }

            if (
              creator.topVideo
                ?.views >
              (existing.topVideo
                ?.views || 0)
            ) {
              existing.topVideo =
                creator.topVideo;
            }

            creatorMap.set(
              creator.key,
              existing
            );
          }
        );
      }
    );

    const topCreators = [
      ...creatorMap.values()
    ]
      .sort(
        (a, b) =>
          b.views - a.views
      )
      .slice(0, 6)
      .map(creator => ({
        name: creator.name,
        channelId: creator.channelId,
        views: creator.views,
        videoCount: creator.videoCount,
        destinations:
          creator.destinations,
        topVideo: creator.topVideo
          ? {
              title:
                creator.topVideo.title,
              views:
                creator.topVideo.views,
              url: creator.topVideo.url,
              thumbnail:
                creator.topVideo.thumbnail
            }
          : null
      }));

    const featured =
      radar[0] || null;

    const payload = {
      status: 'success',
      data: {
        lastUpdated:
          new Date().toISOString(),

        source:
          'YouTube creator signals',

        sources: [
          ...new Set(
            measurements.flatMap(
              measurement =>
                measurement.availableSources
            )
          )
        ],

        scope:
          "Most trending among Touristo's tracked destinations",

        windowDays:
          TREND_WINDOW_DAYS,

        trackedDestinations:
          radar.length,

        dataAvailable:
          measurements.some(
            measurement =>
              measurement.available
          ),

        aiPowered:
          aiService.isAiConfigured(),

        velocityAvailable:
          velocities.some(
            velocity =>
              Boolean(
                velocity?.hasHistory
              )
          ),

        featured,

        destinations: radar,

        topCreators
      }
    };

    radarCache = {
      at: Date.now(),
      payload
    };

    return res
      .status(200)
      .json(payload);
  } catch (error) {
    console.error(
      'Travel Radar error:',
      error
    );

    return res.status(500).json({
      status: 'error',
      message:
        'Failed to load travel trend radar'
    });
  }
};


module.exports = {
  getTravelRadar
};
