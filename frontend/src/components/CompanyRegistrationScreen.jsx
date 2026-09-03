import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CompanyRegistrationScreen = () => {
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for API call
    console.log('Company registration submitted:', formData);
    // On successful submission, maybe navigate to a thank you page or dashboard
    navigate('/home'); // Or to a pending approval page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[color:var(--neutral-bg)] p-4">
      <div className="w-full max-w-2xl bg-[color:var(--neutral-surface)] p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-[color:var(--neutral-text-primary)]">
          Register Your Tour Company
        </h1>
        <p className="text-center text-[color:var(--neutral-text-secondary)] mb-8">
          List your tours and reach thousands of travelers.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label htmlFor="companyName" className="block text-[color:var(--neutral-text-secondary)] mb-1">Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                onChange={handleChange}
                required
                className="w-full p-3 border border-[color:var(--neutral-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-orange)] bg-[color:var(--neutral-bg)] text-[color:var(--neutral-text-primary)]"
                placeholder="e.g., ABC Tours & Travels"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="contactPerson" className="block text-[color:var(--neutral-text-secondary)] mb-1">Contact Person Name</label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                onChange={handleChange}
                required
                className="w-full p-3 border border-[color:var(--neutral-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-orange)] bg-[color:var(--neutral-bg)] text-[color:var(--neutral-text-primary)]"
                placeholder="Your name"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-[color:var(--neutral-text-secondary)] mb-1">Business Email</label>
              <input
                type="email"
                id="email"
                name="email"
                onChange={handleChange}
                required
                className="w-full p-3 border border-[color:var(--neutral-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-orange)] bg-[color:var(--neutral-bg)] text-[color:var(--neutral-text-primary)]"
                placeholder="your-company@example.com"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-[color:var(--neutral-text-secondary)] mb-1">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                onChange={handleChange}
                required
                className="w-full p-3 border border-[color:var(--neutral-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-orange)] bg-[color:var(--neutral-bg)] text-[color:var(--neutral-text-primary)]"
                placeholder="+92-xxx-xxxxxxx"
              />
            </div>
            <div className="mb-4 md:col-span-2">
              <label htmlFor="address" className="block text-[color:var(--neutral-text-secondary)] mb-1">Business Address</label>
              <textarea
                id="address"
                name="address"
                rows="3"
                onChange={handleChange}
                required
                className="w-full p-3 border border-[color:var(--neutral-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-orange)] bg-[color:var(--neutral-bg)] text-[color:var(--neutral-text-primary)]"
                placeholder="Full address of your business"
              ></textarea>
            </div>
            <div className="mb-4 md:col-span-2">
              <label htmlFor="description" className="block text-[color:var(--neutral-text-secondary)] mb-1">Company Description</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                onChange={handleChange}
                required
                className="w-full p-3 border border-[color:var(--neutral-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-orange)] bg-[color:var(--neutral-bg)] text-[color:var(--neutral-text-primary)]"
                placeholder="Tell travelers about your company and unique offerings."
              ></textarea>
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-[color:var(--primary-orange)] hover:bg-[color:var(--primary-orange-dark)] text-white py-3 rounded-lg font-semibold transition duration-200"
            >
              Submit Application
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-[color:var(--neutral-border)] text-center">
          <p className="text-[color:var(--neutral-text-secondary)] text-sm">
            Our team will review your application. You will be notified once approved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistrationScreen;