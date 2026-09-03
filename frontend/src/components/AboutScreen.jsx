import React from 'react';
import { Link } from 'react-router-dom';

const AboutScreen = () => {
  return (
    <div className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-[color:var(--text-primary)]">About Touristo</h1>
        
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[color:var(--text-primary)]">Our Mission</h2>
            <p className="text-[color:var(--text-secondary)] mb-4">
              At Touristo, we believe that the best travel experiences come from connecting travelers with verified, 
              trustworthy tour operators who know their destinations intimately. Our platform bridges the gap between 
              travelers seeking authentic experiences and local operators offering genuine services.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[color:var(--text-primary)]">Why Choose Touristo?</h2>
            <ul className="list-disc pl-6 mb-4 text-[color:var(--text-secondary)]">
              <li className="mb-2">Verified and trusted tour operators</li>
              <li className="mb-2">Curated experiences across Pakistan</li>
              <li className="mb-2">Secure booking and payment systems</li>
              <li className="mb-2">Comprehensive support throughout your journey</li>
              <li className="mb-2">Sustainable and responsible tourism practices</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[color:var(--text-primary)]">Our Story</h2>
            <p className="text-[color:var(--text-secondary)] mb-4">
              Founded in 2023, Touristo emerged from a simple idea: to make travel in Pakistan safer, easier, 
              and more meaningful. Our founders, passionate about Pakistan's diverse landscapes and rich culture, 
              recognized the need for a reliable platform that connects travelers with quality local operators.
            </p>
            <p className="text-[color:var(--text-secondary)]">
              Today, we're proud to partner with hundreds of verified operators across the country, 
              offering thousands of unique experiences to travelers from around the world.
            </p>
          </section>
          
          <div className="text-center mt-12">
            <Link 
              to="/destinations" 
              className="inline-block bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] font-bold py-3 px-8 rounded-full transition"
            >
              Explore Destinations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;