'use client';

import { usePathname } from 'next/navigation';

/**
 * Hook for client components that need navigation helpers
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { href, isActive } = useLocalizedNavigation();
 *   
 *   return (
 *     <Link 
 *       href={href('/about')} 
 *       className={isActive('/about') ? 'active' : ''}
 *     >
 *       About
 *     </Link>
 *   );
 * }
 * ```
 */
export function useLocalizedNavigation() {
  const pathname = usePathname();
  
  return {
    href: (path: string) => path,
    isActive: (path: string) => {
      // Exact match
      if (pathname === path) return true;
      
      // Check if pathname starts with the path (for nested routes)
      if (path !== '/' && pathname.startsWith(path + '/')) return true;
      
      return false;
    },
  };
}