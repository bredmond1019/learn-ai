import { getAllProjects } from '@/lib/content/projects/projects'
import { getAllPosts } from '@/lib/content/blog/mdx.server'

const baseUrl = 'https://brandon-redmond.dev'

// No locale support needed anymore

export async function GET() {
  const projects = await getAllProjects()
  const posts = getAllPosts()

  const staticPages = [
    '',
    '/about',
    '/projects',
    '/blog',
    '/learn',
    '/contact',
    '/co-founder'
  ]

  // Generate URLs (no locale prefix needed anymore)
  const generateUrls = (path: string, priority: string, changefreq: string) => {
    return `
    <url>
      <loc>${baseUrl}${path}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(page => generateUrls(page, page === '' ? '1.0' : '0.8', page === '' ? 'weekly' : 'monthly'))
    .join('')}
  ${projects
    .map(project => generateUrls(`/projects/${project.slug}`, '0.9', 'monthly'))
    .join('')}
  ${posts
    .map(post => generateUrls(`/blog/${post.slug}`, '0.7', 'monthly'))
    .join('')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600' // Cache for 1 hour
    }
  })
}