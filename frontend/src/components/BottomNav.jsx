import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Traveler: Home | Search | AI Planner | SOS | Profile
  const travelerNavItems = [
    {
      to: '/home',
      label: 'Home',
      icon: '🏠',
    },
    {
      to: '/search',
      label: 'Search',
      icon: '🔍',
    },
    {
      to: '/trip-planner',
      label: 'AI Planner',
      icon: '🤖',
    },
    {
      to: '/sos',
      label: 'SOS',
      icon: '🆘',
      isSOS: true,
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: '👤',
    },
  ];

  // Host: Dashboard | My Packages | Bookings | Profile
  const hostNavItems = [
    {
      to: '/host-dashboard',
      label: 'Dashboard',
      icon: '📊',
    },
    {
      to: '/my-packages',
      label: 'My Packages',
      icon: '📦',
    },
    {
      to: '/bookings',
      label: 'Bookings',
      icon: '📅',
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: '👤',
    },
  ];

  const navItems =
    user?.role === 'host' ? hostNavItems : travelerNavItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 h-16"
      style={{
        backgroundColor: 'var(--nav-footer-bg)',
        borderTop: '1px solid var(--border-primary)',
      }}
    >
      <div className="flex items-center justify-around h-full px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex-1 h-full flex flex-col items-center justify-center text-xs transition-all duration-200"
              style={{
                color: isActive
                  ? 'var(--accent-primary)'
                  : 'var(--nav-text)',
              }}
            >
              {item.isSOS ? (
                <>
                  <span
                    className={`flex items-center justify-center w-9 h-9 rounded-full text-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-red-600 scale-105'
                        : 'bg-red-50'
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span
                    className={`mt-0.5 whitespace-nowrap ${
                      isActive ? 'font-bold' : 'font-semibold'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg leading-none">
                    {item.icon}
                  </span>

                  <span
                    className={`mt-1 whitespace-nowrap ${
                      isActive ? 'font-semibold' : ''
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;