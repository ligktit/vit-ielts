
/**
 * Design System Avatar
 *
 * @figma IELTS Prediction Test — Dashboard, Result page
 */

export type DSAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type DSAvatarProps = {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: DSAvatarSize;
  className?: string;
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const DSAvatar = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  className = '',
}: DSAvatarProps) => {
  const classNames = [
    'ds-avatar',
    `ds-avatar--${size}`,
    className,
  ].filter(Boolean).join(' ');

  if (src) {
    return (
      <div className={classNames}>
        <img src={src} alt={alt || name} className="ds-avatar__img" />
      </div>
    );
  }

  return (
    <div className={classNames}>
      <span className="ds-avatar__initials">{name ? getInitials(name) : '?'}</span>
    </div>
  );
};
