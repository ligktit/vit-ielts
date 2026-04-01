'use client';

import { useState } from 'react';
import { Button } from '../../atoms/button';
import { Avatar } from '../../atoms/avatar';

/**
 * Design System Header
 *
 * @figma IELTS Prediction Test — "Header" component
 * Glassmorphism pill: white/50 bg, blur, rounded-[60px], sticky top-5
 * Tailwind-only — NO custom CSS classes
 */

export type HeaderNavItem = {
  label: string;
  href: string;
  active?: boolean;
  children?: { label: string; href: string }[];
};

export type HeaderProps = {
  logoSrc?: string;
  logoAlt?: string;
  navItems: HeaderNavItem[];
  isAuthenticated?: boolean;
  userName?: string;
  userAvatar?: string;
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
  onLogoClick?: () => void;
  className?: string;
};

export const Header = ({
  logoSrc = '/assets/figma/logos/logo-color.png',
  logoAlt = 'IELTS Prediction Test',
  navItems,
  isAuthenticated = false,
  userName,
  userAvatar,
  onLogin,
  onSignup,
  onLogout,
  onLogoClick,
  className = '',
}: HeaderProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={`sticky top-5 z-50 bg-transparent pointer-events-none px-5 font-[var(--font-primary)] ${className}`}>
      {/* Glassmorphism Pill Container */}
      <div className="flex items-center justify-between max-w-[1597px] mx-auto px-[50px] py-[15px] h-20 bg-white/50 shadow-[0px_4px_10px_rgba(0,0,0,0.25)] backdrop-blur-[7.5px] rounded-[60px] pointer-events-auto">
        
        {/* Logo */}
        <a href="/" className="flex items-center shrink-0 no-underline" onClick={onLogoClick}>
          <img src={logoSrc} alt={logoAlt} className="h-12 w-auto object-contain" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {navItems.map((item) => (
            <div key={item.href} className={`relative ${item.children ? 'group' : ''}`}>
              <a
                href={item.href}
                className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium no-underline rounded-md whitespace-nowrap transition-colors duration-150
                  ${item.active
                    ? 'text-[var(--color-primary-500)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--color-neutral-50)]'
                  }`}
              >
                {item.label}
                {item.children && (
                  <span className="transition-transform duration-150 text-[1.1em] group-hover:rotate-90">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </a>
              {item.children && (
                <div className="absolute top-full left-0 min-w-[200px] bg-white border border-[var(--border-default)] rounded-md shadow-lg p-2 opacity-0 invisible translate-y-2 transition-all duration-150 z-[var(--z-dropdown)] group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
                  {item.children.map((child) => (
                    <a
                      key={child.href}
                      href={child.href}
                      className="block px-3 py-2 text-sm text-[var(--text-secondary)] no-underline rounded-sm transition-colors duration-150 hover:bg-[var(--color-neutral-50)] hover:text-[var(--text-primary)]"
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 cursor-pointer">
              <span className="flex items-center text-[var(--text-primary)]">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="text-base font-bold text-[var(--text-primary)]">{userName || 'Username'}</span>
              <Avatar size="md" name={userName || 'U'} src={userAvatar} />
            </div>
          ) : (
            <>
              <Button variant="primary" size="md" onClick={onLogin}>
                Đăng ký / Đăng nhập
              </Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className={`md:hidden flex flex-col gap-[5px] p-2 bg-transparent border-none cursor-pointer`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-[22px] h-[2px] bg-[var(--text-primary)] rounded-[1px] transition-transform duration-150 ${mobileOpen ? 'rotate-45 translate-x-[5px] translate-y-[5px]' : ''}`} />
          <span className={`block w-[22px] h-[2px] bg-[var(--text-primary)] rounded-[1px] transition-opacity duration-150 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-[22px] h-[2px] bg-[var(--text-primary)] rounded-[1px] transition-transform duration-150 ${mobileOpen ? '-rotate-45 translate-x-[5px] -translate-y-[5px]' : ''}`} />
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden flex flex-col px-6 py-4 border-t border-[var(--border-default)] bg-white rounded-b-3xl mt-1 pointer-events-auto shadow-lg">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block py-3 text-base text-[var(--text-secondary)] no-underline border-b border-[var(--color-neutral-100)] hover:text-[var(--text-primary)]"
            >
              {item.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 mt-4">
            {isAuthenticated ? (
              <Button variant="ghost" fullWidth onClick={onLogout}>Đăng xuất</Button>
            ) : (
              <>
                <Button variant="primary" fullWidth onClick={onSignup}>Đăng ký</Button>
                <Button variant="secondary" fullWidth onClick={onLogin}>Đăng nhập</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
