import { 
  getAllProjects, 
  getProjectBySlug, 
  getFeaturedProjects, 
  getProjectNavigation, 
  getRelatedProjects 
} from './projects'

describe('Projects Library', () => {
  let allProjects: any[]

  beforeAll(async () => {
    // Load real projects for testing
    allProjects = await getAllProjects()
  })

  describe('getAllProjects', () => {
    it('should load projects correctly', async () => {
      const projects = await getAllProjects()
      
      expect(projects.length).toBeGreaterThan(0)
      // Check that projects have required fields
      projects.forEach(project => {
        expect(project).toHaveProperty('slug')
        expect(project).toHaveProperty('title')
        expect(project).toHaveProperty('description')
        expect(typeof project.featured).toBe('boolean')
      })
    })

    it('should sort featured projects first', async () => {
      const projects = await getAllProjects()
      
      if (projects.length > 1) {
        const featuredProjects = projects.filter(p => p.featured)
        const nonFeaturedProjects = projects.filter(p => !p.featured)
        
        if (featuredProjects.length > 0 && nonFeaturedProjects.length > 0) {
          // Find the index of the first non-featured project
          const firstNonFeaturedIndex = projects.findIndex(p => !p.featured)
          // Find the index of the last featured project
          const lastFeaturedIndex = projects.map(p => p.featured).lastIndexOf(true)
          
          // Featured projects should come before non-featured
          expect(lastFeaturedIndex).toBeLessThan(firstNonFeaturedIndex)
        }
      }
    })
  })

  describe('getProjectBySlug', () => {
    it('should return project when found', async () => {
      if (allProjects.length > 0) {
        const firstProject = allProjects[0]
        const project = await getProjectBySlug(firstProject.slug)
        
        expect(project).not.toBeNull()
        expect(project?.slug).toBe(firstProject.slug)
        expect(project?.title).toBe(firstProject.title)
      }
    })

    it('should return null when project not found', async () => {
      const project = await getProjectBySlug('non-existent-project')
      
      expect(project).toBeNull()
    })
  })

  describe('getFeaturedProjects', () => {
    it('should return only featured projects', async () => {
      const featuredProjects = await getFeaturedProjects()
      
      featuredProjects.forEach(project => {
        expect(project.featured).toBe(true)
      })
    })
  })

  describe('getProjectNavigation', () => {
    it('should return navigation for existing project', async () => {
      if (allProjects.length > 1) {
        // Test with middle project if available
        const middleIndex = Math.floor(allProjects.length / 2)
        const middleProject = allProjects[middleIndex]
        
        const navigation = await getProjectNavigation(middleProject.slug)
        
        expect(navigation).toBeDefined()
        // Should have either previous or next (or both)
        expect(navigation.previous || navigation.next).toBeTruthy()
      }
    })

    it('should return null navigation for non-existent project', async () => {
      const navigation = await getProjectNavigation('non-existent-project')
      
      expect(navigation.previous).toBeNull()
      expect(navigation.next).toBeNull()
    })
  })

  describe('getRelatedProjects', () => {
    it('should return related projects excluding current project', async () => {
      if (allProjects.length > 1) {
        const firstProject = allProjects[0]
        const relatedProjects = await getRelatedProjects(firstProject.slug, 5)
        
        // Should not include the current project
        expect(relatedProjects.find(p => p.slug === firstProject.slug)).toBeUndefined()
        
        // Should respect the limit
        expect(relatedProjects.length).toBeLessThanOrEqual(5)
        expect(relatedProjects.length).toBeLessThanOrEqual(allProjects.length - 1)
      }
    })

    it('should respect the limit parameter', async () => {
      if (allProjects.length > 2) {
        const firstProject = allProjects[0]
        const relatedProjects = await getRelatedProjects(firstProject.slug, 1)
        
        expect(relatedProjects.length).toBeLessThanOrEqual(1)
      }
    })

    it('should return empty array for non-existent project', async () => {
      const relatedProjects = await getRelatedProjects('non-existent-project', 5)
      
      expect(relatedProjects).toEqual([])
    })
  })
})