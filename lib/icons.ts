import { 
  Workflow, 
  MessageSquare, 
  GraduationCap, 
  Code2, 
  Mountain, 
  Network, 
  Wrench, 
  Users, 
  Bot, 
  Zap,
  Package,
  Lock,
  Globe,
  type LucideIcon
} from 'lucide-react';

// Icon mapping for projects
export const projectIcons: Record<string, LucideIcon> = {
  // Project-specific icons
  'Workflow': Workflow,
  'MessageSquare': MessageSquare,
  'GraduationCap': GraduationCap,
  'Code2': Code2,
  'Mountain': Mountain,
  'Network': Network,
  'Wrench': Wrench,
  'Users': Users,
  'Bot': Bot,
  'Zap': Zap,
  
  // Additional icons that might be useful
  'Package': Package,
  'Lock': Lock,
  'Globe': Globe,
};

// Get icon component by name with fallback
export function getProjectIcon(iconName?: string): LucideIcon {
  if (!iconName) return Package; // Default icon
  return projectIcons[iconName] || Package;
}

// Check if repository is private
export function isRepoPrivate(project: { isPrivate?: boolean }): boolean {
  return project.isPrivate === true;
}