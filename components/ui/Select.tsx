/**
 * Select Component
 * Reusable select dropdown with label and error state
 */

import { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = '',
      label,
      error,
      fullWidth = true,
      options,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const baseStyles =
      'px-3 py-2.5 rounded-xl bg-[#3d4457] border text-white text-base focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer';

    const errorStyles = error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-[#4f5d75] focus:ring-[#ef8354]';

    const widthStyles = fullWidth ? 'w-full' : '';

    const combinedClassName = `${baseStyles} ${errorStyles} ${widthStyles} ${className}`;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={selectId}
            className="block mb-1 text-sm font-medium text-[#bfc0c0]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={combinedClassName}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
