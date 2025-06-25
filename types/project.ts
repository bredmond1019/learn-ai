export interface Project {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  featured: boolean;
  icon?: string;
  isPrivate?: boolean;
  demoUrl?: string;
  githubUrl?: string;
  images?: string[];
  techStack: {
    category: string;
    items: string[];
  }[];
  features: string[];
  challenges: string[];
  outcomes: {
    metric: string;
    value: string;
  }[];
  codeSnippets?: {
    title: string;
    language: string;
    code: string;
  }[]
  // Global Impact and International Context Fields
  globalImpact?: {
    // Geographic reach and international usage
    geographicReach: string[]; // countries/regions where used
    usersWorldwide?: number; // global user count
    // Social and environmental impact
    socialImpact?: string; // how it helps society
    environmentalImpact?: string; // sustainability benefits
    // Accessibility and inclusion
    accessibilityFeatures?: string[]; // a11y features
    multilingualSupport?: boolean; // supports multiple languages
    // Economic impact
    economicImpact?: string; // business value created
    // Educational value
    knowledgeSharing?: string; // learning resources provided
  };
  // International technical considerations
  localization?: {
    supportedLanguages?: string[]; // technical language support
    culturalAdaptations?: string[]; // cultural considerations
    timeZoneHandling?: boolean; // handles multiple time zones
    currencySupport?: string[]; // supported currencies
    regionalCompliance?: string[]; // GDPR, LGPD, etc.
  };
  // Educational and teaching aspects
  educational?: string[]; // learning opportunities provided
}