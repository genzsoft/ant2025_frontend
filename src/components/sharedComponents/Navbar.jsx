
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

function Navbar() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Product', to: '/product' },
    { label: 'Recharge', to: '/recharge' },
    { label: 'Shops', to: '/shops' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  const baseLink = 'text-base font-semibold leading-tight transition-colors';
  const inactive = 'text-zinc-900 hover:text-green-600';
  const active = 'text-green-600';

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur border-b border-gray-200">
      <nav className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img className="w-10 h-10 rounded" src="/ant.png" alt="ANT logo" />
            <span className="sr-only">ANT</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            <ul className="flex items-center gap-7">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 25 24" fill="none" aria-hidden>
                <path d="M17.228 8.5C17.228 5.73858 14.9894 3.5 12.228 3.5C9.46661 3.5 7.22803 5.73858 7.22803 8.5C7.22803 11.2614 9.46661 13.5 12.228 13.5C14.9894 13.5 17.228 11.2614 17.228 8.5Z" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19.228 20.5C19.228 16.634 16.094 13.5 12.228 13.5C8.36204 13.5 5.22803 16.634 5.22803 20.5" stroke="#141B34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="whitespace-nowrap">Log in / Register</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            {open ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile nav panel */}
        {open && (
          <div className="md:hidden pb-4">
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `block rounded px-3 py-2 ${baseLink} ${isActive ? active : inactive}`}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  <span>Log in / Register</span>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;