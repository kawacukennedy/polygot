import React from 'react';

interface LanguageChipProps {
  language: string;
  status: 'ready' | 'building' | 'failed';
  version?: string;
}

const LanguageChip: React.FC<LanguageChipProps> = ({ language, status, version }) => {
  let bgColor = 'bg-gray-200';
  let textColor = 'text-gray-800';

  if (status === 'ready') {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
  } else if (status === 'building') {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
  } else if (status === 'failed') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
  }

  return (
    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${bgColor} ${textColor}`}>
      {language} {version && <span className="ml-1 text-xs opacity-75">{version}</span>}
    </span>
  );
};

export default LanguageChip;