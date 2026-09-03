import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import auth context

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth(); // Get user from auth context

  // Define navigation items for travelers
  const travelerNavItems = [
    { to: '/home', label: 'Home', icon: '🏠' },
    { to: '/destinations', label: 'Destinations', icon: '🌍' },
    { to: '/host-discovery', label: 'Hosts', icon: '🏨' }, // Travelers see 'Hosts' instead of 'Host Dashboard'
    { to: '/trip-planner', label: 'AI Planner', icon: '🤖' },
    { to: '/tour-guide-comparison', label: 'Compare Guides', icon: '🧭' },
    { to: '/my-trips', label: 'My Trips', icon: '🧳' },
    { to: '/sos', label: 'SOS', icon: '🚨' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  // Define navigation items for hosts
  const hostNavItems = [
    { to: '/host-dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/my-packages', label: 'My Packages', icon: '📦' },
    { to: '/host/guides', label: 'Guides', icon: '🧑‍🏫' },
    { to: '/bookings', label: 'Bookings', icon: '📅' },
    { to: '/sos', label: 'SOS', icon: '🚨' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  // Select navigation items based on user role
  const navItems = user?.role === 'host' ? hostNavItems : travelerNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 p-2" style={{ 
      backgroundColor: 'var(--nav-footer-bg)',
      borderTop: '1px solid var(--border-primary)'
    }}>
      <div className="flex justify-around">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center p-1 rounded-lg text-xs`}
            style={{
              color: location.pathname === item.to
                ? 'var(--accent-primary)'
                : 'var(--nav-text)'
            }}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;