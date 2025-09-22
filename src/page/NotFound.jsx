import React from 'react';
import { Link, useRouteError } from 'react-router-dom';

/*
  NotFound page
  - Handles both explicit 404 (catch-all route) and router error boundary rendering
  - Provides quick navigation and a subtle brand-consistent style
*/
export default function NotFound() {
  const error = useRouteError();
  // try to detect known 404 style errors from router
  const status = (error && (error.status || error.statusCode)) || 404;

  return (
    <main className="min-h-[70vh] w-full flex flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold text-green-600 tracking-wider mb-2">{status === 404 ? 'PAGE NOT FOUND' : 'UNEXPECTED ERROR'}</p>
      <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 select-none">404</h1>
      <h2 className="mt-4 text-2xl md:text-3xl font-bold text-gray-800 max-w-xl">Sorry, we couldn't find the page you're looking for.</h2>
      {error && status !== 404 && (
        <pre className="mt-4 max-w-xl whitespace-pre-wrap break-words text-xs bg-gray-100 text-red-600 p-3 rounded border border-red-200 text-left">
{String(error?.message || error?.statusText || 'Unknown error')}
        </pre>
      )}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
        >
          Go Home
        </Link>
        <Link
          to="/product"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
        >
          Browse Products
        </Link>
      </div>
      <p className="mt-10 text-sm text-gray-500 max-w-md">If you believe this is an error, please contact support or try again later.</p>
    </main>
  );
}
