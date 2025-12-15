import React from 'react';

const Skeleton = ({ variant = 'rectangular', width, height, className = '' }) => {
    const baseStyles = 'animate-pulse bg-slate-200 dark:bg-slate-700';

    const variants = {
        rectangular: 'rounded-lg',
        circular: 'rounded-full',
        text: 'rounded h-4',
        card: 'rounded-xl aspect-[3/4]',
    };

    const style = {
        width: width || '100%',
        height: variant === 'card' ? 'auto' : (height || '100%'),
    };

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${className}`}
            style={style}
        />
    );
};

// Pre-built skeleton for artifact cards
export const ArtifactCardSkeleton = () => (
    <div className="flex flex-col gap-3">
        <Skeleton variant="card" className="w-full" />
        <Skeleton variant="text" width="70%" height="20px" />
        <Skeleton variant="text" width="40%" height="16px" />
    </div>
);

// Grid of skeleton cards
export const ArtifactGridSkeleton = ({ count = 8 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
        {Array.from({ length: count }).map((_, i) => (
            <ArtifactCardSkeleton key={i} />
        ))}
    </div>
);

export default Skeleton;
