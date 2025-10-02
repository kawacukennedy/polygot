import React, { useState, useEffect } from 'react';
import useTranslation from '../hooks/useTranslation';

interface FirstTimeVisitorOverlayProps {
  onClose: () => void;
}

const FirstTimeVisitorOverlay: React.FC<FirstTimeVisitorOverlayProps> = ({ onClose }) => {
  const { t } = useTranslation();

  const steps = [
    {
      title: t('welcome_overlay_title'),
      description: t('welcome_overlay_desc'),
    },
    {
      title: t('swap_runtimes_title'),
      description: t('swap_runtimes_desc'),
    },
    {
      title: t('run_benchmarks_title'),
      description: t('run_benchmarks_desc'),
    },
    {
      title: t('earn_xp_title'),
      description: t('earn_xp_desc'),
    },
  ];

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
            <span className="ml-2 text-sm text-gray-700">{t('do_not_show_again')}</span>
          </label>
          <div className="space-x-4">
            {currentStep < steps.length - 1 && (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-200"
              >
                {t('skip')}
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {currentStep === steps.length - 1 ? t('finish') : t('next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstTimeVisitorOverlay;
