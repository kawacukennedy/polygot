import React, { useState, useEffect } from 'react';

interface FirstTimeVisitorOverlayProps {
  onClose: () => void;
}

const steps = [
  {
    title: 'Welcome to Polyglot Playground!',
    description: 'Explore, contribute, and benchmark backend services across multiple programming languages in a fully adaptive, gamified environment.',
  },
  {
    title: 'Swap Runtimes',
    description: 'Easily switch between different language implementations for each service to compare their performance live.',
  },
  {
    title: 'Run Benchmarks',
    description: 'Execute quick benchmarks to see how different language services perform under load.',
  },
  {
    title: 'Earn XP and Climb Leaderboards',
    description: 'Gain experience points by interacting with the playground and see how you rank against other developers.',
  },
];

const FirstTimeVisitorOverlay: React.FC<FirstTimeVisitorOverlayProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  useEffect(() => {
    const hasSeenOverlay = localStorage.getItem('hasSeenFirstTimeVisitorOverlay');
    if (!hasSeenOverlay) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    if (doNotShowAgain) {
      localStorage.setItem('hasSeenFirstTimeVisitorOverlay', 'true');
    }
    setIsVisible(false);
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prevStep => prevStep + 1);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isVisible) return null;

  const currentStepContent = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">{currentStepContent.title}</h2>
        <p className="text-gray-700 mb-6">
          {currentStepContent.description}
        </p>
        <div className="flex justify-between items-center mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={doNotShowAgain}
              onChange={(e) => setDoNotShowAgain(e.target.checked)}
            />
            <span className="ml-2 text-sm text-gray-700">Do not show again</span>
          </label>
          <div className="space-x-4">
            {currentStep < steps.length - 1 && (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-200"
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeVisitorOverlay;