import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function AssetsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Total Balance Skeleton */}
      <Card className="bg-gradient-to-br from-indigo-500 to-purple-600">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-white/20" />
          <Skeleton className="h-12 w-48 bg-white/20 mt-2" />
          <Skeleton className="h-4 w-64 bg-white/20 mt-2" />
        </CardHeader>
      </Card>

      {/* Chain Balance Skeletons */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
