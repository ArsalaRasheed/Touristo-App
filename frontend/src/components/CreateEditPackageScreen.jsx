import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreateEditPackageScreen = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    price: '',
    duration_days: '',
    itinerary: '',
    inclusions: '',
    exclusions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { user, getAuthHeader } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.destination || !formData.price || !formData.duration_days) {
      setError('Please fill in all required fields: Title, Description, Destination, Price, and Duration');
      setLoading(false);
      return;
    }

    try {
      const hostResponse = await fetch(`http://localhost:3000/api/hosts/user/${user.id}`, { headers: getAuthHeader() });
      if (!hostResponse.ok) throw new Error('Could not load your company profile');
      const hostData = await hostResponse.json();
      const hostId = hostData.data?.host?.id;
      if (!hostId) throw new Error('No company profile is linked to this account');

      // Prepare package data
      const packageData = {
        host_id: hostId,
        title: formData.title,
        description: formData.description,
        destination: formData.destination,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days),
        inclusions: formData.inclusions ? formData.inclusions.split('\n').filter(i => i.trim()) : [],
        exclusions: formData.exclusions ? formData.exclusions.split('\n').filter(e => e.trim()) : [],
        itinerary: formData.itinerary // Would need to parse this into structured format in real app
      };

      // Make API call to create package
      const response = await fetch('http://localhost:3000/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader() // Include the authorization header
        },
        body: JSON.stringify(packageData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create package');
      }

      const result = await response.json();
      console.log('Package created:', result.data.package);
      
      // Navigate back to dashboard on success
      navigate('/host-dashboard');
    } catch (err) {
      console.error('Error creating package:', err);
      setError(err.message || 'An error occurred while creating the package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-[color:var(--text-primary)]">Create New Package</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-[color:var(--text-secondary)] mb-1">Package Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="e.g., Hunza Valley Adventure"
              />
            </div>
            <div>
              <label htmlFor="destination" className="block text-[color:var(--text-secondary)] mb-1">Destination *</label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="e.g., Hunza, Gilgit-Baltistan"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-[color:var(--text-secondary)] mb-1">Description *</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
              placeholder="Describe your package..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="price" className="block text-[color:var(--text-secondary)] mb-1">Price (PKR) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="e.g., 50000"
              />
            </div>
            <div>
              <label htmlFor="duration_days" className="block text-[color:var(--text-secondary)] mb-1">Duration (Days) *</label>
              <input
                type="number"
                id="duration_days"
                name="duration_days"
                value={formData.duration_days}
                onChange={handleChange}
                required
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <label htmlFor="imageUpload" className="block text-[color:var(--text-secondary)] mb-1">Add Photos</label>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                multiple
                className="w-full p-2 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="itinerary" className="block text-[color:var(--text-secondary)] mb-1">Detailed Itinerary *</label>
            <textarea
              id="itinerary"
              name="itinerary"
              rows="6"
              value={formData.itinerary}
              onChange={handleChange}
              required
              className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
              placeholder="Day 1: Arrive in Hunza, Day 2: Attabad Lake..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="inclusions" className="block text-[color:var(--text-secondary)] mb-1">Inclusions</label>
              <textarea
                id="inclusions"
                name="inclusions"
                rows="3"
                value={formData.inclusions}
                onChange={handleChange}
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="e.g., Transport, Accommodation, Meals&#10;Guide services, Entry fees"
              ></textarea>
            </div>
            <div>
              <label htmlFor="exclusions" className="block text-[color:var(--text-secondary)] mb-1">Exclusions</label>
              <textarea
                id="exclusions"
                name="exclusions"
                rows="3"
                value={formData.exclusions}
                onChange={handleChange}
                className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                placeholder="e.g., Personal expenses, Tipping&#10;Entrance fees, Meals"
              ></textarea>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-lg font-semibold transition duration-200 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)]'
              }`}
            >
              {loading ? 'Publishing...' : 'Publish Package'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)} // Go back
              className="flex-1 bg-[color:var(--surface-secondary)] hover:bg-[color:var(--border-primary)] text-[color:var(--text-primary)] py-3 rounded-lg font-semibold transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditPackageScreen;