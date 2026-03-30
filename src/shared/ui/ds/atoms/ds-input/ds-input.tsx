
/**
 * Design System Input
 *
 * @figma IELTS Prediction Test — Login/Sign Up forms
 * @variants text | password | search | textarea
 * @sizes sm | md | lg
 */

export type DSInputSize = 'sm' | 'md' | 'lg';

export type DSInputProps = {
  type?: 'text' | 'password' | 'email' | 'tel' | 'search' | 'number' | 'url';
  size?: DSInputSize;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  name?: string;
  id?: string;
  autoComplete?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
};

export const DSInput = ({
  type = 'text',
  size = 'md',
  placeholder,
  value,
  defaultValue,
  disabled = false,
  readOnly = false,
  error = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  name,
  id,
  autoComplete,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  className = '',
}: DSInputProps) => {
  const wrapperClasses = [
    'ds-input',
    `ds-input--${size}`,
    error && 'ds-input--error',
    disabled && 'ds-input--disabled',
    fullWidth && 'ds-input--full',
    leftIcon && 'ds-input--has-left-icon',
    rightIcon && 'ds-input--has-right-icon',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {leftIcon && <span className="ds-input__icon ds-input__icon--left">{leftIcon}</span>}
      <input
        type={type}
        className="ds-input__field"
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readOnly}
        name={name}
        id={id}
        autoComplete={autoComplete}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
      {rightIcon && <span className="ds-input__icon ds-input__icon--right">{rightIcon}</span>}
    </div>
  );
};
