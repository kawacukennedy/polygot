import React from 'react';
import LanguageChip from './LanguageChip';

interface ServiceItem {
  id: string;
  label: string;
  description: string;
}

interface ServiceListProps {
  services: ServiceItem[];
}

const ServiceList: React.FC<ServiceListProps> = ({ services }) => {
  return (
    <div className="p-4 bg-surface-light rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Services</h3>
      <ul className="space-y-4">
        {services.map((service) => (
          <li key={service.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{service.label}</p>
                <p className="text-sm text-muted">{service.description}</p>
              </div>
              {/* Placeholder for language selector */}
              <LanguageChip language="Node.js" status="ready" version="18" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceList;
