export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  readingTime: number
  tags?: string[]
  author?: string
  featured?: boolean
}

export interface BlogPostMeta {
  slug: string
  title: string
  date: string
  excerpt: string
  readingTime: number
  tags?: string[]
  author?: string
  featured?: boolean
}