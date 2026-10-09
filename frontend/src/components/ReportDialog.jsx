import { useEffect, useRef, useState } from 'react';
import { Flag, Loader2, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const REPORT_REASONS = [
  'spam',
  'inappropriate content',
  'scam or fraud',
  'harassment',
  'fake listing',
  'other'
];

const TARGET_NOUNS = {
  review: 'review',
  package: 'package',
  user: 'account',
  host: 'tour company'
};

/*
|--------------------------------------------------------------------------
| Shared report dialog
|--------------------------------------------------------------------------
| One component for every report entry point: reviews, packages, hosts
| and user accounts.
*/

const ReportDialog = ({
  targetType,
  targetId,
  targetLabel,
  onClose,
  onReported
}) => {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reasonRef = useRef(null);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    reasonRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape' && !submitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, submitting]);

  const submit = async event => {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          details: details.trim()
        })
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || 'Could not submit the report'
        );
      }

      setSubmitted(true);
      onReported?.();
    } catch (err) {
      setError(err.message || 'Could not submit the report');
    } finally {
      setSubmitting(false);
    }
  };

  const noun = TARGET_NOUNS[targetType] || 'content';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        className="w-full max-w-md rounded-[24px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] p-5 shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--danger-soft)] text-[color:var(--danger)]">
              <Flag className="h-4 w-4" />
            </span>

            <div>
              <h2
                id="report-dialog-title"
                className="text-base text-[color:var(--text-primary)]"
              >
                Report this {noun}
              </h2>

              <p className="text-xs text-[color:var(--text-secondary)]">
                Our moderators review every report.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close report dialog"
            className="rounded-lg p-1.5 text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-secondary)] hover:text-[color:var(--text-primary)] disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="mt-5">
            <div className="flex items-start gap-2 rounded-xl border border-[color:var(--success)]/30 bg-[color:var(--success-soft)] px-4 py-3 text-sm text-[color:var(--success)]">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Report submitted. Our moderators will review it.
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary mt-4 w-full justify-center"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            {targetLabel && (
              <p className="rounded-xl border border-[color:var(--border-light)] bg-[color:var(--surface-secondary)] px-4 py-2.5 text-sm text-[color:var(--text-secondary)] line-clamp-2">
                {targetLabel}
              </p>
            )}

            <div>
              <label
                htmlFor="report-reason"
                className="mb-1 block text-sm text-[color:var(--text-secondary)]"
              >
                Reason
              </label>

              <select
                id="report-reason"
                ref={reasonRef}
                value={reason}
                onChange={event => setReason(event.target.value)}
                className="input w-full"
              >
                {REPORT_REASONS.map(item => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="report-details"
                className="mb-1 block text-sm text-[color:var(--text-secondary)]"
              >
                Details (optional)
              </label>

              <textarea
                id="report-details"
                rows={3}
                maxLength={1000}
                value={details}
                onChange={event => setDetails(event.target.value)}
                placeholder="Add anything that helps our moderators understand the issue."
                className="input w-full resize-none leading-6"
              />

              <p className="mt-1 text-right text-xs text-[color:var(--text-muted)]">
                {details.length} / 1000
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-[color:var(--danger)]/35 bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]"
              >
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary flex-1 justify-center"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Flag className="h-4 w-4" />
                )}
                Submit report
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportDialog;
