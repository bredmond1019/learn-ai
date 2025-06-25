import React from 'react';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`overflow-auto ${className}`} {...props}>
      {children}
    </div>
  );
};