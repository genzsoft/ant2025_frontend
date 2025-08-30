import React from 'react';

export default function Auth() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="text-gray-600 mt-1">Log in or create an account</p>
        <form className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="mt-1 w-full rounded-md border-gray-300 focus:border-green-600 focus:ring-green-600" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" className="mt-1 w-full rounded-md border-gray-300 focus:border-green-600 focus:ring-green-600" placeholder="••••••••" />
          </div>
          <button type="button" className="w-full rounded-md bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700">Log in</button>
          <button type="button" className="w-full rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-900 hover:bg-gray-50">Create account</button>
        </form>
      </div>
    </section>
  );
}
