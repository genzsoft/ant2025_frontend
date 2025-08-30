import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function NearbyShop() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    axios
      .get('/data.json')
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res.data?.shops) ? res.data.shops : [];
        setShops(list.slice(0, 4));
      })
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold uppercase tracking-wide">Your Nearby Shops</h3>
          <Link to="/shops" className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50">View all</Link>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {shops.map((s) => (
              <article key={s.id} className="flex flex-col gap-3">
                <div className="overflow-hidden rounded-xl">
                  <img src={s.image} alt={s.name} className="h-48 w-full object-cover" loading="lazy" />
                </div>
                <h4 className="text-base font-semibold text-gray-900">{s.name}</h4>
                <p className="text-sm text-gray-500">{s.subtitle}</p>
                <div>
                  <Link to={s.url || '/shops'} className="inline-block rounded-md border border-cyan-600 px-4 py-2 text-xs font-medium uppercase text-cyan-600 hover:bg-cyan-50">Shop Now</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}