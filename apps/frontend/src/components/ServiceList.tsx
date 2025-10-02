
import React from 'react';
import Tooltip from '../components/Tooltip';
import useTranslation from '../hooks/useTranslation';

interface Service {
  id: string;
  label: string;
  description: string;
}

interface ServiceListProps {
  services: Service[];
  implementations: Record<string, string[]>;
  selectedImpl: Record<string, string>;
  onSwap: (serviceId: string, impl: string) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({
  services,
  implementations,
  selectedImpl,
  onSwap,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div key={service.id} className="p-4 border rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 hover:border-indigo-500 transition-all duration-200">
          <Tooltip content={t('swap_runtime') + ` ${service.label} ` + t('implementation') + `: ${selectedImpl[service.id]}. ` + t('click_to_swap')}>
            <h3 className="font-bold">{service.label}</h3>
            <p className="text-sm text-gray-600">{service.description}</p>
            <div className="mt-2">
              <select
                value={selectedImpl[service.id]}
                onChange={(e) => onSwap(service.id, e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              >
                {implementations[service.id as keyof typeof implementations].map((impl) => (
                  <option key={impl} value={impl}>
                    {impl}
                  </option>
                ))}
              </select>
            </div>
          </Tooltip>
        </div>
      ))}
    </div>
  );
};

export default ServiceList;
