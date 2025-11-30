import React from 'react';
import './Input.css';

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helper,
  required = false,
  disabled = false,
  className = '',
  id,
  ...props
}) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="input-field"
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
      {helper && !error && <span className="input-helper">{helper}</span>}
    </div>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  helper,
  required = false,
  disabled = false,
  className = '',
  id,
  ...props
}) {
  const inputId = id || `textarea-${label?.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        className="input-field textarea-field"
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
      {helper && !error && <span className="input-helper">{helper}</span>}
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Välj...',
  error,
  required = false,
  disabled = false,
  className = '',
  id,
  ...props
}) {
  const inputId = id || `select-${label?.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <select
        id={inputId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="input-field select-field"
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  id,
}) {
  const inputId = id || `checkbox-${label?.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <label htmlFor={inputId} className={`checkbox-group ${className}`}>
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="checkbox-input"
      />
      <span className="checkbox-custom" />
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
  size = 'medium',
  className = '',
}) {
  return (
    <label className={`toggle-group toggle-${size} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="toggle-input"
      />
      <span className="toggle-switch" />
      {label && <span className="toggle-label">{label}</span>}
    </label>
  );
}

export default Input;
