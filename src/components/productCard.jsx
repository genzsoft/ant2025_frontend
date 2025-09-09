import React from 'react';
import { Link } from 'react-router-dom';

// ProductCard component
// Props:
// - imageSrc: string
// - name: string (product name)  
// - price: number
// - to?: string (link to details)
// - onView?: () => void (optional click handler if no link)
// - compact?: boolean (default false)
export default function ProductCard({
  imageSrc = 'https://placehold.co/160x120',
  name = 'Product name',
  price = 0,
  to,
  onView,
  compact = false,
}) {
  return (
    <div className={
      compact
        ? 'w-full max-w-[300px] bg-white rounded-xl shadow-[0_4px_18px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col mx-auto'
        : 'w-full max-w-[300px] bg-white rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col mx-auto'
    }>
      {/* Image Section - Takes 2/3 of the space */}
      <div className={compact ? 'relative h-56 bg-gray-50 flex items-center justify-center' : 'relative h-64 bg-gray-50 flex items-center justify-center'}>
        <img
          src={imageSrc}
          alt={name}
          className="w-auto h-full object-contain"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/api/placeholder/300/300';
          }}
        />
      </div>

      {/* Content Section - Takes 1/3 of the space */}
      <div className={compact ? 'p-3 flex flex-col gap-2' : 'p-4 flex flex-col gap-3'}>
        {/* Product Name - Max 2 lines with ellipsis */}
        <h3
          className={compact ? 'text-sm font-semibold text-gray-900 text-center leading-tight' : 'text-base font-semibold text-gray-900 text-center leading-tight'}
          style={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={name}
        >
          {name}
        </h3>

        {/* Price */}
        <div className="text-center">
          <div className={compact ? 'text-lg font-bold text-green-600' : 'text-xl font-bold text-green-600'}>
            ৳{price}
          </div>
        </div>

        {/* View Button */}
        <div className="mt-1">
          {to ? (
            <Link
              to={to}
              className={
                compact
                  ? 'w-full inline-flex items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors shadow-sm'
                  : 'w-full inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors shadow-sm'
              }
              aria-label={`View ${name}`}
            >
              View Details
            </Link>
          ) : (
            <button
              type="button"
              onClick={onView}
              className={
                compact
                  ? 'w-full inline-flex items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors shadow-sm'
                  : 'w-full inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors shadow-sm'
              }
              aria-label={`View ${name}`}
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}