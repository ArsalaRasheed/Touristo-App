import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GuideComparisonScreen = () => {
  const [guides, setGuides] = useState([]);
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/tour-guides')
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Could not load guides')))
      .then(result => setGuides(result.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const rankedGuides = [...guides].sort((first, second) => {
    const query = preferences.toLowerCase();
    const firstMatch = query && first.specialty.toLowerCase().includes(query) ? 1 : 0;
    const secondMatch = query && second.specialty.toLowerCase().includes(query) ? 1 : 0;
    return secondMatch - firstMatch || Number(second.rating || 0) - Number(first.rating || 0);
  });

  return (
    <main className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 text-[color:var(--accent-primary)]">Back</button>
        <h1 className="text-3xl font-bold mb-2">Compare Tour Guides</h1>
        <p className="text-[color:var(--text-secondary)] mb-6">Find the guide whose expertise fits your trip.</p>
        <input value={preferences} onChange={event => setPreferences(event.target.value)} placeholder="Try: trekking, culture, family" className="w-full p-3 mb-6 rounded-lg border border-[color:var(--border-primary)] bg-[color:var(--surface-primary)]" />
        {loading && <p>Loading guides...</p>}
        {error && <p className="text-red-600">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rankedGuides.map((guide, index) => (
            <article key={guide.id} className="bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-xl p-5">
              {index === 0 && <span className="text-sm font-bold text-[color:var(--accent-primary)]">Best match</span>}
              <h2 className="text-xl font-bold mt-2">{guide.name}</h2>
              <p className="text-[color:var(--accent-primary)]">{guide.specialty}</p>
              <p className="mt-3">Rating: {Number(guide.rating || 0).toFixed(1)} / 5</p>
              <p className="text-sm text-[color:var(--text-secondary)]">Company guide #{guide.host_id}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default GuideComparisonScreen;
