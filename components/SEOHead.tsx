import Head from 'next/head';
import { generateMetaTags, type SEOConfig } from '@/lib/performance';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalPath?: string;
  ogImage?: string;
  structuredData?: object;
  noIndex?: boolean;
  isArticle?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
}

export function SEOHead({
  title,
  description,
  keywords = [],
  canonicalPath,
  ogImage,
  structuredData,
  noIndex = false,
  isArticle = false,
  publishedTime,
  modifiedTime,
  author,
  section,
}: SEOHeadProps) {

  const baseUrl = 'https://brandon-redmond.dev';
  const currentUrl = canonicalPath ? `${baseUrl}${canonicalPath}` : baseUrl;
  
  // Default values
  const pageTitle = title || 'Brandon J. Redmond - AI Engineer & Technical Leader';
  const pageDescription = description || 'AI Engineer passionate about building intelligent systems that make a real impact. Specializing in agentic AI, full stack web development, and technical leadership.';
  const defaultKeywords = [
    'AI Engineer',
    'Brandon Redmond',
    'Agentic Systems',
    'MCP Servers',
    'Machine Learning',
    'TypeScript',
    'Python',
    'Rust',
    'Software Architecture',
    'AI Development'
  ];
  const allKeywords = [...defaultKeywords, ...keywords];

  // Generate alternate language URLs
  const alternateLanguages = [
    { lang: 'en', url: `${baseUrl}${canonicalPath || ''}` },
    { lang: 'x-default', url: `${baseUrl}${canonicalPath || ''}` }, // Default to English
  ];

  // Default OG image
  const defaultOgImage = `${baseUrl}/images/og-image.svg`;
  const finalOgImage = ogImage || defaultOgImage;

  const seoConfig: SEOConfig = {
    title: pageTitle,
    description: pageDescription,
    keywords: allKeywords,
    canonicalUrl: currentUrl,
    ogImage: finalOgImage,
    structuredData,
    alternateLanguages,
  };

  const metaTags = generateMetaTags(seoConfig);

  return (
    <Head>
      {/* Basic meta tags */}
      <title>{pageTitle}</title>
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />}
      
      {/* Language and locale */}
      <meta httpEquiv="content-language" content="en" />
      <meta name="language" content="en" />
      
      {/* Generated meta tags */}
      {metaTags.meta.map((tag, index) => (
        <meta key={index} {...tag} />
      ))}
      
      {/* Article-specific Open Graph tags */}
      {isArticle && (
        <>
          <meta property="og:type" content="article" />
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        </>
      )}
      
      {/* Links */}
      {metaTags.link.map((link, index) => (
        <link key={index} {...link} />
      ))}
      
      {/* Additional SEO enhancements */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="application-name" content="Brandon Redmond - AI Engineer" />
      <meta name="apple-mobile-web-app-title" content="Brandon Redmond" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Performance hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      
      {/* Structured data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      
      {/* Verification tags (add your verification codes here) */}
      {/* <meta name="google-site-verification" content="your-google-verification-code" /> */}
      {/* <meta name="msvalidate.01" content="your-bing-verification-code" /> */}
    </Head>
  );
}

// Specific SEO components for different page types
interface ProjectSEOProps {
  project: {
    title: string;
    description: string;
    slug: string;
    tags: string[];
    featured?: boolean;
  };
  structuredData?: object;
}

export function ProjectSEO({ project, structuredData }: ProjectSEOProps) {
  return (
    <SEOHead
      title={`${project.title} | Projects - Brandon J. Redmond`}
      description={project.description}
      keywords={project.tags}
      canonicalPath={`/projects/${project.slug}`}
      structuredData={structuredData}
      section="Technology"
    />
  );
}

interface BlogSEOProps {
  post: {
    title: string;
    description: string;
    slug: string;
    date: string;
    tags?: string[];
  };
  structuredData?: object;
}

export function BlogSEO({ post, structuredData }: BlogSEOProps) {
  return (
    <SEOHead
      title={`${post.title} | Blog - Brandon J. Redmond`}
      description={post.description}
      keywords={post.tags}
      canonicalPath={`/blog/${post.slug}`}
      structuredData={structuredData}
      isArticle={true}
      publishedTime={post.date}
      author="Brandon J. Redmond"
      section="Technology"
    />
  );
}

interface PageSEOProps {
  pageKey: 'home' | 'about' | 'projects' | 'blog' | 'contact' | 'learn';
  customTitle?: string;
  customDescription?: string;
  structuredData?: object;
}

export function PageSEO({ pageKey, customTitle, customDescription, structuredData }: PageSEOProps) {
  const defaultTitles: Record<string, string> = {
    home: 'Brandon J. Redmond - AI Engineer & Technical Leader',
    about: 'About - Brandon J. Redmond',
    projects: 'Projects - Brandon J. Redmond',
    blog: 'Blog - Brandon J. Redmond',
    contact: 'Contact - Brandon J. Redmond',
    learn: 'Learn Agentic AI - Brandon J. Redmond'
  };
  
  const defaultDescriptions: Record<string, string> = {
    home: 'AI Engineer passionate about building intelligent systems that make a real impact. Specializing in agentic AI, machine learning, and technical leadership.',
    about: 'Learn about my journey from teaching mathematics to engineering AI systems that solve real-world problems.',
    projects: 'Explore my portfolio of AI projects, MCP servers, and open-source contributions.',
    blog: 'Insights on AI engineering, agentic systems, and technical leadership.',
    contact: 'Get in touch to discuss AI projects, consulting opportunities, or collaborations.',
    learn: 'Master agentic AI development with hands-on tutorials and real-world examples.'
  };
  
  const title = customTitle || defaultTitles[pageKey];
  const description = customDescription || defaultDescriptions[pageKey];
  
  return (
    <SEOHead
      title={title}
      description={description}
      canonicalPath={pageKey === 'home' ? '' : `/${pageKey}`}
      structuredData={structuredData}
    />
  );
}