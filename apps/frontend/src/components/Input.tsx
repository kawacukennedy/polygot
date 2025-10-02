import React from 'react';

type InputType = 'text' | 'email' | 'password' | 'number';

interface InputProps {
  id: string;
  label: string;
  placeholder?: string;
  type?: InputType;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  placeholder,
  type = 'text',
  required = false,
  error,
  value,
  onChange,
}) => {
  const hasError = !!error;
  const inputClasses = `block w-full px-3 py-2 border ${hasError ? 'border-danger' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`;
  const errorId = `${id}-error`;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      <div className="mt-1">
        <input
          type={type}
          id={id}
          name={id}
          className={inputClasses}
          placeholder={placeholder}
          required={required}
          aria-invalid={hasError ? "true" : undefined}
          aria-describedby={hasError ? errorId : undefined}
          value={value}
          onChange={onChange}
        />
      </div>
      {hasError && (
        <p className="mt-2 text-sm text-danger" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
