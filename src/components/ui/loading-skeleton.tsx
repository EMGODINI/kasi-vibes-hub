
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'avatar' | 'text' | 'button'
  lines?: number
}

const LoadingSkeleton = ({ 
  className, 
  variant = 'default', 
  lines = 1,
  ...props 
}: LoadingSkeletonProps) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-[shimmer_2s_infinite]"
  
  const variants = {
    default: "rounded-md",
    card: "rounded-lg h-48 w-full",
    avatar: "rounded-full h-10 w-10",
    text: "rounded h-4 w-full",
    button: "rounded-md h-11 w-24"
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variants.text,
              i === lines - 1 ? "w-3/4" : "w-full",
              className
            )}
            {...props}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
      {...props}
    />
  )
}

export { LoadingSkeleton }
