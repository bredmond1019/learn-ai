import createMDX from '@next/mdx'
import bundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  experimental: {
    mdxRs: true,
    optimizePackageImports: ['lucide-react'],
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  
  // ESLint and TypeScript configuration for build
  eslint: {
    ignoreDuringBuilds: true, // Allow production builds to complete
  },
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript errors visible
  },
  
  // Enable standalone output for Docker deployment (disabled for Vercel)
  ...(process.env.DOCKER_BUILD && { output: 'standalone' }),
  
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Performance optimizations (swcMinify is enabled by default in Next.js 15)
  
  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Vercel-specific optimizations
  ...(process.env.VERCEL && {
    // Optimize for Vercel deployment
    experimental: {
      ...nextConfig.experimental,
      outputFileTracingRoot: process.cwd(),
    },
  }),
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [], // Add external domains as needed
    remotePatterns: [
      // Add patterns for external images
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   port: '',
      //   pathname: '/images/**',
      // },
    ],
    unoptimized: false,
  },
  
  // Bundle analyzer (enable when needed)
  // bundleAnalyzer: {
  //   enabled: process.env.ANALYZE === 'true',
  // },
  
  // Additional experimental features for performance
  // (experimental config merged below)
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      // Vercel-optimized chunk splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: process.env.VERCEL ? 240000 : 500000, // Smaller chunks for Vercel
        cacheGroups: {
          default: false,
          vendors: false,
          // Core React chunk
          react: {
            name: 'react',
            chunks: 'all',
            test: /node_modules\/(react|react-dom)/,
            priority: 40,
            enforce: true,
          },
          // Next.js runtime
          nextjs: {
            name: 'nextjs',
            chunks: 'all',
            test: /node_modules\/next/,
            priority: 35,
            enforce: true,
          },
          // Monaco Editor in separate chunk (lazy loaded)
          monaco: {
            name: 'monaco',
            chunks: 'async',
            test: /node_modules\/(monaco-editor|@monaco-editor)/,
            priority: 30,
            enforce: true,
          },
          // Large third-party libraries
          largeLibs: {
            name: 'large-libs',
            chunks: 'all',
            test: /node_modules\/(highlight\.js|prism|shiki)/,
            priority: 25,
            enforce: true,
          },
          // WASM modules (async loading)
          wasm: {
            name: 'wasm',
            chunks: 'async',
            test: /\.(wasm)$/,
            priority: 23,
            enforce: true,
          },
          // Learning components (lazy loaded)
          learningComponents: {
            name: 'learning-components',
            chunks: 'async',
            test: /components\/learn\/(Quiz|ProgressDashboard|CodeValidation|.*Feedback)\.tsx$/,
            priority: 20,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          // Vendor chunk for common dependencies
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 15,
            minChunks: 2,
            reuseExistingChunk: true,
          },
          // Common application code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };

      // Tree shaking improvements
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Module concatenation
      config.optimization.concatenateModules = true;

      // Better module IDs for caching
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
    }

    // WASM support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Add WASM to asset modules
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    // Dynamic imports optimization
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    // Performance hints
    if (!dev) {
      config.performance = {
        maxAssetSize: process.env.VERCEL ? 240000 : 500000, // 240KB for Vercel, 500KB for other
        maxEntrypointSize: process.env.VERCEL ? 240000 : 500000, // 240KB for Vercel, 500KB for other
        hints: process.env.VERCEL ? 'error' : 'warning', // Strict for Vercel
      };
    }
    
    return config;
  },
  
  // Headers for better caching and security
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/wasm/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=31536000',
          },
          {
            key: 'Content-Type',
            value: 'application/wasm',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // 1 day
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // 1 day
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600', // 1 hour
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // 1 day
          },
        ],
      },
    ]
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      // Add any redirects here if needed
    ]
  },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

// Export with MDX and bundle analyzer plugins
export default withBundleAnalyzer(withMDX(nextConfig))