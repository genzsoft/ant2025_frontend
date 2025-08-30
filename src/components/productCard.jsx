import React from 'react';
import { Link } from 'react-router-dom';

// ProductCard component
// Props:
// - imageSrc: string
// - storeName: string
// - name: string (product name)
// - price: number
// - originalPrice?: number
// - inStock?: boolean (default true)
// - to?: string (link to details)
// - onView?: () => void (optional click handler if no link)
export default function ProductCard({
  imageSrc = 'https://placehold.co/160x120',
  storeName = 'BD Store',
  name = 'Product name',
  price = 0,
  originalPrice,
  inStock = true,
  to,
  onView,
}) {
  const hasDiscount = typeof originalPrice === 'number' && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.max(0, Math.round(100 - (price / originalPrice) * 100))
    : 0;

  const Price = (
    <div className="flex flex-col items-center gap-1">
      <div className="text-2xl font-semibold text-black">{price} TK</div>
      <div className="flex items-center gap-2">
        {hasDiscount && (
          <span className="inline-flex items-center rounded-full bg-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            {discountPercent}%
          </span>
        )}
        {hasDiscount && (
          <span className="text-sm text-gray-400 line-through">{originalPrice}</span>
        )}
      </div>
    </div>
  );

  const ViewButton = to ? (
    <Link
      to={to}
      className="inline-flex w-28 items-center justify-center rounded-md border border-emerald-600 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
      aria-label={`View ${name}`}
    >
      View
    </Link>
  ) : (
    <button
      type="button"
      onClick={onView}
      className="inline-flex w-28 items-center justify-center rounded-md border border-emerald-600 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
      aria-label={`View ${name}`}
    >
      View
    </button>
  );

  return (
    <div className="w-[220px] p-5 bg-white rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.06)] flex flex-col items-center gap-3">
      {/* Image */}
      <div className="flex items-center justify-center h-28">
        <img
          src={imageSrc}
          alt={name}
          className="max-h-28 object-contain"
          loading="lazy"
        />
      </div>

      {/* Store and title */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
          {/* Store icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="h-4 w-4 text-gray-500"
            aria-hidden
          >
            <path d="M3 10.5V8.4c0-.56.225-1.097.625-1.49L6.1 4.5h11.8l2.475 2.41c.4.393.625.93.625 1.49v2.1M4 10.5h16M5.5 10.5V19h13V10.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-medium">{storeName}</span>
        </div>
        <h3
          className="max-w-[220px] text-lg font-medium text-black text-center break-words leading-snug"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          title={name}
        >
          {name}
        </h3>
      </div>

      {/* Price & discount */}
      {Price}

      {/* View button */}
      {ViewButton}

      {/* Stock status */}
      <div className="mt-1 inline-flex items-center gap-2 text-sm">
        {inStock ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-emerald-600" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12.5l2.5 2.5L16 9.5" />
            </svg>
            <span className="text-gray-800">In stock</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-red-600" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 8l8 8M16 8l-8 8" />
            </svg>
            <span className="text-gray-800">Out of stock</span>
          </>
        )}
      </div>
    </div>
  );
}