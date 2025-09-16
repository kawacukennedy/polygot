import React from 'react';

type LanguageStatus = 'ready' | 'building' | 'failed';

interface LanguageChipProps {
  language: string;
  status: LanguageStatus;
  version?: string;
  tooltipContent?: string; // For basic tooltip, full implementation might use a library
}

const getStatusClasses = (status: LanguageStatus) => {
  switch (status) {
    case 'ready':
      return 'bg-success text-white';
    case 'building':
      return 'bg-primary text-white animate-pulse';
    case 'failed':
      return 'bg-danger text-white';
    default:
      return 'bg-gray-400 text-white';
  }
};

const LanguageChip: React.FC<LanguageChipProps> = ({
  language,
  status,
  version,
  tooltipContent,
}) => {
  const statusClasses = getStatusClasses(status);

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClasses}`}
      title={tooltipContent || `${language} (${status}${version ? `, v${version}` : ''})`}
      aria-label={`${language} status: ${status}${version ? `, version ${version}` : ''}`}
    >
      <span className="mr-1">{language}</span>
      {version && <span className="text-xs opacity-75">v{version}</span>}
      {/* Optional: Add a visual indicator for status */}
      {status === 'building' && (
        <svg className="animate-spin -mr-1 ml-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
    </div>
  );
};

export default LanguageChip;
