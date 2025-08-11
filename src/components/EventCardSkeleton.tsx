import { Card, CardContent } from '@/components/ui'

export interface EventCardSkeletonProps {
  index?: number
}

export default function EventCardSkeleton ({ index = 0 }: EventCardSkeletonProps) {
  return (
    <div
      className="opacity-0 animate-fade-in-slow"
      style={{ animationDelay: `${index * 90}ms`, animationFillMode: 'forwards' }}
    >
      <Card className="border-0 shadow-md h-full">
        <CardContent className="flex flex-col h-full relative p-4 pt-5">
          <div className="absolute top-2 right-2 w-4 h-4 rounded bg-gray-200" />
          <div className="mb-3 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-full" />
          </div>
          <div className="mt-auto space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="h-5 w-20 bg-gray-200 rounded-full" />
              <div className="h-5 w-14 bg-gray-200 rounded-full" />
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
