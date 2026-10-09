import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Flag,
  Inbox,
  Loader2,
  RefreshCw
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const TARGET_LABELS = {
  review: 'Review',
  package: 'Package',
  user: 'User account',
  host: 'Tour company'
};

const STATUS_STYLES = {
  open: 'bg-[color:var(--warning-soft)] text-[color:var(--warning)] border-[color:var(--warning)]/30',
  resolved: 'bg-[color:var(--success-soft)] text-[color:var(--success)] border-[color:var(--success)]/30',
  dismissed: 'bg-[color:var(--surface-secondary)] text-[color:var(--text-muted)] border-[color:var(--border-light)]'
};

const formatDate = value => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const MyReportsScreen = () => {
  const { getAuthHeader } = useAuth();

  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const loadReports = useCallback(
    async requestedPage => {
      try {
        const response = await fetch(
          `/api/reports/mine?page=${requestedPage}&limit=10`,
          { headers: getAuthHeader() }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message || 'Could not load your reports'
          );
        }

        setReports(data?.data?.reports || []);
        setPagination(data?.data?.pagination || null);
        setError('');
      } catch (err) {
        setError(err.message || 'Could not load your reports');
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader]
  );

  const loadRef = useRef(null);

  useEffect(() => {
    loadRef.current = loadReports;
  }, [loadReports]);

  useEffect(() => {
    loadRef.current?.(page);
  }, [page]);

  const reload = requestedPage => {
    setLoading(true);
    setError('');
    loadReports(requestedPage);
  };

  const goToPage = nextPage => {
    setLoading(true);
    setError('');
    setPage(nextPage);
  };

  const totalPages = pagination?.pages || 1;

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] pb-24 text-[color:var(--text-primary)]">
      <div className="mx-auto max-w-4xl px-4 pt-5 sm:px-6">

        <header className="mb-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--brand-primary)]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Link>

            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-gold-ink)]">
              Moderation
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-primary)] text-white shadow-[var(--shadow-md)]">
              <Flag className="h-7 w-7" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-gold-ink)]">
                My Reports
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                Reports you sent us.
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--text-secondary)] sm:text-base">
                Track what you reported and how our moderation team
                handled it.
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="space-y-3" role="status" aria-live="polite">
            <span className="sr-only">Loading your reports</span>

            {[0, 1, 2].map(item => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[color:var(--danger)]/35 bg-[color:var(--danger-soft)] p-5">
            <p
              role="alert"
              className="text-sm font-medium text-[color:var(--danger)]"
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() => reload(page)}
              className="btn btn-secondary mt-4"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-[26px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-8 text-center shadow-[var(--shadow-sm)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--surface-secondary)] text-[color:var(--text-muted)]">
              <Inbox className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              No reports yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[color:var(--text-secondary)]">
              If you ever see a scam, spam or inappropriate content,
              report it from the listing, review or profile and it will
              show up here.
            </p>

            <Link to="/destinations" className="btn btn-primary mt-5">
              Explore destinations
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {reports.map(report => (
                <li
                  key={report.id}
                  className="rounded-2xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-4 shadow-[var(--shadow-xs)] sm:p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--text-secondary)]">
                      {TARGET_LABELS[report.target_type] ||
                        report.target_type}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        STATUS_STYLES[report.status] ||
                        STATUS_STYLES.dismissed
                      }`}
                    >
                      {report.status === 'open'
                        ? 'Under review'
                        : report.status === 'resolved'
                          ? 'Resolved'
                          : 'Dismissed'}
                    </span>

                    <span className="ml-auto text-[11px] text-[color:var(--text-muted)]">
                      Sent {formatDate(report.created_at)}
                    </span>
                  </div>

                  <p className="mt-3 break-words text-sm font-semibold text-[color:var(--text-primary)]">
                    {report.target_label
                      ? `“${report.target_label}”`
                      : `${TARGET_LABELS[report.target_type] || 'Content'} #${
                          report.target_id
                        }`}
                  </p>

                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                    Reason: {report.reason}
                  </p>

                  {report.details && (
                    <p className="mt-2 break-words rounded-xl bg-[color:var(--surface-secondary)] px-3 py-2 text-xs leading-5 text-[color:var(--text-secondary)]">
                      {report.details}
                    </p>
                  )}

                  {report.status !== 'open' && (
                    <div className="mt-3 rounded-xl border border-[color:var(--border-light)] px-3 py-2 text-xs leading-5 text-[color:var(--text-secondary)]">
                      <span className="font-semibold text-[color:var(--text-primary)]">
                        Moderation update
                        {report.resolved_at
                          ? ` · ${formatDate(report.resolved_at)}`
                          : ''}
                        :
                      </span>{' '}
                      {report.resolution_note ||
                        (report.status === 'resolved'
                          ? 'This report was reviewed and actioned.'
                          : 'This report was reviewed and closed without action.')}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <nav
                className="mt-6 flex items-center justify-between gap-3"
                aria-label="Report pages"
              >
                <button
                  type="button"
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page <= 1 || loading}
                  className="btn btn-secondary"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <span className="text-xs text-[color:var(--text-muted)]">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => goToPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages || loading}
                  className="btn btn-secondary"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </>
        )}

        {loading && !error && reports.length > 0 && (
          <div className="mt-4 flex justify-center text-[color:var(--text-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

      </div>
    </div>
  );
};

export default MyReportsScreen;
