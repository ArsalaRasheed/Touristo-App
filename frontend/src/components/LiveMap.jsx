import React, { useEffect, useRef } from 'react';

const LiveMap = ({ userLocation, destinationLocation, onMapLoaded }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    // Dynamically load Leaflet CSS and JS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current && userLocation && destinationLocation) {
      updateMap();
    }
  }, [userLocation, destinationLocation]);

  const initMap = () => {
    // Wait a bit for Leaflet to load
    setTimeout(() => {
      if (typeof L !== 'undefined') {
        // Initialize the map
        mapInstance.current = L.map(mapRef.current).setView([30.3753, 69.3451], 6); // Center on Pakistan
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current);
        
        // Mark the user's location if available
        if (userLocation) {
          L.marker([userLocation.lat, userLocation.lng])
            .addTo(mapInstance.current)
            .bindPopup('Your Location')
            .openPopup();
        }
        
        // Mark the destination if available
        if (destinationLocation) {
          L.marker([destinationLocation.lat, destinationLocation.lng])
            .addTo(mapInstance.current)
            .bindPopup('Destination')
            .openPopup();
        }
        
        onMapLoaded && onMapLoaded();
      }
    }, 500);
  };

  const updateMap = () => {
    // Clear existing markers
    mapInstance.current.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        mapInstance.current.removeLayer(layer);
      }
    });
    
    // Add user location marker
    if (userLocation) {
      L.marker([userLocation.lat, userLocation.lng], { 
        icon: L.divIcon({ 
          className: 'user-marker', 
          html: '<div style="background-color: #008080; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      })
        .addTo(mapInstance.current)
        .bindPopup('Your Location')
        .openPopup();
    }
    
    // Add destination marker
    if (destinationLocation) {
      L.marker([destinationLocation.lat, destinationLocation.lng], {
        icon: L.divIcon({
          className: 'destination-marker',
          html: '<div style="background-color: #FF5722; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      })
        .addTo(mapInstance.current)
        .bindPopup('Destination')
        .openPopup();
    }
    
    // Fit bounds to show both locations
    if (userLocation && destinationLocation) {
      const group = new L.featureGroup([
        L.marker([userLocation.lat, userLocation.lng]),
        L.marker([destinationLocation.lat, destinationLocation.lng])
      ]);
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    } else if (userLocation) {
      mapInstance.current.setView([userLocation.lat, userLocation.lng], 13);
    } else if (destinationLocation) {
      mapInstance.current.setView([destinationLocation.lat, destinationLocation.lng], 13);
    }
  };

  return <div ref={mapRef} style={{ height: '200px', width: '100%', borderRadius: '8px' }} />;
};

export default LiveMap;