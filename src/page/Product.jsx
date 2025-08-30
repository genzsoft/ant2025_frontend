import React from 'react';
import ProductCard from '../components/productCard.jsx';

export default function Product() {
  const sample = [
    {
      imageSrc: 'https://placehold.co/220x140/png',
      storeName: 'BD Store',
      name: 'Ek Bakke Quran',
      price: 150,
      originalPrice: 200,
      inStock: false,
    },
    {
      imageSrc: 'https://placehold.co/220x140/png',
      storeName: 'BD Store',
      name: 'Cleanser Liquid Detergent 500ml',
      price: 150,
      originalPrice: 200,
      inStock: true,
    },
  ];

  return (
    <section className="min-h-[60vh] p-6">
      <div className="mx-auto max-w-screen-xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600 mt-2">Browse our latest products.</p>
        </header>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
          {sample.map((p, idx) => (
            <ProductCard key={idx} {...p} to={`/product/${idx + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
