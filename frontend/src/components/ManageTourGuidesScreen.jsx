import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ManageTourGuidesScreen = () => {
  const { user, getAuthHeader } = useAuth();
  const [hostId, setHostId] = useState(null);
  const [guides, setGuides] = useState([]);
  const [form, setForm] = useState({ name: '', specialty: '', photo: '' });
  const [error, setError] = useState('');

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
      .catch(err => setError(err.message));
  }, [user, getAuthHeader]);

  const addGuide = async event => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/tour-guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ ...form, host_id: hostId })
      });
      if (!response.ok) throw new Error('Could not add guide');
      setForm({ name: '', specialty: '', photo: '' });
      await loadGuides(hostId);
    } catch (err) { setError(err.message); }
  };

  const removeGuide = async id => {
    const response = await fetch(`/api/tour-guides/${id}`, { method: 'DELETE', headers: getAuthHeader() });
    if (response.ok) setGuides(current => current.filter(guide => guide.id !== id));
  };

  return (
    <main className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Manage Tour Guides</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={addGuide} className="bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-xl p-5 mb-8 grid gap-3 md:grid-cols-3">
          <input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Guide name" className="p-3 rounded-lg border" />
          <input required value={form.specialty} onChange={event => setForm({ ...form, specialty: event.target.value })} placeholder="Specialty" className="p-3 rounded-lg border" />
          <input value={form.photo} onChange={event => setForm({ ...form, photo: event.target.value })} placeholder="Photo URL" className="p-3 rounded-lg border" />
          <button type="submit" className="md:col-span-3 bg-[color:var(--accent-primary)] text-white p-3 rounded-lg">Add Guide</button>
        </form>
        <div className="grid gap-4 md:grid-cols-2">
          {guides.map(guide => <article key={guide.id} className="bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-xl p-5 flex justify-between items-start"><div><h2 className="font-bold text-lg">{guide.name}</h2><p>{guide.specialty}</p><p className="text-sm">Rating: {guide.rating || 0}</p></div><button onClick={() => removeGuide(guide.id)} className="text-red-600">Delete</button></article>)}
        </div>
      </div>
    </main>
  );
};

export default ManageTourGuidesScreen;
