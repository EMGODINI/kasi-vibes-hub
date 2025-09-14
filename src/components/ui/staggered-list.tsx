
import React from 'react'
import { cn } from '@/lib/utils'

interface StaggeredListProps {
  children: React.ReactNode[]
  className?: string
  staggerDelay?: number
}

const StaggeredList = ({ 
  children, 
  className, 
  staggerDelay = 100 
}: StaggeredListProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className="animate-fade-in opacity-0"
          style={{
            animationDelay: `${index * staggerDelay}ms`,
            animationFillMode: 'forwards'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

export { StaggeredList }
