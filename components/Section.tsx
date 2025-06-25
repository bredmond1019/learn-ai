import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing = 'lg', ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          {
            'py-8 sm:py-12': spacing === 'sm',
            'py-12 sm:py-16': spacing === 'md',
            'py-16 sm:py-24': spacing === 'lg',
            'py-24 sm:py-32': spacing === 'xl',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Section.displayName = 'Section';

export { Section };
export default Section;