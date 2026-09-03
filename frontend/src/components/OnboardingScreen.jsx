import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Discover Amazing Places",
      description: "Explore the breathtaking landscapes and rich culture of Pakistan with our curated experiences.",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Verified Local Guides",
      description: "Connect with trusted, verified tour operators who know the best spots and stories.",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Seamless Booking Experience",
      description: "Book your perfect trip with confidence using our secure and easy-to-use platform.",
      image: "https://images.unsplash.com/photo-1543429776-2782fc586c3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // ORIGINAL CODE WOULD CHECK LOCALSTORAGE HERE:
      // const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      // if (!hasSeenOnboarding) {
      //   localStorage.setItem('hasSeenOnboarding', 'true');
      // }
      navigate('/login');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // TEMPORARY SKIP BUTTON FOR DEMO PURPOSES - ORIGINAL CODE WOULD BE DIFFERENT
  const skipOnboarding = () => {
    // ORIGINAL CODE WOULD SET LOCALSTORAGE HERE:
    // localStorage.setItem('hasSeenOnboarding', 'true');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[color:var(--accent-primary)] flex items-center justify-center">
            <span className="text-2xl font-bold text-[color:var(--nav-text)]">T</span>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-2 text-[color:var(--text-primary)]">{steps[currentStep].title}</h1>
            <p className="text-center text-[color:var(--text-secondary)]">{steps[currentStep].description}</p>
          </div>
          
          <div className="mb-8 rounded-xl overflow-hidden">
            <img 
              src={steps[currentStep].image} 
              alt={steps[currentStep].title} 
              className="w-full h-64 object-cover"
            />
          </div>
          
          <div className="flex justify-center mb-8">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`w-3 h-3 rounded-full mx-1 ${index === currentStep ? 'bg-[color:var(--accent-primary)]' : 'bg-[color:var(--border-primary)]'}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="max-w-md mx-auto flex justify-between">
          {currentStep > 0 ? (
            <button 
              onClick={prevStep}
              className="px-6 py-3 bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] rounded-lg font-medium hover:bg-[color:var(--border-primary)] transition"
            >
              Previous
            </button>
          ) : (
            <button 
              onClick={skipOnboarding}
              className="px-6 py-3 bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)] rounded-lg font-medium hover:bg-[color:var(--border-primary)] transition"
            >
              Skip
            </button>
          )}
          
          <button 
            onClick={nextStep}
            className="px-6 py-3 bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] rounded-lg font-medium transition"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
      
      {/* COMMENT FOR DEVELOPERS - REMOVE BEFORE PRODUCTION */}
      {/* 
        TEMPORARY CHANGE FOR DEMO PURPOSES:
        - Removed localStorage check to force onboarding to show every time
        - Skip button still works to bypass quickly
        - REMEMBER TO RESTORE ORIGINAL LOGIC BEFORE PRODUCTION:
          1. Add back localStorage.getItem('hasSeenOnboarding') check in useEffect
          2. Navigate to /home if user has seen onboarding
          3. Uncomment localStorage.setItem calls
      */}
    </div>
  );
};

export default OnboardingScreen;