import { NextRequest, NextResponse } from 'next/server'

// Define supported locales
export const locales = ['en', 'pt-BR'] as const
export const defaultLocale = 'en' as const

// Define localized route mappings
const routeTranslations: Record<string, Record<string, string>> = {
  'en': {
    '/about': '/about',
    '/projects': '/projects',
    '/blog': '/blog',
    '/learn': '/learn',
    '/contact': '/contact',
  },
  'pt-BR': {
    '/about': '/sobre',
    '/projects': '/projetos',
    '/blog': '/blog',
    '/learn': '/aprender',
    '/contact': '/contato',
  }
}

// Get locale from pathname
function getLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale
    }
  }
  return defaultLocale
}

// Get preferred locale from request headers
function getPreferredLocale(request: NextRequest): string {
  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    // Simple parsing - in production, consider using a proper library
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim())
    
    for (const lang of languages) {
      if (lang.startsWith('pt')) {
        return 'pt-BR'
      }
      if (lang.startsWith('en')) {
        return 'en'
      }
    }
  }

  return defaultLocale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for certain paths
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(locale => 
    pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    // Redirect to add locale to path
    const preferredLocale = getPreferredLocale(request)
    const localizedPath = `/${preferredLocale}${pathname}`
    
    return NextResponse.redirect(new URL(localizedPath, request.url))
  }

  // Handle localized route mappings (for future implementation)
  // This would handle Portuguese route names like /sobre -> /about internally
  
  return NextResponse.next()
}

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|sw.js|manifest.json|robots.txt|sitemap.xml).*)',
  ],
}