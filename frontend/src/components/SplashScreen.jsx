import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] flex items-center justify-center px-6">

      {/* Soft background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-[color:var(--brand-gold-soft)] blur-3xl opacity-70" />
        <div className="absolute -bottom-40 -right-32 w-96 h-96 rounded-full bg-[color:var(--brand-primary-soft)] blur-3xl opacity-80" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">

        {/* Touristo Logo */}
        <div className="flex justify-center mb-7">

          <div className="relative">

            <div className="w-24 h-24 rounded-[28px] bg-[color:var(--brand-primary)] flex items-center justify-center shadow-[var(--shadow-lg)]">

              <div className="w-16 h-16 rounded-full border border-[color:var(--brand-gold-light)] flex items-center justify-center">

                <Compass
                  className="w-8 h-8 text-[color:var(--brand-gold-light)]"
                  strokeWidth={1.7}
                />

              </div>

            </div>

            {/* Gold accent */}
            <div className="absolute -right-1 -bottom-1 w-6 h-6 rounded-full bg-[color:var(--brand-gold)] border-4 border-[color:var(--bg-primary)]" />

          </div>

        </div>

        {/* Brand */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-0.04em] text-[color:var(--brand-primary)]">
            Touristo
          </h1>

          <div className="mt-3 flex items-center justify-center gap-3">

            <span className="w-8 h-px bg-[color:var(--brand-gold)]" />

            <p className="text-[10px] sm:text-xs uppercase tracking-[0.28em] font-semibold text-[color:var(--text-muted)]">
              Discover Pakistan
            </p>

            <span className="w-8 h-px bg-[color:var(--brand-gold)]" />

          </div>
        </div>

        {/* Tagline */}
        <p className="mt-7 text-sm sm:text-base leading-7 text-[color:var(--text-secondary)] max-w-xs mx-auto">
          Curated journeys, trusted hosts, and unforgettable experiences.
        </p>

        {/* Loading */}
        <div className="mt-12 flex justify-center">

          <div className="relative w-10 h-10">

            <div className="absolute inset-0 rounded-full border-2 border-[color:var(--brand-primary-soft)]" />

            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[color:var(--brand-gold)] animate-spin" />

          </div>

        </div>

        {/* Footer */}
        <p className="mt-8 text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
          Explore • Experience • Remember
        </p>

      </div>

    </div>
  );
};

export default SplashScreen;