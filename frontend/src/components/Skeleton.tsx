interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular', 
  width, 
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-mocca-200 rounded';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton components
export function JobCardSkeleton() {
  return (
    <div className="bg-mocca-100 p-6 rounded-lg shadow-md border border-mocca-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Skeleton variant="text" width="60%" height={28} className="mb-2" />
          <Skeleton variant="text" width="40%" height={20} />
        </div>
        <Skeleton variant="rectangular" width={80} height={32} className="rounded-full" />
      </div>
      <Skeleton variant="text" width="100%" height={16} className="mb-2" />
      <Skeleton variant="text" width="90%" height={16} className="mb-2" />
      <Skeleton variant="text" width="75%" height={16} className="mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton variant="rectangular" width={80} height={24} className="rounded" />
        <Skeleton variant="rectangular" width={100} height={24} className="rounded" />
        <Skeleton variant="rectangular" width={90} height={24} className="rounded" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={120} height={40} className="rounded-lg" />
        <Skeleton variant="rectangular" width={140} height={40} className="rounded-lg" />
      </div>
    </div>
  );
}

export function ProfileFormSkeleton() {
  return (
    <div className="bg-mocca-100 p-8 rounded-lg shadow-md border border-mocca-200 space-y-6">
      <Skeleton variant="text" width="40%" height={32} className="mb-4" />
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Skeleton variant="text" width="30%" height={20} className="mb-2" />
          <Skeleton variant="rectangular" width="100%" height={40} className="rounded-lg" />
        </div>
        <div>
          <Skeleton variant="text" width="30%" height={20} className="mb-2" />
          <Skeleton variant="rectangular" width="100%" height={40} className="rounded-lg" />
        </div>
      </div>
      <div>
        <Skeleton variant="text" width="20%" height={20} className="mb-2" />
        <Skeleton variant="rectangular" width="100%" height={100} className="rounded-lg" />
      </div>
    </div>
  );
}

