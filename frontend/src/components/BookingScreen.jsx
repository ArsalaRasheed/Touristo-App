import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookingScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // IMPORTANT:
  // Never use a hard-coded package as a fallback.
  // The booking must always come from the package selected by the user.
  const packageInfo = location.state?.packageInfo;

  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If package information is missing, do not silently book Hunza.
  if (!packageInfo?.id) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-2xl p-6 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[color:var(--surface-secondary)] flex items-center justify-center text-2xl">
            ⚠️
          </div>

          <h1 className="text-xl font-bold mb-2">
            Package information is missing
          </h1>

          <p className="text-sm text-[color:var(--text-secondary)] mb-6">
            The selected package could not be loaded. Please open the package
            again and start the booking from its booking button.
          </p>

          <button
            type="button"
            onClick={() => navigate('/search')}
            className="w-full bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-3 px-4 rounded-xl font-bold transition"
          >
            Browse Packages
          </button>
        </div>
      </div>
    );
  }

  const pricePerPerson = Number(packageInfo.price || packageInfo.pricePerPerson || 0);
  const totalPrice = pricePerPerson * Number(numberOfPeople);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token || !user?.id) {
      setError('Please login before making a booking.');
      return;
    }

    if (!selectedDate) {
      setError('Please select your travel date.');
      return;
    }

    if (Number(numberOfPeople) < 1) {
      setError('Number of people must be at least 1.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          package_id: packageInfo.id,
          user_id: user.id,
          booking_date: selectedDate,
          number_of_people: Number(numberOfPeople),
          total_price: totalPrice,
          special_requests: specialRequests.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            'Unable to complete the booking. Please try again.'
        );
      }

      navigate('/my-trips', {
        state: {
          bookingSuccess: true,
          booking: data.booking || data,
        },
      });
    } catch (err) {
      console.error('Booking error:', err);

      setError(
        err.message || 'Something went wrong while creating your booking.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] px-3 py-4 sm:px-4 sm:py-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 shrink-0 rounded-xl border border-[color:var(--border-primary)] bg-[color:var(--surface-primary)] flex items-center justify-center text-lg hover:bg-[color:var(--surface-secondary)] transition"
            aria-label="Go back"
          >
            ←
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Book Your Trip
            </h1>

            <p className="text-sm text-[color:var(--text-secondary)] mt-1">
              Complete your booking details below.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Package summary */}
          <div className="lg:col-span-2">
            <div className="bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-2xl overflow-hidden shadow-sm lg:sticky lg:top-6">
              {packageInfo.image ? (
                <img
                  src={packageInfo.image}
                  alt={packageInfo.title || 'Selected package'}
                  className="w-full h-52 sm:h-60 lg:h-56 object-cover"
                />
              ) : (
                <div className="w-full h-52 sm:h-60 lg:h-56 bg-[color:var(--surface-secondary)] flex items-center justify-center text-4xl">
                  🏔️
                </div>
              )}

              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent-primary)] mb-2">
                  Selected Package
                </p>

                <h2 className="text-xl font-bold leading-snug mb-3 break-words">
                  {packageInfo.title}
                </h2>

                {packageInfo.host && (
                  <div className="flex items-start gap-2 mb-3">
                    <span>🏢</span>
                    <div className="min-w-0">
                      <p className="text-xs text-[color:var(--text-secondary)]">
                        Tour Company
                      </p>
                      <p className="font-medium break-words">
                        {packageInfo.host}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="rounded-xl bg-[color:var(--surface-secondary)] p-3 min-w-0">
                    <p className="text-xs text-[color:var(--text-secondary)]">
                      Price / Person
                    </p>
                    <p className="font-bold mt-1 break-words">
                      PKR {pricePerPerson.toLocaleString()}
                    </p>
                  </div>

                  {packageInfo.totalDays && (
                    <div className="rounded-xl bg-[color:var(--surface-secondary)] p-3 min-w-0">
                      <p className="text-xs text-[color:var(--text-secondary)]">
                        Duration
                      </p>
                      <p className="font-bold mt-1">
                        {packageInfo.totalDays}{' '}
                        {Number(packageInfo.totalDays) === 1 ? 'Day' : 'Days'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-2xl p-4 sm:p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold mb-5">
                Booking Details
              </h2>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* Travel date */}
              <div className="mb-5">
                <label
                  htmlFor="booking-date"
                  className="block text-sm font-semibold mb-2"
                >
                  Travel Date
                </label>

                <input
                  id="booking-date"
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="w-full min-h-[46px] rounded-xl border border-[color:var(--border-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)] px-4 focus:outline-none focus:border-[color:var(--accent-primary)] focus:ring-2 focus:ring-[color:var(--accent-primary)]/15"
                  required
                />
              </div>

              {/* Number of people */}
              <div className="mb-5">
                <label
                  htmlFor="number-of-people"
                  className="block text-sm font-semibold mb-2"
                >
                  Number of People
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setNumberOfPeople((current) =>
                        Math.max(1, Number(current) - 1)
                      )
                    }
                    className="w-11 h-11 shrink-0 rounded-xl border border-[color:var(--border-primary)] bg-[color:var(--surface-primary)] hover:bg-[color:var(--surface-secondary)] font-bold transition"
                    aria-label="Decrease number of people"
                  >
                    −
                  </button>

                  <input
                    id="number-of-people"
                    type="number"
                    min="1"
                    value={numberOfPeople}
                    onChange={(event) =>
                      setNumberOfPeople(
                        Math.max(1, Number(event.target.value) || 1)
                      )
                    }
                    className="w-full min-h-[46px] rounded-xl border border-[color:var(--border-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)] px-4 text-center font-semibold focus:outline-none focus:border-[color:var(--accent-primary)] focus:ring-2 focus:ring-[color:var(--accent-primary)]/15"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setNumberOfPeople((current) => Number(current) + 1)
                    }
                    className="w-11 h-11 shrink-0 rounded-xl border border-[color:var(--border-primary)] bg-[color:var(--surface-primary)] hover:bg-[color:var(--surface-secondary)] font-bold transition"
                    aria-label="Increase number of people"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Special requests */}
              <div className="mb-6">
                <label
                  htmlFor="special-requests"
                  className="block text-sm font-semibold mb-2"
                >
                  Special Requests{' '}
                  <span className="font-normal text-[color:var(--text-secondary)]">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="special-requests"
                  value={specialRequests}
                  onChange={(event) =>
                    setSpecialRequests(event.target.value)
                  }
                  rows={4}
                  placeholder="Any special requirements or requests?"
                  className="w-full rounded-xl border border-[color:var(--border-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)] px-4 py-3 resize-y focus:outline-none focus:border-[color:var(--accent-primary)] focus:ring-2 focus:ring-[color:var(--accent-primary)]/15"
                />
              </div>

              {/* Price summary */}
              <div className="rounded-2xl bg-[color:var(--surface-secondary)] p-4 mb-5">
                <div className="flex items-center justify-between gap-4 text-sm mb-2">
                  <span className="text-[color:var(--text-secondary)]">
                    Price per person
                  </span>

                  <span className="font-semibold text-right">
                    PKR {pricePerPerson.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm mb-3">
                  <span className="text-[color:var(--text-secondary)]">
                    People
                  </span>

                  <span className="font-semibold">
                    {numberOfPeople}
                  </span>
                </div>

                <div className="border-t border-[color:var(--border-primary)] pt-3 flex items-center justify-between gap-4">
                  <span className="font-bold">
                    Total
                  </span>

                  <span className="text-xl font-bold text-[color:var(--accent-primary)] text-right">
                    PKR {totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[48px] rounded-xl bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed text-[color:var(--nav-text)] font-bold transition"
              >
                {isSubmitting ? 'Confirming Booking...' : 'Confirm Booking'}
              </button>

              <p className="text-xs text-center text-[color:var(--text-secondary)] mt-3">
                Your selected package will be used for this booking.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingScreen;