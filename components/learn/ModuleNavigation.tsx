'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  HomeIcon,
  CheckCircleIcon,
  LockClosedIcon,
  PlayCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon as ChevronSideIcon
} from '@heroicons/react/24/outline';
import { Module, Section } from '@/types/module';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ModuleNavigationProps {
  currentModule: Module;
  allModules: Module[];
  currentSectionId?: string;
  completedSections: string[];
  completedModules: string[];
  pathId: string;
  pathTitle: string;
  onSectionSelect: (sectionId: string) => void;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  currentModule,
  allModules,
  currentSectionId,
  completedSections,
  completedModules,
  pathId,
  pathTitle,
  onSectionSelect
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedModules, setExpandedModules] = useState<string[]>([currentModule.metadata.id]);


  // Sort modules by order
  const sortedModules = [...allModules].sort((a, b) => a.metadata.order - b.metadata.order);

  // Find current module index
  const currentModuleIndex = sortedModules.findIndex(m => m.metadata.id === currentModule.metadata.id);
  const previousModule = currentModuleIndex > 0 ? sortedModules[currentModuleIndex - 1] : null;
  const nextModule = currentModuleIndex < sortedModules.length - 1 ? sortedModules[currentModuleIndex + 1] : null;

  // Find current section
  const currentSection = currentModule.sections.find(s => s.id === currentSectionId);
  const currentSectionIndex = currentSection ? currentModule.sections.findIndex(s => s.id === currentSectionId) : 0;
  const previousSection = currentSectionIndex > 0 ? currentModule.sections[currentSectionIndex - 1] : null;
  const nextSection = currentSectionIndex < currentModule.sections.length - 1 
    ? currentModule.sections[currentSectionIndex + 1] 
    : null;

  // Calculate module progress
  const getModuleProgress = (module: Module) => {
    const moduleCompletedSections = module.sections.filter(s => 
      completedSections.includes(s.id)
    ).length;
    return Math.round((moduleCompletedSections / module.sections.length) * 100);
  };

  // Check if module is unlocked
  const isModuleUnlocked = (module: Module) => {
    if (!module.metadata.prerequisites || module.metadata.prerequisites.length === 0) {
      return true;
    }
    return module.metadata.prerequisites.every(prereq => completedModules.includes(prereq));
  };

  // Toggle module expansion
  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Generate breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Learn', href: '/learn' },
    { label: pathTitle, href: `/learn/paths/${pathId}` },
    { label: currentModule.metadata.title, href: `/learn/paths/${pathId}/modules/${currentModule.metadata.id}` },
  ];

  if (currentSection) {
    breadcrumbItems.push({ label: currentSection.title });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <nav className="flex items-center space-x-2 text-sm">
          <HomeIcon className="h-4 w-4 text-gray-400" />
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRightIcon className="h-3 w-3 text-gray-400" />
              {item.href ? (
                <Link 
                  href={item.href}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 dark:text-gray-100 font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Module List Sidebar */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Course Modules</h3>
          
          <div className="space-y-2">
            {sortedModules.map((module) => {
              const isUnlocked = isModuleUnlocked(module);
              const isCompleted = completedModules.includes(module.metadata.id);
              const isExpanded = expandedModules.includes(module.metadata.id);
              const isCurrent = module.metadata.id === currentModule.metadata.id;
              const progress = getModuleProgress(module);

              return (
                <div key={module.metadata.id} className="space-y-1">
                  {/* Module Header */}
                  <div
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                      isCurrent 
                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800",
                      !isUnlocked && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => isUnlocked && toggleModuleExpansion(module.metadata.id)}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <button 
                        className="p-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleModuleExpansion(module.metadata.id);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronSideIcon className="h-4 w-4" />
                        )}
                      </button>
                      
                      <div className="flex items-center space-x-2">
                        {isCompleted ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : isUnlocked ? (
                          <PlayCircleIcon className="h-5 w-5 text-blue-500" />
                        ) : (
                          <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        )}
                        
                        <div>
                          <h4 className="font-medium text-sm">{module.metadata.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {module.metadata.duration} • {module.sections.length} sections
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-2">
                      <Badge 
                        variant={isCompleted ? "default" : "outline"}
                        className="text-xs"
                      >
                        {progress}%
                      </Badge>
                    </div>
                  </div>

                  {/* Module Progress Bar */}
                  {isUnlocked && (
                    <div className="px-3">
                      <Progress value={progress} className="h-1" />
                    </div>
                  )}

                  {/* Module Sections */}
                  {isExpanded && isUnlocked && (
                    <div className="ml-8 space-y-1">
                      {module.sections.map((section) => {
                        const isCurrentSection = 
                          module.metadata.id === currentModule.metadata.id && 
                          section.id === currentSectionId;
                        const isSectionCompleted = completedSections.includes(section.id);

                        return (
                          <button
                            key={section.id}
                            onClick={() => {
                              if (module.metadata.id === currentModule.metadata.id) {
                                onSectionSelect(section.id);
                              }
                            }}
                            className={cn(
                              "flex items-center space-x-2 px-3 py-2 w-full text-left rounded-md transition-colors text-sm",
                              isCurrentSection
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800",
                              module.metadata.id !== currentModule.metadata.id && "cursor-default"
                            )}
                          >
                            {isSectionCompleted ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
                            )}
                            <span className="truncate">{section.title}</span>
                            {section.type !== 'content' && (
                              <Badge variant="outline" className="text-xs ml-auto">
                                {section.type}
                              </Badge>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Previous/Next Navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (previousSection) {
                onSectionSelect(previousSection.id);
              } else if (previousModule) {
                // Navigate to previous module's last section
                router.push(`/learn/paths/${pathId}/modules/${previousModule.metadata.id}`);
              }
            }}
            disabled={!previousSection && !previousModule}
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Section {currentSectionIndex + 1} of {currentModule.sections.length}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (nextSection) {
                onSectionSelect(nextSection.id);
              } else if (nextModule && isModuleUnlocked(nextModule)) {
                // Navigate to next module's first section
                router.push(`/learn/paths/${pathId}/modules/${nextModule.metadata.id}`);
              }
            }}
            disabled={(!nextSection && !nextModule) || (nextModule ? !isModuleUnlocked(nextModule) : false)}
          >
            Next
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModuleNavigation;