import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, Trash2, UserPlus, Users } from 'lucide-react';

const ManageTourGuidesScreen = () => {
  const { user, getAuthHeader } = useAuth();
  const [hostId, setHostId] = useState(null);
  const [guides, setGuides] = useState([]);
  const [form, setForm] = useState({ name: '', specialty: '', photo: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const loadGuides = async id => {
    const response = await fetch(`/api/tour-guides/host/${id}`);
    const result = await response.json();
    setGuides(result.data || []);
  };

  useEffect(() => {
    if (!user) return;
    fetch(`/api/hosts/user/${user.id}`, { headers: getAuthHeader() })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Could not load company profile')))
      .then(result => { setHostId(result.data.host.id); return loadGuides(result.data.host.id); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, getAuthHeader]);

  const addGuide = async event => {
    event.preventDefault();
    setError('');
    setStatus('');
    setSaving(true);
    try {
      const response = await fetch('/api/tour-guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ ...form, host_id: hostId })
      });
      if (!response.ok) throw new Error('Could not add guide');
      setForm({ name: '', specialty: '', photo: '' });
      await loadGuides(hostId);
      setStatus('Guide added.');
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const removeGuide = async id => {
    setError('');
    const response = await fetch(`/api/tour-guides/${id}`, { method: 'DELETE', headers: getAuthHeader() });
    if (response.ok) {
      setGuides(current => current.filter(guide => guide.id !== id));
      setStatus('Guide removed.');
    } else {
      setError('Could not remove this guide.');
    }
  };

  return (
    <main className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <header className="mb-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-gold-ink)]">
            Host tools
          </p>

          <h1 className="mt-2 text-3xl tracking-[-0.03em] text-[color:var(--text-primary)]">
            Manage Tour Guides
          </h1>

          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
            Add the guides who lead your tours so travellers can recognise
            them before booking.
          </p>
        </header>

        <div aria-live="polite" className="sr-only">
          {status}
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-[color:var(--danger)]/35 bg-[color:var(--danger-soft)] px-4 py-3 text-sm font-medium text-[color:var(--danger)]"
          >
            {error}
          </p>
        )}

        <form
          onSubmit={addGuide}
          className="card p-5 mb-8 grid gap-3 md:grid-cols-3"
        >
          <div>
            <label htmlFor="guide-name" className="mb-1 block text-xs font-semibold text-[color:var(--text-secondary)]">
              Guide name
            </label>

            <input
              id="guide-name"
              required
              value={form.name}
              onChange={event => setForm({ ...form, name: event.target.value })}
              placeholder="e.g. Ayesha Khan"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="guide-specialty" className="mb-1 block text-xs font-semibold text-[color:var(--text-secondary)]">
              Specialty
            </label>

            <input
              id="guide-specialty"
              required
              value={form.specialty}
              onChange={event => setForm({ ...form, specialty: event.target.value })}
              placeholder="e.g. Hunza valley treks"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="guide-photo" className="mb-1 block text-xs font-semibold text-[color:var(--text-secondary)]">
              Photo URL <span className="font-normal text-[color:var(--text-muted)]">(optional)</span>
            </label>

            <input
              id="guide-photo"
              type="url"
              value={form.photo}
              onChange={event => setForm({ ...form, photo: event.target.value })}
              placeholder="https://..."
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary md:col-span-3 justify-center disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" />
            {saving ? 'Adding…' : 'Add Guide'}
          </button>
        </form>

        {loading ? (
          <div className="flex items-center justify-center py-14" role="status">
            <span className="loading-spinner" />
            <span className="sr-only">Loading guides…</span>
          </div>
        ) : guides.length === 0 ? (
          <div className="card card-static p-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]">
              <Users className="h-5 w-5" />
            </span>

            <p className="mt-3 font-semibold text-[color:var(--text-primary)]">
              No tour guides yet
            </p>

            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[color:var(--text-secondary)]">
              Add your first guide above and their name will appear on your
              packages.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {guides.map(guide => (
              <article
                key={guide.id}
                className="card flex items-start justify-between gap-3 p-5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  {guide.photo ? (
                    <img
                      src={guide.photo}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-primary-soft)] text-sm font-semibold text-[color:var(--brand-primary)]">
                      {(guide.name || '?').charAt(0).toUpperCase()}
                    </span>
                  )}

                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-[color:var(--text-primary)]">
                      {guide.name}
                    </h2>

                    <p className="truncate text-sm text-[color:var(--text-secondary)]">
                      {guide.specialty}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[color:var(--text-muted)]">
                      <Star
                        className="h-3.5 w-3.5 fill-[color:var(--brand-gold-ink)] text-[color:var(--brand-gold-ink)]"
                        aria-hidden="true"
                      />
                      {Number(guide.rating || 0).toFixed(1)} rating
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeGuide(guide.id)}
                  aria-label={`Remove ${guide.name}`}
                  className="btn btn-ghost shrink-0 text-[color:var(--danger)] hover:bg-[color:var(--danger-soft)]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ManageTourGuidesScreen;
