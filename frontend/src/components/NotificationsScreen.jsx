import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  Gift,
  Star,
  ShieldCheck,
  Clock3
} from 'lucide-react';


/* ============================================================
   NOTIFICATION ICON
============================================================ */

const NotificationIcon = ({ type }) => {
  const config = {
    booking: {
      icon: ShieldCheck,
      wrapper:
        'bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]'
    },
    review: {
      icon: Star,
      wrapper:
        'bg-[color:var(--brand-gold-soft)] text-[color:var(--brand-gold)]'
    },
    offer: {
      icon: Gift,
      wrapper:
        'bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]'
    },
    payment: {
      icon: CreditCard,
      wrapper:
        'bg-[color:var(--surface-secondary)] text-[color:var(--text-secondary)]'
    }
  };

  const current = config[type] || {
    icon: Bell,
    wrapper:
      'bg-[color:var(--surface-secondary)] text-[color:var(--text-secondary)]'
  };

  const Icon = current.icon;

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${current.wrapper}`}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
};


/* ============================================================
   NOTIFICATIONS SCREEN
============================================================ */

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Your booking is confirmed!',
      message:
        'Your trip to Hunza Valley has been confirmed. Check your itinerary.',
      timestamp: '2 hours ago',
      read: false,
      type: 'booking'
    },
    {
      id: 2,
      title: 'New review received',
      message:
        'Ahmad reviewed your recent trip to Swat Valley. Read what they said.',
      timestamp: '1 day ago',
      read: true,
      type: 'review'
    },
    {
      id: 3,
      title: 'Special offer just for you',
      message:
        'Exclusive discount on Northern Areas packages. Limited time only!',
      timestamp: '3 days ago',
      read: true,
      type: 'offer'
    },
    {
      id: 4,
      title: 'Payment processed',
      message:
        'Your payment for the Gwadar trip has been successfully processed.',
      timestamp: '1 week ago',
      read: true,
      type: 'payment'
    }
  ]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true
      }))
    );
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">

      <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-10 sm:px-6 sm:py-9">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="mb-7">

          <div className="mb-7 flex items-center justify-between gap-4">

            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--brand-primary)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Link>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] px-3.5 py-2 text-xs font-semibold text-[color:var(--brand-primary)] shadow-[var(--shadow-xs)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            )}

          </div>


          <div className="flex items-start gap-4">

            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-primary)] text-white shadow-[var(--shadow-md)]">

              <Bell className="h-7 w-7" />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[color:var(--bg-primary)] bg-[color:var(--brand-gold)] px-1 text-[10px] font-bold text-[color:var(--brand-primary)]">
                  {unreadCount}
                </span>
              )}

            </div>


            <div>

              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-gold)]">
                Updates
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                Notifications
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--text-secondary)] sm:text-base">
                Stay up to date with your bookings, reviews, offers and payments.
              </p>

            </div>

          </div>

        </header>


        {/* ====================================================
            STATUS SUMMARY
        ==================================================== */}

        <section className="mb-6 overflow-hidden rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] shadow-[var(--shadow-sm)]">

          <div className="flex items-center justify-between gap-4 p-5 sm:p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--brand-gold-soft)] text-[color:var(--brand-gold)]">
                <Clock3 className="h-5 w-5" />
              </div>

              <div>

                <p className="text-sm font-semibold">
                  {unreadCount === 0
                    ? 'You are all caught up'
                    : `${unreadCount} unread ${
                        unreadCount === 1
                          ? 'notification'
                          : 'notifications'
                      }`}
                </p>

                <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
                  Your latest Touristo updates appear below.
                </p>

              </div>

            </div>

            <div className="hidden text-xs font-medium text-[color:var(--text-muted)] sm:block">
              {notifications.length} total
            </div>

          </div>

        </section>


        {/* ====================================================
            NOTIFICATION LIST
        ==================================================== */}

        {notifications.length === 0 ? (

          <section className="rounded-[28px] border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] px-6 py-16 text-center shadow-[var(--shadow-sm)]">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--brand-primary-soft)] text-[color:var(--brand-primary)]">
              <Bell className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No notifications yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[color:var(--text-secondary)]">
              You're all caught up. New booking and account updates will appear here.
            </p>

          </section>

        ) : (

          <section className="space-y-3">

            {notifications.map((notification) => (

              <article
                key={notification.id}
                className={`group relative overflow-hidden rounded-[26px] border bg-[color:var(--surface-primary)] p-4 transition-all duration-200 sm:p-5 ${
                  notification.read
                    ? 'border-[color:var(--border-light)] shadow-[var(--shadow-xs)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]'
                    : 'border-[color:var(--brand-gold-light)] shadow-[var(--shadow-sm)]'
                }`}
              >

                {!notification.read && (
                  <span className="absolute left-0 top-0 h-full w-1 bg-[color:var(--brand-gold)]" />
                )}

                <div className="flex gap-4">

                  <NotificationIcon type={notification.type} />


                  <div className="min-w-0 flex-1">

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">

                      <div className="flex items-center gap-2">

                        <h2
                          className={`text-sm font-semibold sm:text-base ${
                            notification.read
                              ? 'text-[color:var(--text-primary)]'
                              : 'text-[color:var(--brand-primary)]'
                          }`}
                        >
                          {notification.title}
                        </h2>

                        {!notification.read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[color:var(--brand-gold)]" />
                        )}

                      </div>

                      <span className="shrink-0 text-[11px] font-medium text-[color:var(--text-muted)]">
                        {notification.timestamp}
                      </span>

                    </div>


                    <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                      {notification.message}
                    </p>


                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notification.id)}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--brand-primary)] transition-colors hover:text-[color:var(--brand-primary-hover)]"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Mark as read
                      </button>
                    )}

                  </div>

                </div>

              </article>

            ))}

          </section>

        )}

      </div>

    </div>
  );
};

export default NotificationsScreen;