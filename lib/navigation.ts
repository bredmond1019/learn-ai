/**
 * Creates a path (no locale needed anymore)
 * @param path - The path (e.g., '/about')
 * @returns The path unchanged
 */
export function createLocalizedPath(path: string): string {
  return path;
}

/**
 * Creates a href for use in Link components
 * This is an alias for createLocalizedPath for better semantics
 */
export function localizedHref(path: string): string {
  return path;
}

/**
 * Checks if the current pathname matches the given path
 * @param pathname - The current pathname from usePathname()
 * @param path - The path to check against
 * @returns True if the paths match
 */
export function isActivePath(pathname: string, path: string): boolean {
  // Exact match
  if (pathname === path) return true;
  
  // Check if pathname starts with the path (for nested routes)
  if (path !== '/' && pathname.startsWith(path + '/')) return true;
  
  return false;
}

/**
 * Creates a breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function createBreadcrumb(
  label: string, 
  path: string | undefined
): BreadcrumbItem {
  if (!path) return { label };
  
  return {
    label,
    href: path
  };
}

/**
 * Helper for components that need navigation utilities
 * Usage:
 * ```tsx
 * import { createLocalizedNavigation } from '@/lib/navigation';
 * 
 * function MyComponent() {
 *   const pathname = usePathname();
 *   const { href, isActive } = createLocalizedNavigation(pathname);
 *   
 *   return (
 *     <Link href={href('/about')}>About</Link>
 *   );
 * }
 * ```
 */
export function createLocalizedNavigation(pathname: string) {
  return {
    href: (path: string) => path,
    isActive: (path: string) => isActivePath(pathname, path),
  };
}