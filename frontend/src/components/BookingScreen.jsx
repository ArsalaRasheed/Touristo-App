import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import auth context

const BookingScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAuthHeader, user } = useAuth(); // Get the auth header function and logged-in user
  
  // Get package info from location state passed from PackageDetailScreen
  const packageInfo = location.state?.packageInfo || {
    id: 1,
    title: "Hunza Valley Adventure Expedition",
    host: "Mountain Trails Pakistan",
    pricePerPerson: 45000,
    totalDays: 5,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
  };
  
  const [bookingDetails, setBookingDetails] = useState({
    travelers: 1, // Default to 1 traveler
    startDate: '',
    specialRequests: '',
    paymentMethod: 'credit-card' // Default payment method
  });
  
  // Calculate total price based on number of travelers
  const totalPrice = bookingDetails.travelers * packageInfo.pricePerPerson;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleConfirmBooking = async () => {
    // Basic validation
    if (!bookingDetails.startDate) {
      alert('Please select a start date');
      return;
    }
    if (!user?.id) {
      alert('Please log in to complete your booking');
      navigate('/login');
      return;
    }
    
    try {
      // Prepare booking data
      const bookingData = {
        user_id: user?.id,
        package_id: packageInfo.id,
        booking_date: new Date().toISOString().split('T')[0], // Today's date
        start_date: bookingDetails.startDate,
        end_date: calculateEndDate(bookingDetails.startDate, packageInfo.totalDays),
        total_price: totalPrice,
        status: 'confirmed',
        payment_status: 'completed', // Payment completed upon booking
        travelers: bookingDetails.travelers
      };
      
      // Call the backend API to create the booking
      const response = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader() // Include the authorization header
        },
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Booking created:', result.data.booking);
      
      // Navigate to the My Trips screen after successful booking
      navigate('/my-trips');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };
  
  // Helper function to calculate end date based on start date and duration
  const calculateEndDate = (startDate, days) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + days - 1); // -1 because duration includes start day
    return end.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-[color:var(--text-primary)]">Complete Your Booking</h1>
        <p className="text-[color:var(--text-secondary)] mb-6">Review your trip details and finalize your reservation</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Summary Card */}
            <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">
              <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">Package Summary</h2>
              <div className="flex items-center">
                <img 
                  src={packageInfo.image} 
                  alt={packageInfo.title} 
                  className="w-24 h-24 rounded-lg object-cover mr-4"
                />
                <div>
                  <h3 className="font-bold text-[color:var(--text-primary)]">{packageInfo.title}</h3>
                  <p className="text-[color:var(--text-secondary)]">{packageInfo.host}</p>
                  <p className="font-semibold text-[color:var(--accent-primary)]">PKR {packageInfo.pricePerPerson.toLocaleString()} per person</p>
                </div>
              </div>
            </div>
            
            {/* Booking Details Form */}
            <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">
              <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">Booking Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[color:var(--text-secondary)] mb-1">Number of Travelers</label>
                  <input
                    type="number"
                    name="travelers"
                    value={bookingDetails.travelers}
                    onChange={handleChange}
                    min="1"
                    className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                  />
                </div>
                
                <div>
                  <label className="block text-[color:var(--text-secondary)] mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={bookingDetails.startDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]} // Don't allow past dates
                    className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                  />
                </div>
                
                <div>
                  <label className="block text-[color:var(--text-secondary)] mb-1">Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={bookingDetails.specialRequests}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any special requests or dietary requirements..."
                    className="w-full p-3 border border-[color:var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)]"
                  />
                </div>
                
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-[color:var(--text-secondary)] mb-1">Payment Method</label>
                  <div className="space-y-3">
                    <div 
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                        bookingDetails.paymentMethod === 'credit-card' 
                          ? 'border-[color:var(--accent-primary)] bg-[color:var(--accent-primary)] bg-opacity-10' 
                          : 'border-[color:var(--border-primary)] hover:border-[color:var(--accent-primary)]'
                      }`}
                      onClick={() => setBookingDetails({...bookingDetails, paymentMethod: 'credit-card'})}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit-card"
                        checked={bookingDetails.paymentMethod === 'credit-card'}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <svg className="w-8 h-8 mr-3 text-[color:var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <div>
                          <div className="font-medium text-[color:var(--text-primary)]">Credit/Debit Card</div>
                          <div className="text-sm text-[color:var(--text-secondary)]">Pay securely with your card</div>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                        bookingDetails.paymentMethod === 'bank-transfer' 
                          ? 'border-[color:var(--accent-primary)] bg-[color:var(--accent-primary)] bg-opacity-10' 
                          : 'border-[color:var(--border-primary)] hover:border-[color:var(--accent-primary)]'
                      }`}
                      onClick={() => setBookingDetails({...bookingDetails, paymentMethod: 'bank-transfer'})}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank-transfer"
                        checked={bookingDetails.paymentMethod === 'bank-transfer'}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <svg className="w-8 h-8 mr-3 text-[color:var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <div>
                          <div className="font-medium text-[color:var(--text-primary)]">Bank Transfer</div>
                          <div className="text-sm text-[color:var(--text-secondary)]">Transfer funds directly to our account</div>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                        bookingDetails.paymentMethod === 'cash-on-arrival' 
                          ? 'border-[color:var(--accent-primary)] bg-[color:var(--accent-primary)] bg-opacity-10' 
                          : 'border-[color:var(--border-primary)] hover:border-[color:var(--accent-primary)]'
                      }`}
                      onClick={() => setBookingDetails({...bookingDetails, paymentMethod: 'cash-on-arrival'})}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash-on-arrival"
                        checked={bookingDetails.paymentMethod === 'cash-on-arrival'}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <svg className="w-8 h-8 mr-3 text-[color:var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <div>
                          <div className="font-medium text-[color:var(--text-primary)]">Cash on Arrival</div>
                          <div className="text-sm text-[color:var(--text-secondary)]">Pay when you arrive at your destination</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Price Summary */}
          <div className="space-y-6">
            <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)] sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-[color:var(--text-primary)]">Price Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Price per person:</span>
                  <span>PKR {packageInfo.pricePerPerson.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of travelers:</span>
                  <span>x{bookingDetails.travelers}</span>
                </div>
                <div className="border-t border-[color:var(--border-primary)] pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-[color:var(--accent-primary)]">PKR {totalPrice.toLocaleString()}</span>
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
                By confirming, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
            
            <div className="bg-[color:var(--surface-primary)] rounded-2xl p-6 border border-[color:var(--border-primary)]">
              <h3 className="font-bold mb-2 text-[color:var(--text-primary)]">Trip Duration</h3>
              <p className="text-[color:var(--text-secondary)]">{packageInfo.totalDays} Days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingScreen;