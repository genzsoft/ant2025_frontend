import React from "react";
import { Link } from "react-router-dom";

export default function ListProductCard({ id, name, brand, price, rating, image, volume, size, shippedFrom }) {
  return (
    <Link to={`/product/${id}`} className="flex items-center gap-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
      {/* Product Image */}
      <div className="w-32 h-32 flex-shrink-0">
        <img src={image} alt={name} className="w-full h-full object-cover rounded-lg" />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{name}</h3>
        <p className="text-sm text-gray-500">Brand: {brand}</p>
        <p className="text-sm text-gray-500">Volume: {volume} | Size: {size}</p>
        <p className="text-sm text-gray-500">Shipped From: {shippedFrom}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                fill={i <= rating ? "#f97316" : "#d1d5db"}
              />
            </svg>
          ))}
        </div>
      </div>

      {/* Price + Action */}
      <div className="flex flex-col items-end">
        <span className="text-xl font-bold text-orange-500">{price} TK</span>
        <span className="mt-2 px-4 py-2 border border-orange-500 text-orange-600 rounded-lg">View</span>
      </div>
    </Link>
  );
}
