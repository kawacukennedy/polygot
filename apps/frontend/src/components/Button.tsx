import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  disabled?: boolean;
  aria_label?: string;
  onClick?: () => void;
}

const getVariantClasses = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return 'bg-primary hover:bg-primary_600 text-white';
    case 'secondary':
      return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
    case 'outline':
      return 'border border-primary text-primary hover:bg-primary hover:text-white';
    case 'danger':
      return 'bg-danger hover:bg-red-600 text-white';
    default:
      return 'bg-primary hover:bg-primary_600 text-white';
  }
};

const getSizeClasses = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return 'px-3 py-1 text-sm';
    case 'md':
      return 'px-4 py-2 text-base';
    case 'lg':
      return 'px-5 py-3 text-lg';
    default:
      return 'px-4 py-2 text-base';
  }
};

const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  aria_label,
  onClick,
}) => {
  const baseClasses = 'font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform duration-120 hover:scale-103 active:scale-98 active:duration-90';
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={aria_label || label}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
};

export default Button;
