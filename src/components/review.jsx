import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReviewCard from './cards/reviewCard.jsx';
import { Api_Base_Url } from '../config/api.js';

// Contract:
// Fetch from `${Api_Base_Url}/api/reviews/` (Django REST pagination style)
// Response: { count, next, previous, results: [ {id, customer_name, customer_img, rating, comment, created_at} ] }
// Show up to 3 at a time; Load More reveals next 3 (client-side from accumulated list or fetch next page via next URL)
// Hide entire section if no reviews (count < 1)

export default function Review() {
  const [reviews, setReviews] = useState([]); // accumulated reviews
  const [nextUrl, setNextUrl] = useState(null); // server provided next page
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0); // index of first review in current slide
  // direction state removed (not needed after simplified animation)
  const [fetchingMore, setFetchingMore] = useState(false);
  const [itemsPerSlide, setItemsPerSlide] = useState(() => (typeof window !== 'undefined' && window.innerWidth >= 768 ? 3 : 1));

  const baseUrl = Api_Base_Url || '';

  const fetchPage = useCallback(async (url) => {
    try {
      const endpoint = url || `${baseUrl}/api/reviews/`;
      const res = await axios.get(endpoint);
      const data = res.data || {};
      const incoming = Array.isArray(data.results) ? data.results : [];
      setReviews(prev => {
        // Avoid duplicates by id
        const existingIds = new Set(prev.map(r => r.id));
        const merged = [...prev];
        incoming.forEach(r => { if (!existingIds.has(r.id)) merged.push(r); });
        return merged;
      });
      setNextUrl(data.next);
      setTotalCount(typeof data.count === 'number' ? data.count : incoming.length);
      setError(null);
    } catch {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  // Responsive items per slide listener
  useEffect(() => {
    const handleResize = () => {
      const newVal = window.innerWidth >= 768 ? 3 : 1;
      setItemsPerSlide(prev => {
        if (prev !== newVal) {
          // Adjust slideIndex to keep within bounds
          setSlideIndex(idx => {
            if (idx >= reviews.length) return Math.max(0, reviews.length - newVal);
            // If remaining items less than newVal, back up so last slice fills from end
            if (idx + newVal > reviews.length) return Math.max(0, reviews.length - newVal);
            return idx;
          });
        }
        return newVal;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [reviews.length]);

  const canGoPrev = slideIndex > 0;
  const canGoNext = () => {
    if (slideIndex + itemsPerSlide < reviews.length) return true;
    return !!nextUrl; // more available on server
  };

  const goPrev = () => {
    if (!canGoPrev) return;
    setSlideIndex(i => Math.max(0, i - itemsPerSlide));
  };

  const goNext = async () => {
    if (!canGoNext()) return;
    const nextStart = slideIndex + itemsPerSlide;
    // Need more data?
    if (nextStart + itemsPerSlide > reviews.length && nextUrl && !fetchingMore) {
      setFetchingMore(true);
      await fetchPage(nextUrl);
      setFetchingMore(false);
    }
    // Only advance if we actually have at least one more item
    if (nextStart < reviews.length) {
      setSlideIndex(nextStart);
    }
  };

  // Hide section entirely if finished loading and no reviews
  if (!loading && totalCount < 1) return null;

  // Determine current slide items
  const currentItems = reviews.slice(slideIndex, slideIndex + itemsPerSlide);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-8 text-center">
          <h3 className="text-3xl font-semibold text-zinc-800">What Our Customers Are Saying</h3>
          <p className="text-neutral-400">Featured Products You Might Like</p>
        </header>
        {loading ? (
          <div className="text-gray-500 text-center">Loading…</div>
        ) : error ? (
          <div className="text-red-500 text-center text-sm">{error}</div>
        ) : (
          <div className="relative">
            {/* Arrows */}
            {canGoPrev && (
              <button
                onClick={goPrev}
                aria-label="Previous reviews"
                className="flex absolute left-2 md:-left-4 top-1/2 -translate-y-1/2 h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 shadow"
              >
                <span className="text-lg md:text-xl">‹</span>
              </button>
            )}
            {canGoNext() && (
              <button
                onClick={goNext}
                aria-label="Next reviews"
                className="flex absolute right-2 md:-right-4 top-1/2 -translate-y-1/2 h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 shadow"
              >
                <span className="text-lg md:text-xl">›</span>
              </button>
            )}

            <div className="overflow-hidden">
              <div
                className={`px-4 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[230px] max-h-[230px] transition-transform duration-500 ease-out`}
              >
                {currentItems.map((r) => (
                  <div
                    key={r.id}
                    className="w-full h-full animate-slideIn flex"
                  >
                    <ReviewCard
                      // Pass only real image; ReviewCard now renders SVG profile icon if missing or load fails
                      avatar={r.customer_img || ''}
                      name={r.customer_name || 'Anonymous'}
                      role={''}
                      rating={r.rating}
                      text={r.comment}
                    />
                  </div>
                ))}
                {fetchingMore && (
                  <div className="flex items-center justify-center text-sm text-neutral-500">Loading…</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}