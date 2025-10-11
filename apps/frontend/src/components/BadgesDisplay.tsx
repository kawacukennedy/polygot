import React from 'react';

interface BadgeProps {
  name: string;
  description: string;
  icon: string;
}

const Badge: React.FC<BadgeProps> = ({ name, description, icon }) => {
  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-sm">
      <span className="text-4xl mb-2" role="img" aria-label={name}>{icon}</span>
      <h4 className="font-bold text-md text-gray-800">{name}</h4>
      <p className="text-sm text-gray-600 text-center">{description}</p>
    </div>
  );
};

interface BadgesDisplayProps {
  badges: BadgeProps[];
}

const BadgesDisplay: React.FC<BadgesDisplayProps> = ({ badges }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {badges.map((badge) => (
        <Badge key={badge.name} {...badge} />
      ))}
    </div>
  );
};

export default BadgesDisplay;
