import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Traveler: exactly 5 items (locked spec)
  const travelerNavItems = [
    { to: '/home', label: 'Home', icon: '🏠' },
    { to: '/search', label: 'Search', icon: '🔍' },
    { to: '/trip-planner', label: 'AI Planner', icon: '🤖' },
    { to: '/my-trips', label: 'My Trips', icon: '🧳' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  // Host: exactly 4 items (locked spec)
  const hostNavItems = [
    { to: '/host-dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/my-packages', label: 'My Packages', icon: '📦' },
    { to: '/bookings', label: 'Bookings', icon: '📅' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  const navItems = user?.role === 'host' ? hostNavItems : travelerNavItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-16"
      style={{
        backgroundColor: 'var(--nav-footer-bg)',
        borderTop: '1px solid var(--border-primary)'
      }}
    >
      <div className="flex justify-around items-center h-full">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center text-xs flex-1"
            style={{
              color: location.pathname === item.to
                ? 'var(--accent-primary)'
                : 'var(--nav-text)'
            }}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="mt-1 whitespace-nowrap">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;