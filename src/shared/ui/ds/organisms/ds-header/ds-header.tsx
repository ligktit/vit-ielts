'use client';

import { useState } from 'react';
import { DSButton } from '../../atoms/ds-button';

/**
 * Design System Header
 *
 * @figma IELTS Prediction Test — "Header" component
 * White background, logo left, nav center, auth buttons right
 */

export type DSHeaderNavItem = {
  label: string;
  href: string;
  active?: boolean;
  children?: { label: string; href: string }[];
};

export type DSHeaderProps = {
  logoSrc?: string;
  logoAlt?: string;
  navItems: DSHeaderNavItem[];
  isAuthenticated?: boolean;
  userName?: string;
  userAvatar?: string;
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
  onLogoClick?: () => void;
  className?: string;
};

export const DSHeader = ({
  logoSrc = '/logo.svg',
  logoAlt = 'IELTS Prediction Test',
  navItems,
  isAuthenticated = false,
  userName,
  onLogin,
  onSignup,
  onLogout,
  onLogoClick,
  className = '',
}: DSHeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={`ds-header ${className}`}>
      <div className="ds-header__container">
        {/* Logo */}
        <a href="/" className="ds-header__logo" onClick={onLogoClick}>
          <img src={logoSrc} alt={logoAlt} className="ds-header__logo-img" />
        </a>

        {/* Desktop Navigation */}
        <nav className="ds-header__nav">
          {navItems.map((item) => (
            <div key={item.href} className={`ds-header__nav-item ${item.children ? 'ds-header__nav-item--dropdown' : ''}`}>
              <a
                href={item.href}
                className={`ds-header__nav-link ${item.active ? 'ds-header__nav-link--active' : ''}`}
              >
                {item.label}
                {item.children && <span className="ds-header__nav-arrow">›</span>}
              </a>
              {item.children && (
                <div className="ds-header__dropdown">
                  {item.children.map((child) => (
                    <a key={child.href} href={child.href} className="ds-header__dropdown-link">
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Auth Actions */}
        <div className="ds-header__actions">
          {isAuthenticated ? (
            <div className="ds-header__user">
              <span className="ds-header__user-name">{userName}</span>
              <span className="ds-header__user-dot">🟢</span>
            </div>
          ) : (
            <>
              <DSButton variant="secondary" size="sm" onClick={onLogin}>
                Đăng ký / Đăng nhập
              </DSButton>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className={`ds-header__hamburger ${mobileOpen ? 'ds-header__hamburger--open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="ds-header__mobile-nav">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="ds-header__mobile-link">
              {item.label}
            </a>
          ))}
          <div className="ds-header__mobile-actions">
            {isAuthenticated ? (
              <DSButton variant="ghost" fullWidth onClick={onLogout}>Đăng xuất</DSButton>
            ) : (
              <>
                <DSButton variant="primary" fullWidth onClick={onSignup}>Đăng ký</DSButton>
                <DSButton variant="secondary" fullWidth onClick={onLogin}>Đăng nhập</DSButton>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
