import { Project } from '@/types/project'

interface PersonStructuredDataProps {
  className?: string
}

export function PersonStructuredData({ className }: PersonStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Brandon J. Redmond",
    "url": "https://brandon-redmond.dev",
    "image": "https://brandon-redmond.dev/images/profile/brandon-redmond.svg",
    "sameAs": [
      "https://github.com/brandonjredmond",
      "https://linkedin.com/in/brandonjredmond",
      "https://twitter.com/brandonjredmond"
    ],
    "jobTitle": "AI Engineer & Agentic Systems Architect",
    "worksFor": {
      "@type": "Organization",
      "name": "Freelance"
    },
    "alumniOf": [
      {
        "@type": "EducationalOrganization",
        "name": "University"
      }
    ],
    "knowsAbout": [
      "Artificial Intelligence",
      "Machine Learning",
      "Agentic Systems",
      "Model Context Protocol",
      "MCP Servers",
      "Python",
      "Rust",
      "TypeScript",
      "Software Architecture"
    ],
    "description": "AI Engineer & Agentic Systems Architect specializing in building intelligent systems, MCP servers, and teaching the next generation of AI engineers"
  }

  return (
    <script
      type="application/ld+json"
      className={className}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface ProjectStructuredDataProps {
  project: Project
  className?: string
}

export function ProjectStructuredData({ project, className }: ProjectStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": project.title,
    "description": project.description,
    "url": `https://brandon-redmond.dev/projects/${project.slug}`,
    "author": {
      "@type": "Person",
      "name": "Brandon J. Redmond",
      "url": "https://brandon-redmond.dev"
    },
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Cross-platform",
    "programmingLanguage": project.techStack.flatMap(stack => stack.items),
    "features": project.features,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "screenshot": project.images?.[0] ? `https://brandon-redmond.dev${project.images[0]}` : undefined,
    "keywords": project.tags.join(", "),
    // Enhanced with global impact data
    "audience": project.globalImpact?.geographicReach?.map(region => ({
      "@type": "Audience",
      "geographicArea": {
        "@type": "Place",
        "name": region
      }
    })),
    "usageInfo": project.globalImpact?.socialImpact,
    "releaseNotes": project.challenges?.join("; "),
    "installUrl": project.githubUrl,
    "codeRepository": project.githubUrl,
    "downloadUrl": project.githubUrl,
    "sameAs": project.demoUrl ? [project.demoUrl] : undefined,
    // Add educational value
    "educationalUse": project.educational?.join("; "),
    // Add accessibility information
    "accessibilityFeature": project.globalImpact?.accessibilityFeatures,
    "accessibilityHazard": "none",
    "accessMode": ["textual", "visual"],
    "accessModeSufficient": ["textual", "visual"]
  }

  return (
    <script
      type="application/ld+json"
      className={className}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

interface WebsiteStructuredDataProps {
  className?: string
}

export function WebsiteStructuredData({ className }: WebsiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Brandon J. Redmond - AI Engineer & Agentic Systems Architect",
    "url": "https://brandon-redmond.dev",
    "description": "Portfolio and blog of Brandon J. Redmond, AI Engineer & Agentic Systems Architect specializing in intelligent systems and MCP servers",
    "author": {
      "@type": "Person",
      "name": "Brandon J. Redmond"
    },
    "inLanguage": "en-US",
    "copyrightYear": new Date().getFullYear(),
    "genre": ["Technology", "Artificial Intelligence", "Software Development"],
    "keywords": "AI Engineer, Agentic Systems, MCP Servers, Machine Learning, Teaching, Portfolio",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://brandon-redmond.dev/projects?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <script
      type="application/ld+json"
      className={className}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}