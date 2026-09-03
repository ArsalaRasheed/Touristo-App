import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically navigate to onboarding after 3 seconds
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 3000);

    // Clean up timer
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[color:var(--accent-primary)] flex items-center justify-center">
          <span className="text-4xl font-bold text-[color:var(--nav-text)]">T</span>
        </div>
        <h1 className="text-4xl font-bold mb-2 text-[color:var(--text-primary)]">Touristo</h1>
        <p className="text-[color:var(--text-secondary)]">Discover Pakistan, Verified</p>
      </div>
      
      <div className="mt-12">
        <div className="w-12 h-12 border-4 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div className="mt-8 text-[color:var(--text-secondary)]">
        <p>© 2024 Touristo. All rights reserved.</p>
      </div>
    </div>
  );
};

export default SplashScreen;