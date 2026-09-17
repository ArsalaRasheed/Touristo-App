import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BookingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAuthHeader, user } = useAuth();

  /*
   * Package can come from:
   * 1. location.state.packageInfo
   * 2. packageId in URL
   *
   * We NEVER use a hard-coded package as fallback.
   */

  const statePackageInfo = location.state?.packageInfo || null;

  const searchParams = new URLSearchParams(location.search);
  const packageIdFromUrl = searchParams.get('packageId');

  const [packageInfo, setPackageInfo] = useState(statePackageInfo);
  const [packageLoading, setPackageLoading] = useState(!statePackageInfo);
  const [packageError, setPackageError] = useState('');

  const [bookingDetails, setBookingDetails] = useState({
    travelers: 1,
    startDate: '',
    specialRequests: '',
    paymentMethod: 'credit-card'
  });

  /*
   * If package information was passed through state,
   * use it directly.
   *
   * If state is unavailable, load the EXACT package
   * using packageId from the URL.
   */
  useEffect(() => {
    if (statePackageInfo?.id) {
      setPackageInfo(statePackageInfo);
      setPackageLoading(false);
      return;
    }

    if (!packageIdFromUrl) {
      setPackageLoading(false);
      setPackageError(
        'Package information is missing. Please open the package again.'
      );
      return;
    }

    const fetchPackage = async () => {
      try {
        setPackageLoading(true);
        setPackageError('');

        const response = await fetch(
          `/api/packages/${encodeURIComponent(packageIdFromUrl)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Unable to load package (${response.status})`
          );
        }

        const pkg = data?.data?.package;

        if (!pkg) {
          throw new Error('Selected package could not be found.');
        }

        /*
         * Convert API package data into the same structure
         * already used by the existing BookingScreen.
         */
        setPackageInfo({
          id: pkg.id,
          title: pkg.title,
          host: pkg.host_name || 'Tour Operator',
          hostId: pkg.host_id,
          pricePerPerson: Number(pkg.price || 0),
          totalDays: Number(pkg.duration_days || 1),
          image: pkg.image
        });
      } catch (error) {
        console.error('Error loading booking package:', error);

        setPackageError(
          error.message || 'Unable to load the selected package.'
        );
      } finally {
        setPackageLoading(false);
      }
    };

    fetchPackage();
  }, [statePackageInfo, packageIdFromUrl]);

  /*
   * Calculate total price.
   */
  const totalPrice =
    Number(bookingDetails.travelers || 0) *
    Number(packageInfo?.pricePerPerson || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBookingDetails((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateEndDate = (startDate, days) => {
    if (!startDate) return '';

    const start = new Date(startDate);
    const end = new Date(start);

    end.setDate(end.getDate() + Number(days || 1) - 1);

    return end.toISOString().split('T')[0];
  };

  const handleConfirmBooking = async () => {
    if (!packageInfo?.id) {
      alert('Selected package information is not available.');
      return;
    }

    if (!bookingDetails.startDate) {
      alert('Please select a start date');
      return;
    }

    if (!user?.id) {
      alert('Please log in to complete your booking');
      navigate('/login');
      return;
    }

    if (Number(bookingDetails.travelers) < 1) {
      alert('Please select at least one traveler');
      return;
    }

    try {
      /*
       * IMPORTANT:
       * packageInfo.id is the EXACT package selected by the user.
       *
       * No hard-coded package ID is used anywhere.
       */
      const bookingData = {
        user_id: user.id,
        package_id: packageInfo.id,
        booking_date: new Date().toISOString().split('T')[0],
        start_date: bookingDetails.startDate,
        end_date: calculateEndDate(
          bookingDetails.startDate,
          packageInfo.totalDays
        ),
        total_price: totalPrice,
        status: 'confirmed',
        payment_status: 'completed',
        travelers: Number(bookingDetails.travelers)
      };

      console.log('Creating booking for package:', {
        package_id: packageInfo.id,
        package_title: packageInfo.title
      });

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `HTTP error! status: ${response.status}`
        );
      }

      console.log('Booking created:', result?.data?.booking || result);

      /*
       * Go to My Trips after successful booking.
       */
      navigate('/my-trips');
    } catch (error) {
      console.error('Error creating booking:', error);

      alert(
        error.message ||
          'Failed to create booking. Please try again.'
      );
    }
  };

  /*
   * Loading package.
   */
  if (packageLoading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[color:var(--surface-primary)] rounded-2xl p-8 border border-[color:var(--border-primary)] text-center">
            <div className="loading-spinner mx-auto mb-4" />

            <h2 className="text-xl font-bold mb-2">
              Loading selected package...
            </h2>

            <p className="text-[color:var(--text-secondary)]">
              Please wait while we load your selected tour.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Package could not be loaded.
   */
  if (!packageInfo?.id) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-[color:var(--surface-primary)] border border-[color:var(--border-primary)] rounded-2xl p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>

          <h1 className="text-xl font-bold mb-2">
            Unable to load selected package
          </h1>

          <p className="text-sm text-[color:var(--text-secondary)] mb-6">
            {packageError ||
              'The selected package could not be loaded.'}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-3 rounded-xl font-bold transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-2 text-[color:var(--text-primary)]">
          Complete Your Booking
        </h1>

        <p className="text-[color:var(--text-secondary)] mb-6">
          Review your trip details and finalize your reservation
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* Package Summary */}
            <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">

              <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">
                Package Summary
              </h2>

              <div className="flex items-center min-w-0">

                {packageInfo.image ? (
                  <img
                    src={packageInfo.image}
                    alt={packageInfo.title}
                    className="w-24 h-24 rounded-lg object-cover mr-4 shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-[color:var(--surface-secondary)] mr-4 shrink-0 flex items-center justify-center text-2xl">
                    🏔️
                  </div>
                )}

                <div className="min-w-0">

                  <h3 className="font-bold text-[color:var(--text-primary)] break-words">
                    {packageInfo.title}
                  </h3>

                  <p className="text-[color:var(--text-secondary)] break-words">
                    {packageInfo.host}
                  </p>

                  <p className="font-semibold text-[color:var(--accent-primary)]">
                    PKR{' '}
                    {Number(
                      packageInfo.pricePerPerson || 0
                    ).toLocaleString()}{' '}
                    per person
                  </p>

                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">

              <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">
                Booking Details
              </h2>

              <div className="space-y-4">

                {/* Travelers */}
                <div>
                  <label className="block text-[color:var(--text-secondary)] mb-1">
                    Number of Travelers
                  </label>

                  <input
                    type="number"
                    name="travelers"
                    value={bookingDetails.travelers}
                    onChange={handleChange}
                    min="1"
                    className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-[color:var(--text-secondary)] mb-1">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={bookingDetails.startDate}
                    onChange={handleChange}
                    min={new Date()
                      .toISOString()
                      .split('T')[0]}
                    className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                  />
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-[color:var(--text-secondary)] mb-1">
                    Special Requests
                  </label>

                  <textarea
                    name="specialRequests"
                    value={bookingDetails.specialRequests}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any special requests or dietary requirements..."
                    className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-[color:var(--text-secondary)] mb-1">
                    Payment Method
                  </label>

                  <div className="space-y-3">

                    {/* Credit Card */}
                    <div
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                        bookingDetails.paymentMethod ===
                        'credit-card'
                          ? 'border-[color:var(--accent-primary)] bg-[color:var(--accent-primary)] bg-opacity-10'
                          : 'border-[color:var(--border-primary)] hover:border-[color:var(--accent-primary)]'
                      }`}
                      onClick={() =>
                        setBookingDetails((prev) => ({
                          ...prev,
                          paymentMethod: 'credit-card'
                        }))
                      }
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit-card"
                        checked={
                          bookingDetails.paymentMethod ===
                          'credit-card'
                        }
                        onChange={handleChange}
                        className="mr-3"
                      />

                      <div className="flex items-center">
                        <svg
                          className="w-8 h-8 mr-3 text-[color:var(--text-secondary)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>

                        <div>
                          <div className="font-medium text-[color:var(--text-primary)]">
                            Credit/Debit Card
                          </div>

                          <div className="text-sm text-[color:var(--text-secondary)]">
                            Pay securely with your card
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bank Transfer */}
                    <div
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                        bookingDetails.paymentMethod ===
                        'bank-transfer'
                          ? 'border-[color:var(--accent-primary)] bg-[color:var(--accent-primary)] bg-opacity-10'
                          : 'border-[color:var(--border-primary)] hover:border-[color:var(--accent-primary)]'
                      }`}
                      onClick={() =>
                        setBookingDetails((prev) => ({
                          ...prev,
                          paymentMethod: 'bank-transfer'
                        }))
                      }
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank-transfer"
                        checked={
                          bookingDetails.paymentMethod ===
                          'bank-transfer'
                        }
                        onChange={handleChange}
                        className="mr-3"
                      />

                      <div className="flex items-center">
                        <svg
                          className="w-8 h-8 mr-3 text-[color:var(--text-secondary)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>

                        <div>
                          <div className="font-medium text-[color:var(--text-primary)]">
                            Bank Transfer
                          </div>

                          <div className="text-sm text-[color:var(--text-secondary)]">
                            Transfer funds directly to our account
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cash */}
                    <div
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                        bookingDetails.paymentMethod ===
                        'cash-on-arrival'
                          ? 'border-[color:var(--accent-primary)] bg-[color:var(--accent-primary)] bg-opacity-10'
                          : 'border-[color:var(--border-primary)] hover:border-[color:var(--accent-primary)]'
                      }`}
                      onClick={() =>
                        setBookingDetails((prev) => ({
                          ...prev,
                          paymentMethod: 'cash-on-arrival'
                        }))
                      }
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash-on-arrival"
                        checked={
                          bookingDetails.paymentMethod ===
                          'cash-on-arrival'
                        }
                        onChange={handleChange}
                        className="mr-3"
                      />

                      <div className="flex items-center">
                        <svg
                          className="w-8 h-8 mr-3 text-[color:var(--text-secondary)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 002 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>

                        <div>
                          <div className="font-medium text-[color:var(--text-primary)]">
                            Cash on Arrival
                          </div>

                          <div className="text-sm text-[color:var(--text-secondary)]">
                            Pay when you arrive at your destination
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* Price Summary */}
            <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)] sticky top-4">

              <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">
                Price Summary
              </h2>

              <div className="space-y-3 mb-6">

                <div className="flex justify-between gap-4">
                  <span>Price per person:</span>

                  <span>
                    PKR{' '}
                    {Number(
                      packageInfo.pricePerPerson || 0
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span>Number of travelers:</span>

                  <span>
                    x{bookingDetails.travelers}
                  </span>
                </div>

                <div className="border-t border-[color:var(--border-primary)] pt-3 mt-3">

                  <div className="flex justify-between gap-4 font-bold text-lg">

                    <span>Total:</span>

                    <span className="text-[color:var(--accent-primary)]">
                      PKR {totalPrice.toLocaleString()}
                    </span>

                  </div>

                </div>

              </div>

              <button
                onClick={handleConfirmBooking}
                className="w-full bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] py-3 rounded-xl font-bold transition duration-200"
              >
                Confirm Booking
              </button>

              <p className="text-xs text-[color:var(--text-secondary)] mt-3">
                By confirming, you agree to our Terms of Service
                and Privacy Policy.
              </p>

            </div>

            {/* Duration */}
            <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">

              <h3 className="font-bold mb-2 text-[color:var(--text-primary)]">
                Trip Duration
              </h3>

              <p className="text-[color:var(--text-secondary)]">
                {packageInfo.totalDays} Days
              </p>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingScreen;