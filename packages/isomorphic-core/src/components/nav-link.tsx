'use client';

import Link from 'next/link';
import { useState } from 'react';
import cn from '@core/utils/class-names';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  prefetch?: boolean;
}

export default function NavLink({
  href,
  children,
  className,
  onClick,
  prefetch = false,
}: NavLinkProps) {
  const [isClicking, setIsClicking] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Add immediate visual feedback
    setIsClicking(true);

    // Reset after a short delay
    setTimeout(() => {
      setIsClicking(false);
    }, 300);

    // Call the original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={cn(
        className,
        'transition-all duration-150',
        isClicking && 'scale-[0.98] opacity-80'
      )}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
