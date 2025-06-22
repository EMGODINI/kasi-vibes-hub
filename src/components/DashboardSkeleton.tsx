
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <LoadingSkeleton className="h-8 w-48 mb-2" />
              <LoadingSkeleton className="h-4 w-64" />
            </div>
            <LoadingSkeleton variant="avatar" />
          </div>
          <LoadingSkeleton variant="button" className="w-full h-12" />
        </div>

        {/* Tabs Skeleton */}
        <div className="flex space-x-2 mb-6">
          <LoadingSkeleton className="h-10 w-20" />
          <LoadingSkeleton className="h-10 w-24" />
          <LoadingSkeleton className="h-10 w-20" />
          <LoadingSkeleton className="h-10 w-28" />
        </div>

        {/* Posts Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-gray-900/50 border-orange-500/20 animate-fade-in-up" 
                  style={{ animationDelay: `${i * 200}ms` }}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <LoadingSkeleton variant="avatar" />
                  <div className="flex-1">
                    <LoadingSkeleton className="h-4 w-24 mb-1" />
                    <LoadingSkeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <LoadingSkeleton variant="text" lines={2} className="mb-3" />
                <LoadingSkeleton variant="card" className="mb-3" />
                <div className="flex space-x-4">
                  <LoadingSkeleton className="h-8 w-16" />
                  <LoadingSkeleton className="h-8 w-16" />
                  <LoadingSkeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
