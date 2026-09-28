import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
  Home,
  Search,
  Sparkles,
  ShieldAlert,
  User,
  LayoutDashboard,
  Package,
  CalendarDays,
  MessageCircle
} from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const travelerNavItems = [
    {
      to: '/home',
      label: 'Home',
      icon: Home
    },
    {
      to: '/search',
      label: 'Search',
      icon: Search
    },
    {
      to: '/trip-planner',
      label: 'AI Planner',
      icon: Sparkles
    },
    {
      to: '/sos',
      label: 'SOS',
      icon: ShieldAlert,
      isSOS: true
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: User
    }
  ];

  const hostNavItems = [
    {
      to: '/host-dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      to: '/my-packages',
      label: 'Packages',
      icon: Package
    },
    {
      to: '/bookings',
      label: 'Bookings',
      icon: CalendarDays
    },
    {
      to: '/inbox',
      label: 'Messages',
      icon: MessageCircle
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: User
    }
  ];

  const navItems =
    user?.role === 'host'
      ? hostNavItems
      : travelerNavItems;

  const isRouteActive = (item) => {
    if (item.to === '/home') {
      return location.pathname === '/home';
    }

    return (
      location.pathname === item.to ||
      location.pathname.startsWith(`${item.to}/`)
    );
  };

  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        px-3
        pb-[env(safe-area-inset-bottom)]
        pointer-events-none
      "
    >
      <div
        className="
          mx-auto
          max-w-2xl
          mb-3
          h-[68px]
          rounded-[22px]
          border
          border-[color:var(--border-light)]
          bg-white/95
          backdrop-blur-xl
          shadow-[var(--shadow-lg)]
          pointer-events-auto
          px-1.5
        "
      >
        <div className="h-full flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isRouteActive(item);

            if (item.isSOS) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-label="Emergency SOS"
                  className="
                    relative
                    flex-1
                    h-full
                    flex
                    flex-col
                    items-center
                    justify-center
                    min-w-0
                    group
                  "
                >
                  <div
                    className={`
                      relative
                      w-10
                      h-10
                      rounded-full
                      flex
                      items-center
                      justify-center
                      transition-all
                      duration-200
                      ${
                        isActive
                          ? 'bg-[color:var(--danger)] text-white shadow-[0_5px_15px_rgba(184,76,76,0.28)]'
                          : 'bg-[color:var(--danger-soft)] text-[color:var(--danger)] group-hover:bg-[#F5DCDC]'
                      }
                    `}
                  >
                    <Icon
                      size={19}
                      strokeWidth={2.2}
                    />

                    {isActive && (
                      <span className="absolute inset-0 rounded-full ring-2 ring-[color:var(--danger)]/15" />
                    )}
                  </div>

                  <span
                    className={`
                      mt-1
                      text-[10px]
                      leading-none
                      whitespace-nowrap
                      ${
                        isActive
                          ? 'font-bold text-[color:var(--danger)]'
                          : 'font-medium text-[color:var(--text-muted)]'
                      }
                    `}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative flex-1 h-full flex flex-col items-center justify-center min-w-0 group"
              >
                {/* Active indicator */}
                <span
                  className={`
                    absolute
                    top-1.5
                    w-7
                    h-1
                    rounded-full
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? 'bg-[color:var(--brand-gold)] opacity-100'
                        : 'opacity-0'
                    }
                  `}
                />

                <div
                  className={`
                    w-9
                    h-9
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? 'bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]'
                        : 'text-[color:var(--text-muted)] group-hover:bg-[color:var(--bg-secondary)] group-hover:text-[color:var(--text-primary)]'
                    }
                  `}
                >
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.4 : 1.9}
                  />
                </div>

                <span
                  className={`
                    mt-1
                    text-[10px]
                    leading-none
                    whitespace-nowrap
                    transition-colors
                    ${
                      isActive
                        ? 'font-semibold text-[color:var(--brand-primary)]'
                        : 'font-medium text-[color:var(--text-muted)]'
                    }
                  `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;