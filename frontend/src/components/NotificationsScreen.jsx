import React, { useState } from 'react';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Your booking is confirmed!",
      message: "Your trip to Hunza Valley has been confirmed. Check your itinerary.",
      timestamp: "2 hours ago",
      read: false,
      type: "booking"
    },
    {
      id: 2,
      title: "New review received",
      message: "Ahmad reviewed your recent trip to Swat Valley. Read what they said.",
      timestamp: "1 day ago",
      read: true,
      type: "review"
    },
    {
      id: 3,
      title: "Special offer just for you",
      message: "Exclusive discount on Northern Areas packages. Limited time only!",
      timestamp: "3 days ago",
      read: true,
      type: "offer"
    },
    {
      id: 4,
      title: "Payment processed",
      message: "Your payment for the Gwadar trip has been successfully processed.",
      timestamp: "1 week ago",
      read: true,
      type: "payment"
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? {...notif, read: true} : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({...notif, read: true}))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[color:var(--text-primary)]">Notifications</h1>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="px-4 py-2 bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] rounded-lg hover:bg-[color:var(--accent-primary-hover)] transition"
            >
              Mark All as Read
            </button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-xl font-bold text-[color:var(--text-primary)] mb-2">No notifications yet</h3>
            <p className="text-[color:var(--text-secondary)]">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 rounded-xl border ${
                  notification.read 
                    ? 'bg-[color:var(--surface-primary)] border-[color:var(--border-primary)]' 
                    : 'bg-[color:var(--surface-secondary)] border-[color:var(--accent-primary)]'
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    {notification.type === 'booking' && (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    )}
                    {notification.type === 'review' && (
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    )}
                    {notification.type === 'offer' && (
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                      </div>
                    )}
                    {notification.type === 'payment' && (
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className={`font-bold ${notification.read ? 'text-[color:var(--text-primary)]' : 'text-[color:var(--accent-primary)]'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-sm text-[color:var(--text-secondary)]">{notification.timestamp}</span>
                    </div>
                    <p className="text-[color:var(--text-secondary)] mt-1">{notification.message}</p>
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="mt-2 text-sm text-[color:var(--accent-primary)] hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;