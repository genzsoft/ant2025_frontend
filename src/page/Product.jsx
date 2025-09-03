import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ListProductCard from "../components/ListProductCard.jsx";
import ProductCard from "../components/productCard.jsx";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [filters, setFilters] = useState({
    brand: "",
    shippedFrom: "",
    volume: "",
    size: "",
    rating: 0,
  });
  const [view, setView] = useState("grid"); // "grid" or "list"
  const [showMore, setShowMore] = useState({
    brand: false,
    shippedFrom: false,
    volume: false,
    size: false,
  });
  const [itemsToShow, setItemsToShow] = useState(20); // for load more

  // Derive categories and facet options from products
  const brandOptions = useMemo(() => {
    const setVals = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(setVals).sort();
  }, [products]);
  const shippedFromOptions = useMemo(() => {
    const setVals = new Set(products.map((p) => p.shippedFrom).filter(Boolean));
    return Array.from(setVals).sort();
  }, [products]);
  const volumeOptions = useMemo(() => {
    const setVals = new Set(products.map((p) => p.volume).filter(Boolean));
    return Array.from(setVals).sort();
  }, [products]);
  const sizeOptions = useMemo(() => {
    const setVals = new Set(products.map((p) => p.size).filter(Boolean));
    return Array.from(setVals).sort();
  }, [products]);
  const categories = useMemo(() => ["All Categories", ...brandOptions], [brandOptions]);

  useEffect(() => {
    axios.get("/data.json").then((res) => {
      const productList = res.data.products || []; // fallback in case it's missing
      setProducts(productList);
      setFilteredProducts(productList);
    });
  }, []);

  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== "All Categories") {
      result = result.filter(p => p.brand === selectedCategory);
    }
    
    // Apply other filters
    if (filters.brand) result = result.filter(p => p.brand === filters.brand);
    if (filters.shippedFrom) result = result.filter(p => p.shippedFrom === filters.shippedFrom);
    if (filters.volume) result = result.filter(p => p.volume === filters.volume);
    if (filters.size) result = result.filter(p => p.size === filters.size);
    if (filters.rating) result = result.filter(p => p.rating === filters.rating);
    
    setFilteredProducts(result);
  }, [filters, products, searchTerm, selectedCategory]);

  // Reset visible items when filter/search changes
  useEffect(() => {
    setItemsToShow(20);
  }, [filteredProducts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? "" : value // toggle
    }));
  };

  const handleSearch = () => {
    // Search is already handled in useEffect, but we can add additional logic here if needed
    console.log("Searching for:", searchTerm, "in category:", selectedCategory);
  };

  const CheckBox = ({ active }) => (
    <div className="w-5 h-5 flex items-center justify-center">
      {active ? (
        <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      ) : (
        <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
      )}
    </div>
  );

  const StarRating = ({ value }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className="w-4 h-4" fill={i <= value ? "#fbbf24" : "#d1d5db"} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <section className="min-h-screen py-8 px-4 md:px-6 bg-gray-50">
      <div className="max-w-[1360px] mx-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden min-h-[1000px]">
          
          {/* Search Bar */}
          <div className="flex justify-center mt-14">
            <div className="w-[722px] border border-green-600 flex">
              {/* Category Dropdown */}
              <div className="relative">
                <button 
                  className="px-6 py-3 border-r border-green-600 flex items-center gap-2 text-neutral-400 text-xs font-normal font-['Inter'] hover:bg-gray-50"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  {selectedCategory}
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 w-48 bg-white border border-gray-200 shadow-lg z-10">
                    {categories.map(category => (
                      <button
                        key={category}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700"
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Search Input */}
              <div className="flex-1 px-6 py-3">
                <input
                  type="text"
                  placeholder="Search Products"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-neutral-400 text-xs font-normal font-['Inter'] outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              {/* Search Button */}
              <button 
                onClick={handleSearch}
                className="px-6 py-3 bg-green-600 flex justify-center items-center hover:bg-green-700"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Header with filters */}
          <div className="flex justify-between items-center px-8 mt-8 mb-8">
            <div className="text-black text-sm font-semibold font-['Inter']">All product ({filteredProducts.length})</div>
            <div className="flex justify-start items-center gap-4">
              {/* View Toggle */}
              <div className="flex justify-start items-center gap-2">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  aria-pressed={view === 'grid'}
                  className={`inline-flex items-center justify-center w-8 h-8 rounded ${view === 'grid' ? 'text-green-600' : 'text-gray-400'} hover:bg-gray-50`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 18" fill="currentColor" className="w-5 h-5" aria-hidden>
                    <path d="M19 0C19.2652 0 19.5196 0.105357 19.7071 0.292893C19.8946 0.48043 20 0.734784 20 1V17C20 17.2652 19.8946 17.5196 19.7071 17.7071C19.5196 17.8946 19.2652 18 19 18H1C0.734784 18 0.48043 17.8946 0.292893 17.7071C0.105357 17.5196 0 17.2652 0 17V1C0 0.734784 0.105357 0.48043 0.292893 0.292893C0.48043 0.105357 0.734784 0 1 0H19ZM9 10H2V16H9V10ZM18 10H11V16H18V10ZM9 2H2V8H9V2ZM18 2H11V8H18V2Z" />
                  </svg>
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="List view"
                  aria-pressed={view === 'list'}
                  className={`inline-flex items-center justify-center w-8 h-8 rounded ${view === 'list' ? 'text-green-600' : 'text-gray-400'} hover:bg-gray-50`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden>
                    <path d="M8 9C7.71667 9 7.47934 8.904 7.288 8.712C7.09667 8.52 7.00067 8.28267 7 8C6.99934 7.71733 7.09534 7.48 7.288 7.288C7.48067 7.096 7.718 7 8 7H20C20.2833 7 20.521 7.096 20.713 7.288C20.905 7.48 21.0007 7.71733 21 8C20.9993 8.28267 20.9033 8.52033 20.712 8.713C20.5207 8.90567 20.2833 9.00133 20 9H8ZM8 13C7.71667 13 7.47934 12.904 7.288 12.712C7.09667 12.52 7.00067 12.2827 7 12C6.99934 11.7173 7.09534 11.48 7.288 11.288C7.48067 11.096 7.718 11 8 11H20C20.2833 11 20.521 11.096 20.713 11.288C20.905 11.48 21.0007 11.7173 21 12C20.9993 12.2827 20.9033 12.5203 20.712 12.713C20.5207 12.9057 20.2833 13.0013 20 13H8ZM8 17C7.71667 17 7.47934 16.904 7.288 16.712C7.09667 16.52 7.00067 16.2827 7 16C6.99934 15.7173 7.09534 15.48 7.288 15.288C7.48067 15.096 7.718 15 8 15H20C20.2833 15 20.521 15.096 20.713 15.288C20.905 15.48 21.0007 15.7173 21 16C20.9993 16.2827 20.9033 16.5203 20.712 16.713C20.5207 16.9057 20.2833 17.0013 20 17H8ZM4 9C3.71667 9 3.47934 8.904 3.288 8.712C3.09667 8.52 3.00067 8.28267 3 8C2.99934 7.71733 3.09534 7.48 3.288 7.288C3.48067 7.096 3.718 7 4 7C4.282 7 4.51967 7.096 4.713 7.288C4.90634 7.48 5.002 7.7173 5 8C4.998 8.28267 4.902 8.52033 4.712 8.713C4.522 8.90567 4.28467 9.00133 4 9ZM4 13C3.71667 13 3.47934 12.904 3.288 12.712C3.09667 12.52 3.00067 12.2827 3 12C2.99934 11.7173 3.09534 11.48 3.288 11.288C3.48067 11.096 3.718 11 4 11C4.282 11 4.51967 11.096 4.713 11.288C4.90634 11.48 5.002 11.7173 5 12C4.998 12.2827 4.902 12.5203 4.712 12.713C4.522 12.9057 4.28467 13.0013 4 13ZM4 17C3.71667 17 3.47934 16.904 3.288 16.712C3.09667 16.52 3.00067 16.2827 3 16C2.99934 15.7173 3.09534 15.48 3.288 15.288C3.48067 15.096 3.718 15 4 15C4.282 15 4.51967 15.096 4.713 15.288C4.90634 15.48 5.002 15.7173 5 16C4.998 16.2827 4.902 16.5203 4.712 16.713C4.522 16.9057 4.28467 17.0013 4 17Z" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-start items-center gap-4">
                <div className="px-4 py-2 border border-zinc-100">
                  <div className="text-stone-500 text-xs font-medium font-['Inter']">Latest</div>
                </div>
                <div className="px-4 py-2 border border-zinc-100">
                  <div className="text-stone-500 text-xs font-medium font-['Inter']">30</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-72 p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-4 text-zinc-800 text-sm">Brand</h3>
                <div className="space-y-3">
                  {(showMore.brand ? brandOptions : brandOptions.slice(0, 4)).map((b) => (
                    <div key={b} className="flex items-center gap-3 cursor-pointer" onClick={() => handleFilterChange('brand', b)}>
                      <CheckBox active={filters.brand === b} />
                      <span className={`text-sm font-medium ${filters.brand === b ? "text-zinc-800" : "text-neutral-400"}`}>{b}</span>
                    </div>
                  ))}
                </div>
                {brandOptions.length > 4 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      className="text-green-600 text-sm font-semibold hover:underline"
                      onClick={() => setShowMore((s) => ({ ...s, brand: !s.brand }))}
                    >
                      {showMore.brand ? 'View less' : 'View more'}
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-zinc-800 text-sm">Shipped From</h3>
                <div className="space-y-3">
                  {(showMore.shippedFrom ? shippedFromOptions : shippedFromOptions.slice(0, 4)).map((loc) => (
                    <div key={loc} className="flex items-center gap-3 cursor-pointer" onClick={() => handleFilterChange('shippedFrom', loc)}>
                      <CheckBox active={filters.shippedFrom === loc} />
                      <span className={`text-sm font-medium ${filters.shippedFrom === loc ? "text-zinc-800" : "text-neutral-400"}`}>{loc}</span>
                    </div>
                  ))}
                </div>
                {shippedFromOptions.length > 4 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      className="text-green-600 text-sm font-semibold hover:underline"
                      onClick={() => setShowMore((s) => ({ ...s, shippedFrom: !s.shippedFrom }))}
                    >
                      {showMore.shippedFrom ? 'View less' : 'View more'}
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-zinc-800 text-sm">Volume</h3>
                <div className="space-y-3">
                  {(showMore.volume ? volumeOptions : volumeOptions.slice(0, 4)).map((v) => (
                    <div key={v} className="flex items-center gap-3 cursor-pointer" onClick={() => handleFilterChange('volume', v)}>
                      <CheckBox active={filters.volume === v} />
                      <span className={`text-sm font-medium ${filters.volume === v ? "text-zinc-800" : "text-neutral-400"}`}>{v}</span>
                    </div>
                  ))}
                </div>
                {volumeOptions.length > 4 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      className="text-green-600 text-sm font-semibold hover:underline"
                      onClick={() => setShowMore((s) => ({ ...s, volume: !s.volume }))}
                    >
                      {showMore.volume ? 'View less' : 'View more'}
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-zinc-800 text-sm">Size</h3>
                <div className="space-y-3">
                  {(showMore.size ? sizeOptions : sizeOptions.slice(0, 4)).map((s) => (
                    <div key={s} className="flex items-center gap-3 cursor-pointer" onClick={() => handleFilterChange('size', s)}>
                      <CheckBox active={filters.size === s} />
                      <span className={`text-sm font-medium ${filters.size === s ? "text-zinc-800" : "text-neutral-400"}`}>{s}</span>
                    </div>
                  ))}
                </div>
                {sizeOptions.length > 4 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      className="text-green-600 text-sm font-semibold hover:underline"
                      onClick={() => setShowMore((s) => ({ ...s, size: !s.size }))}
                    >
                      {showMore.size ? 'View less' : 'View more'}
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-zinc-800 text-sm">Rating</h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(r => (
                    <div key={r} className="flex items-center gap-3 cursor-pointer" onClick={() => handleFilterChange('rating', r)}>
                      <CheckBox active={filters.rating === r} />
                      <StarRating value={r} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="flex-1 p-6 pb-20">
              <div>
                {view === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-5 md:gap-6">
                    {filteredProducts.slice(0, itemsToShow).map((p) => (
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
                ) : (
                  <div className="flex flex-col gap-4">
                    {filteredProducts.slice(0, itemsToShow).map((p) => (
                      <ListProductCard
                        key={p.id}
                        id={p.id}
                        image={p.image}
                        name={p.name}
                        brand={p.brand}
                        price={p.price}
                        rating={p.rating}
                        volume={p.volume}
                        size={p.size}
                        shippedFrom={p.shippedFrom}
                      />
                    ))}
                  </div>
                )}
                {itemsToShow < filteredProducts.length && (
                  <div className="flex justify-center py-6">
                    <button
                      type="button"
                      onClick={() => setItemsToShow((prev) => Math.min(prev + 20, filteredProducts.length))}
                      className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Load more
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
