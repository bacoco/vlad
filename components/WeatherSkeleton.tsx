export function WeatherSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Main Temperature Display */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full"></div>
          <div className="h-20 md:h-24 w-32 md:w-40 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Weather Condition */}
      <div className="mb-6">
        <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="h-5 w-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}