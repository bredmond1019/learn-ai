'use client'

import React, { useState } from 'react'
import Section from '@/components/Section';
import Container from '@/components/Container';
import ProjectCard from '@/components/ProjectCard';
import { Project } from '@/types/project';
import { getTranslations } from '@/lib/translations';
import { type Locale } from '@/lib/learn';

interface ProjectsPageProps {
  initialProjects: Project[];
  locale: string;
}

export function ProjectsPageClient({ initialProjects, locale }: ProjectsPageProps) {
  const t = getTranslations(locale as Locale);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  
  // Get unique tags for filtering
  const allTags = Array.from(
    new Set(initialProjects.flatMap(project => project.tags))
  ).sort();
  
  // Filter projects based on search and filter
  const filteredProjects = initialProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'All' || project.tags.includes(selectedFilter);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section spacing="lg">
        <Container>
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">
            {t.projects.title}
          </h1>
          <p className="text-xl text-center text-foreground/80 max-w-3xl mx-auto">
            {t.projects.description}
          </p>
        </Container>
      </Section>

      {/* Search and Filter */}
      <Section spacing="md">
        <Container>
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder={t.projects.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-gray-700 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
            
            {/* Filter Dropdown */}
            <div className="flex-shrink-0">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-3 bg-background border border-gray-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
              >
                <option value="All">{t.projects.filterAll}</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-foreground/60">
              {filteredProjects.length === initialProjects.length 
                ? t.projects.showingAll.replace('{{count}}', initialProjects.length.toString())
                : t.projects.showingFiltered.replace('{{filtered}}', filteredProjects.length.toString()).replace('{{total}}', initialProjects.length.toString())
              }
            </p>
            
            {(searchTerm || selectedFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('All');
                }}
                className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t.projects.clearFilters}
              </button>
            )}
          </div>
        </Container>
      </Section>

      {/* Projects Grid */}
      <Section spacing="xl">
        <Container>
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.slug} {...project} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-foreground/20">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground/80 mb-2">
                {t.projects.noResults}
              </h3>
              <p className="text-foreground/60 mb-4">
                {t.projects.noResultsSubtitle}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('All');
                }}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                {t.projects.viewAll}
              </button>
            </div>
          )}
        </Container>
      </Section>

      {/* Call to Action */}
      <Section spacing="lg" className="bg-background-secondary/30">
        <Container size="md">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">
              {t.projects.interestedInCollaboration}
            </h2>
            <p className="text-foreground/70 mb-6">
              {t.projects.collaborationText}
            </p>
            <a
              href="mailto:hello@aiengineer.dev"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
            >
              <span>{t.projects.discussProject}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </Container>
      </Section>
    </div>
  );
}