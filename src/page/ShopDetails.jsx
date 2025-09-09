import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Api_Base_Url } from '../config/api';

export default function ShopDetails() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchShopDetails = useCallback(async () => {
    try {
      setError('');
      const response = await axios.get(`${Api_Base_Url}/api/shops/${id}/`);
      setShop(response.data);
    } catch (error) {
      console.error('Error fetching shop details:', error);
      setError('Failed to load shop details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchShopProducts = useCallback(async () => {
    try {
      setError('');
      // Try to filter by shop ID in the API call
      const response = await axios.get(`${Api_Base_Url}/api/shop-products/?shop=${id}`);
      let shopProducts = response.data;
      console.log('Fetched products from API:', shopProducts);
      
      
      // If API doesn't support shop filtering, filter client-side
      if (!shopProducts || shopProducts.length === 0) {
        const allProductsResponse = await axios.get(`${Api_Base_Url}/api/shop-products/`);
        shopProducts = allProductsResponse.data.filter(product => 
          product.shop_name === shop?.name || product.shop === parseInt(id)
        );
      }
      
      setProducts(shopProducts);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(shopProducts.map(product => product.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching shop products:', error);
      setError('Failed to load shop products. Please try again.');
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [id, shop?.name]);

  const filterProducts = useCallback(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  // Fetch shop details
  useEffect(() => {
    if (id) {
      fetchShopDetails();
    }
  }, [id, fetchShopDetails]);

  // Fetch shop products
  useEffect(() => {
    fetchShopProducts();
  }, [fetchShopProducts]);

  // Filter products when search term or category changes
  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error && !shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Shop</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/shops"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            ← Back to Shops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/shops"
            className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Shops
          </Link>
        </div>

        {/* Shop Details Header */}
        {shop && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Shop Image */}
              <div className="aspect-square lg:aspect-[4/3]">
                <img
                  src={shop.shop_image || '/api/placeholder/600/400'}
                  alt={shop.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/600/400';
                  }}
                />
              </div>

              {/* Shop Information */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{shop.name}</h1>
                  <p className="text-lg text-gray-600">
                    Owned by <span className="font-semibold">{shop.owner_name}</span>
                  </p>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-600">{shop.address}</p>
                      <p className="text-sm text-gray-500">
                        {[shop.upazila_name, shop.district_name, shop.division_name].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>

                  {shop.owner_phone && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">Phone</p>
                        <a href={`tel:${shop.owner_phone}`} className="text-green-600 hover:text-green-700">
                          {shop.owner_phone}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 6v4m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Established</p>
                      <p className="text-gray-600">
                        {shop.created_at ? new Date(shop.created_at).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Products</h2>

          {/* Error Message for Products */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button className="absolute right-0 top-0 h-full px-6 bg-green-600 text-white rounded-r-md hover:bg-green-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Products Loading */}
          {productsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-6">
                <p className="text-gray-600">
                  Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                  {searchTerm && ` for "${searchTerm}"`}
                  {selectedCategory && ` in "${selectedCategory}"`}
                </p>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square">
                        <img
                          src={product.image || '/api/placeholder/300/300'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/300/300';
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        {product.category && (
                          <div className="mb-2">
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {product.category}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center mb-3">
                          <span className="text-2xl font-bold text-green-600">
                            ৳{product.price}
                          </span>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            product.stock && product.stock !== '0' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock && product.stock !== '0' ? `Stock: ${product.stock}` : 'Out of Stock'}
                          </span>
                        </div>

                        <Link
                          to={`/shop-products/${product.id}`}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors inline-block text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedCategory 
                      ? 'Try adjusting your search criteria.' 
                      : 'This shop hasn\'t added any products yet.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
