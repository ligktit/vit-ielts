import { DSInput, type DSInputProps } from '../../atoms/ds-input';

/**
 * Design System Form Field — Label + Input + Helper/Error text
 *
 * @figma IELTS Prediction Test — Login/Sign Up forms
 */

export type DSFormFieldProps = DSInputProps & {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
};

export const DSFormField = ({
  label,
  helperText,
  errorMessage,
  required = false,
  error,
  id,
  ...inputProps
}: DSFormFieldProps) => {
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const hasError = error || !!errorMessage;

  return (
    <div className={`ds-form-field ${hasError ? 'ds-form-field--error' : ''}`}>
      {label && (
        <label className="ds-form-field__label" htmlFor={fieldId}>
          {label}
          {required && <span className="ds-form-field__required">*</span>}
        </label>
      )}
      <DSInput {...inputProps} id={fieldId} error={hasError} fullWidth />
      {(errorMessage || helperText) && (
        <span className={`ds-form-field__helper ${hasError ? 'ds-form-field__helper--error' : ''}`}>
          {errorMessage || helperText}
        </span>
      )}
    </div>
  );
};
