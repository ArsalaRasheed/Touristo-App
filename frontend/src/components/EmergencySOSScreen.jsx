import React, { useState } from 'react';

const EmergencySOSScreen = () => {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const emergencyContacts = [
    { name: "Police", number: "15", icon: "👮", color: "bg-red-100 text-red-600" },
    { name: "Ambulance", number: "115", icon: "🚑", color: "bg-red-100 text-red-600" },
    { name: "Fire Department", number: "115", icon: "🚒", color: "bg-red-100 text-red-600" },
    { name: "Women's Helpline", number: "1043", icon: "👩", color: "bg-pink-100 text-pink-600" },
    { name: "Child Protection", number: "1056", icon: "👶", color: "bg-blue-100 text-blue-600" },
    { name: "Tourist Police", number: "1222", icon: "👮‍♀️", color: "bg-purple-100 text-purple-600" }
  ];

  const touristHelpCenters = [
    { name: "Islamabad Tourism Center", location: "Blue Area, Islamabad", phone: "051-1234567" },
    { name: "Lahore Tourism Center", location: "Anarkali Bazaar, Lahore", phone: "042-1234567" },
    { name: "Karachi Tourism Center", location: "Clifton, Karachi", phone: "021-1234567" },
    { name: "Gilgit Tourism Office", location: "Main Bazaar, Gilgit", phone: "05811-12345" }
  ];

  // Function to get user's current location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(pos);
          setLocationError(null);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Unable to retrieve your location. Please ensure location services are enabled.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  // Function to share the location (simulated by copying to clipboard)
  const shareLocation = async () => {
    if (!location) {
      alert('Please get your location first.');
      return;
    }

    const locationUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    try {
      // Attempt to copy the location URL to clipboard
      await navigator.clipboard.writeText(locationUrl);
      alert('Your live location has been copied to clipboard! Share it with your relatives.');
    } catch (err) {
      console.error('Failed to copy location: ', err);
      // Fallback: open Google Maps in a new tab
      window.open(locationUrl, '_blank');
      alert('Opening your location in Google Maps. Please share the link from there.');
    }
  };


  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center text-[color:var(--text-primary)]">Emergency SOS</h1>
        <p className="text-[color:var(--text-secondary)] mb-8 text-center">Quick access to emergency services and tourist assistance</p>
        
        <div className="mb-8">
          <div className="text-center mb-6">
            <button
              onClick={getLocation}
              className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center text-white text-4xl animate-pulse shadow-lg hover:bg-red-600 transition"
              aria-label="Get current location for emergency help"
            >
              🆘
            </button>
            <p className="mt-4 text-lg font-bold text-[color:var(--text-primary)]">Tap for Emergency Help</p>
          </div>

          {/* Live Location Sharing Section */}
          <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">
            <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">Share Live Location</h2>
            <p className="text-[color:var(--text-secondary)] mb-4">
              Click the button below to get your current location and share it with your relatives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={getLocation}
                className="px-4 py-2 bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] rounded-lg hover:bg-[color:var(--accent-primary-hover)] transition"
              >
                Get My Location
              </button>
              <button
                onClick={shareLocation}
                disabled={!location}
                className={`px-4 py-2 rounded-lg transition ${
                  location
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Share Live Location
              </button>
            </div>
            {location && (
              <div className="mt-4 p-3 bg-[color:var(--surface-secondary)] rounded-lg border border-[color:var(--border-primary)]">
                <p className="text-sm text-[color:var(--text-secondary)]">
                  Current Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
            )}
            {locationError && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                <p className="text-sm">{locationError}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Emergency Contacts */}
        <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 mb-8 border border-[color:var(--border-primary)]">
          <h2 className="text-2xl font-bold mb-6 text-[color:var(--text-primary)]">Emergency Contacts</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {emergencyContacts.map((contact, index) => (
              <a 
                key={index} 
                href={`tel:${contact.number}`}
                className={`${contact.color} rounded-xl p-4 text-center flex flex-col items-center hover:opacity-90 transition`}
              >
                <div className="text-3xl mb-2">{contact.icon}</div>
                <div className="font-bold">{contact.name}</div>
                <div className="text-lg font-bold mt-1">{contact.number}</div>
              </a>
            ))}
          </div>
        </div>
        
        {/* Tourist Help Centers */}
        <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">
          <h2 className="text-2xl font-bold mb-6 text-[color:var(--text-primary)]">Tourist Help Centers</h2>
          
          <div className="space-y-4">
            {touristHelpCenters.map((center, index) => (
              <div key={index} className="p-4 bg-[color:var(--surface-secondary)] rounded-lg border border-[color:var(--border-primary)]">
                <div className="flex justify-between">
                  <h3 className="font-bold text-[color:var(--text-primary)]">{center.name}</h3>
                  <a 
                    href={`tel:${center.phone}`} 
                    className="text-[color:var(--accent-primary)] font-medium"
                  >
                    {center.phone}
                  </a>
                </div>
                <p className="text-[color:var(--text-secondary)]">{center.location}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Safety Tips */}
        <div className="mt-8 bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">
          <h2 className="text-2xl font-bold mb-4 text-[color:var(--text-primary)]">Safety Tips</h2>
          <ul className="list-disc pl-6 space-y-2 text-[color:var(--text-secondary)]">
            <li>Always inform someone about your travel plans</li>
            <li>Carry identification and emergency contacts</li>
            <li>Stay aware of your surroundings</li>
            <li>Respect local customs and regulations</li>
            <li>Keep important documents in a safe place</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmergencySOSScreen;