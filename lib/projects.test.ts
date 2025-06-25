import { 
  getAllProjects, 
  getProjectBySlug, 
  getFeaturedProjects, 
  getProjectNavigation, 
  getRelatedProjects 
} from './projects'
import { Project } from '@/types/project'
import fs from 'fs'
import path from 'path'

// Mock fs module
jest.mock('fs')
jest.mock('path')

const mockFs = fs as jest.Mocked<typeof fs>
const mockPath = path as jest.Mocked<typeof path>

const mockProjects: Project[] = [
  {
    slug: 'project-a',
    title: 'Project A',
    description: 'First project',
    longDescription: 'Detailed description of project A',
    tags: ['React', 'TypeScript', 'AI'],
    featured: true,
    techStack: [{ category: 'Frontend', items: ['React'] }],
    features: ['Feature 1'],
    challenges: ['Challenge 1'],
    outcomes: [{ metric: 'Performance', value: '95%' }]
  },
  {
    slug: 'project-b',
    title: 'Project B',
    description: 'Second project',
    longDescription: 'Detailed description of project B',
    tags: ['Python', 'AI', 'Machine Learning'],
    featured: false,
    techStack: [{ category: 'Backend', items: ['Python'] }],
    features: ['Feature 2'],
    challenges: ['Challenge 2'],
    outcomes: [{ metric: 'Accuracy', value: '98%' }]
  },
  {
    slug: 'project-c',
    title: 'Project C',
    description: 'Third project',
    longDescription: 'Detailed description of project C',
    tags: ['React', 'Node.js', 'Database'],
    featured: true,
    techStack: [{ category: 'Fullstack', items: ['React', 'Node.js'] }],
    features: ['Feature 3'],
    challenges: ['Challenge 3'],
    outcomes: [{ metric: 'Users', value: '10k+' }]
  }
]

describe('Projects Library', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock path.join to return predictable paths
    mockPath.join.mockImplementation((...paths) => paths.join('/'))
    
    // Mock process.cwd()
    const mockCwd = jest.fn(() => '/mock/project/root')
    Object.defineProperty(process, 'cwd', {
      value: mockCwd,
      writable: true
    })
  })

  describe('getAllProjects', () => {
    it('should load and sort projects correctly', async () => {
      mockFs.readdirSync.mockReturnValue(['project-a.json', 'project-b.json', 'project-c.json'] as unknown as fs.Dirent[])
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.toString().includes('project-a.json')) {
          return JSON.stringify(mockProjects[0])
        }
        if (filePath.toString().includes('project-b.json')) {
          return JSON.stringify(mockProjects[1])
        }
        if (filePath.toString().includes('project-c.json')) {
          return JSON.stringify(mockProjects[2])
        }
        return '{}'
      })

      const projects = await getAllProjects()
      
      expect(projects).toHaveLength(3)
      // Featured projects should come first
      expect(projects[0].featured).toBe(true)
      expect(projects[1].featured).toBe(true)
      expect(projects[2].featured).toBe(false)
    })

    it('should filter out non-JSON files', async () => {
      mockFs.readdirSync.mockReturnValue(['project-a.json', 'README.md', 'project-b.json'] as unknown as fs.Dirent[])
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.toString().includes('project-a.json')) {
          return JSON.stringify(mockProjects[0])
        }
        if (filePath.toString().includes('project-b.json')) {
          return JSON.stringify(mockProjects[1])
        }
        return '{}'
      })

      const projects = await getAllProjects()
      
      expect(projects).toHaveLength(2)
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(2)
    })
  })

  describe('getProjectBySlug', () => {
    it('should return project when found', async () => {
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockProjects[0]))

      const project = await getProjectBySlug('project-a')
      
      expect(project).toEqual(mockProjects[0])
      expect(mockFs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('project-a.json'), 'utf8')
    })

    it('should return null when project not found', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found')
      })

      const project = await getProjectBySlug('nonexistent')
      
      expect(project).toBeNull()
    })
  })

  describe('getFeaturedProjects', () => {
    it('should return only featured projects', async () => {
      mockFs.readdirSync.mockReturnValue(['project-a.json', 'project-b.json', 'project-c.json'] as unknown as fs.Dirent[])
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.toString().includes('project-a.json')) {
          return JSON.stringify(mockProjects[0])
        }
        if (filePath.toString().includes('project-b.json')) {
          return JSON.stringify(mockProjects[1])
        }
        if (filePath.toString().includes('project-c.json')) {
          return JSON.stringify(mockProjects[2])
        }
        return '{}'
      })

      const featuredProjects = await getFeaturedProjects()
      
      expect(featuredProjects).toHaveLength(2)
      expect(featuredProjects.every(p => p.featured)).toBe(true)
    })
  })

  describe('getProjectNavigation', () => {
    beforeEach(() => {
      mockFs.readdirSync.mockReturnValue(['project-a.json', 'project-b.json', 'project-c.json'] as unknown as fs.Dirent[])
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.toString().includes('project-a.json')) {
          return JSON.stringify(mockProjects[0])
        }
        if (filePath.toString().includes('project-b.json')) {
          return JSON.stringify(mockProjects[1])
        }
        if (filePath.toString().includes('project-c.json')) {
          return JSON.stringify(mockProjects[2])
        }
        return '{}'
      })
    })

    it('should return correct navigation for middle project', async () => {
      const navigation = await getProjectNavigation('project-a')
      
      expect(navigation.previous).toBeNull() // First project (featured comes first)
      expect(navigation.next?.slug).toBe('project-c') // Next featured project
    })

    it('should return null previous for first project', async () => {
      const navigation = await getProjectNavigation('project-a')
      
      expect(navigation.previous).toBeNull()
    })

    it('should return null next for last project', async () => {
      const navigation = await getProjectNavigation('project-b')
      
      expect(navigation.next).toBeNull()
    })

    it('should return null for nonexistent project', async () => {
      const navigation = await getProjectNavigation('nonexistent')
      
      expect(navigation.previous).toBeNull()
      expect(navigation.next).toBeNull()
    })
  })

  describe('getRelatedProjects', () => {
    beforeEach(() => {
      mockFs.readdirSync.mockReturnValue(['project-a.json', 'project-b.json', 'project-c.json'] as unknown as fs.Dirent[])
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.toString().includes('project-a.json')) {
          return JSON.stringify(mockProjects[0])
        }
        if (filePath.toString().includes('project-b.json')) {
          return JSON.stringify(mockProjects[1])
        }
        if (filePath.toString().includes('project-c.json')) {
          return JSON.stringify(mockProjects[2])
        }
        return '{}'
      })
    })

    it('should return projects with similar tags', async () => {
      const relatedProjects = await getRelatedProjects('project-a', 2)
      
      expect(relatedProjects).toHaveLength(2)
      expect(relatedProjects.find(p => p.slug === 'project-a')).toBeUndefined()
      
      // Project C should be first (shares React tag)
      expect(relatedProjects[0].slug).toBe('project-c')
      
      // Project B should be second (shares AI tag)
      expect(relatedProjects[1].slug).toBe('project-b')
    })

    it('should fill remaining slots with other projects if not enough related ones', async () => {
      const relatedProjects = await getRelatedProjects('project-b', 3)
      
      expect(relatedProjects).toHaveLength(2) // Only 2 other projects available
      expect(relatedProjects.find(p => p.slug === 'project-b')).toBeUndefined()
    })

    it('should return empty array for nonexistent project', async () => {
      const relatedProjects = await getRelatedProjects('nonexistent')
      
      expect(relatedProjects).toHaveLength(0)
    })

    it('should respect the limit parameter', async () => {
      const relatedProjects = await getRelatedProjects('project-a', 1)
      
      expect(relatedProjects).toHaveLength(1)
    })
  })
})