import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import ProductCard from './productCard.jsx';

export default function Hero() {
  const slides = useMemo(
    () => [
      'https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1600&auto=format&fit=crop',
    ],
    []
  );
  const [idx, setIdx] = useState(0);
  const viewportRef = useRef(null);
  const [vw, setVw] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [slides.length]);

  // Measure viewport width so each slide matches it precisely
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const setWidth = () => setVw(el.clientWidth || 0);
    setWidth();

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(setWidth);
      ro.observe(el);
    } else {
      window.addEventListener('resize', setWidth);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', setWidth);
    };
  }, []);

  const go = (dir) => {
    setIdx((i) => (dir === 'next' ? (i + 1) % slides.length : (i - 1 + slides.length) % slides.length));
  };

  const [products, setProducts] = useState([]);
  useEffect(() => {
    let mounted = true;
    axios
      .get('/data.json')
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res.data?.products) ? res.data.products.slice(0, 5) : [];
        setProducts(list);
      })
      .catch(() => setProducts([]));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="bg-stone-100">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10">
        {/* search */}
        <div className="mx-auto max-w-3xl">
          <form onSubmit={(e) => e.preventDefault()} className="flex overflow-hidden rounded-md border border-green-600">
            <input
              type="text"
              placeholder="Search anything"
              className="w-full px-4 py-3 outline-none"
            />
            <button type="submit" className="bg-green-600 px-4 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" />
              </svg>
              <span className="sr-only">Search</span>
            </button>
          </form>
        </div>

        {/* heading */}
        <div className="mt-8 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-900 leading-tight">
            Our product
            <br />
            that
            <span className="relative inline-block align-middle ml-1">
              <img 
                src="/Vector.png" 
                alt="Background decoration" 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-auto z-0"
              />
              <span className="relative px-8 py-4 z-10">Best</span>
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-700">
            Finely processed product produce, safe guaranteed and secured investment platform.
          </p>
        </div>

        {/* slider */}
        <div className="mt-10 relative">
          <div ref={viewportRef} className="h-[340px] sm:h-[400px] md:h-[480px] lg:h-[520px] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-lime-500 to-lime-200">
            <div
              className="flex h-full transition-transform duration-500"
              style={{ transform: `translateX(-${idx * vw}px)` }}
            >
              {slides.map((src, i) => (
                <div key={i} className="h-full flex-shrink-0" style={{ width: vw }}>
                  <img src={src} alt={`Slide ${i + 1}`} className="h-full w-full object-cover object-center" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
          {/* arrows */}
          <button
            type="button"
            onClick={() => go('prev')}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go('next')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 5 product cards (no scroll) */}
        <div className="mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {products.map((p) => (
              <ProductCard 
                key={p.id} 
                imageSrc={p.image}
                storeName="BD Store"
                name={p.name}
                price={p.price}
                originalPrice={p.price + 50}
                inStock={true}
                to={`/product/${p.id}`}
                compact
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}