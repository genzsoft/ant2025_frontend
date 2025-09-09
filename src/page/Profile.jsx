import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated, removeTokens } from '../utils/auth.js';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('account');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated with valid JWT token
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        // Initialize form data with user data
        setFormData({
          firstName: currentUser.name?.split(' ')[0] || 'User',
          lastName: currentUser.name?.split(' ')[1] || '',
          email: currentUser.email || 'user@example.com',
          phone: currentUser.phone || ''
        });
      } else {
        // Redirect to auth if no valid user found
        navigate('/auth');
      }
    } else {
      // Remove invalid tokens and redirect to auth
      removeTokens();
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    setUser(null);
    // Remove JWT tokens and user data from localStorage
    removeTokens();
    // Dispatch event for navbar update
    window.dispatchEvent(new CustomEvent('userStatusChanged'));
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Update user data in localStorage
    const updatedUser = {
      ...user,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    // Dispatch event for navbar update
    window.dispatchEvent(new CustomEvent('userStatusChanged'));
    
    alert('Profile updated successfully!');
  };

  const sidebarItems = [
    { id: 'account', label: 'Account info', icon: '👤' },
    { id: 'orders', label: 'My order', icon: '📦' },
    { id: 'transactions', label: 'My transaction', icon: '💳' },
    { id: 'password', label: 'Change password', icon: '🔒' }
  ];

  if (!user) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center p-4 md:p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[80vh] py-8 px-4 md:px-6 bg-stone-100">
      <div className="max-w-[1360px] mx-auto">
        <div className="bg-stone-100 rounded-[10px] p-8 min-h-[863px] relative">
          
          {/* Sidebar */}
          <div className="w-64 h-[619px] absolute left-[30px]  bg-neutral-50 rounded-[10px]">
            {/* Profile Image */}
            <div className="w-52 h-56 absolute left-[20px] top-[20px] rounded-[10px] overflow-hidden">
              <img 
                className="w-52 h-56 object-cover" 
                src="https://placehold.co/214x220" 
                alt="Profile" 
              />
            </div>
            
            {/* User Name */}
            <div className="absolute left-[20px] top-[265px] text-black text-xl font-bold font-['Inter'] leading-normal">
              {user.name || 'User'}
            </div>
            
            {/* User Role & Phone */}
            <div className="absolute left-[20px] top-[297px] text-stone-500 text-sm font-normal font-['Inter'] leading-7">
              {user.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : 'Customer'}
            </div>
            <div className="absolute left-[20px] top-[315px] text-stone-500 text-xs font-normal font-['Inter'] leading-5">
              {user.phone || formData.phone}
            </div>
            
            {/* Sidebar Menu Items */}
            {sidebarItems.map((item, index) => (
              <div 
                key={item.id}
                className={`w-52 h-12 absolute left-[20px] rounded-lg cursor-pointer transition-colors ${
                  activeSection === item.id ? 'bg-green-600' : 'bg-white'
                }`}
                style={{ top: `${355 + (index * 61)}px` }}
                onClick={() => setActiveSection(item.id)}
              >
                <div className={`absolute left-[15px] top-[15px] text-sm font-normal font-['Inter'] leading-tight ${
                  activeSection === item.id ? 'text-white' : 'text-black'
                }`}>
                  {item.label}
                </div>
                <div className={`w-3 h-3.5 absolute left-[187.25px] top-[18.50px] text-sm font-black ${
                  activeSection === item.id ? 'text-white' : 'text-black'
                }`}>
                  ›
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="ml-[362px] mt-[20px]">
            {activeSection === 'account' && (
              <>
                {/* Page Title */}
                <div className="text-black text-2xl font-bold font-['Inter'] capitalize leading-7 mb-12">
                  Account info
                </div>

                {/* First Name and Last Name Row */}
                <div className="flex gap-8 mb-8">
                  {/* First Name */}
                  <div className="flex-1">
                    <div className="mb-4">
                      <span className="text-black text-sm font-normal font-['Inter'] leading-tight">First Name </span>
                      <span className="text-red-600 text-sm font-normal font-['Inter'] leading-tight">*</span>
                    </div>
                    <div className="w-full h-11 bg-white rounded-md border border-stone-300">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full h-full px-3 bg-transparent text-neutral-800 text-sm font-normal font-['Inter'] leading-tight focus:outline-none rounded-md"
                        placeholder="First Name"
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="flex-1">
                    <div className="mb-4">
                      <span className="text-black text-sm font-normal font-['Inter'] leading-tight">Last Name </span>
                      <span className="text-red-600 text-sm font-normal font-['Inter'] leading-tight">*</span>
                    </div>
                    <div className="w-full h-11 bg-white rounded-md border border-stone-300">
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full h-full px-3 bg-transparent text-neutral-800 text-sm font-normal font-['Inter'] leading-tight focus:outline-none rounded-md"
                        placeholder="Last Name"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div className="mb-8">
                  <div className="mb-4">
                    <span className="text-black text-sm font-normal font-['Inter'] leading-tight">Email Address </span>
                    <span className="text-red-600 text-sm font-normal font-['Inter'] leading-tight">*</span>
                  </div>
                  <div className="w-full h-11 bg-white rounded-md border border-stone-300">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full h-full px-3 bg-transparent text-neutral-800 text-sm font-normal font-['Inter'] leading-tight focus:outline-none rounded-md"
                      placeholder="Email Address"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="mb-12">
                  <div className="mb-4">
                    <span className="text-black text-sm font-normal font-['Inter'] leading-tight">Phone Number </span>
                    <span className="text-stone-500 text-sm font-normal font-['Inter'] leading-tight">(Optional)</span>
                  </div>
                  <div className="w-full h-11 bg-white rounded-md border border-stone-300">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full h-full px-3 bg-transparent text-neutral-800 text-sm font-normal font-['Inter'] leading-tight focus:outline-none rounded-md"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="w-32 h-12 bg-green-600 rounded-[10px] cursor-pointer" onClick={handleSave}>
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-medium font-['Inter'] uppercase leading-none">
                    save
                  </div>
                </div>
              </>
            )}

            {activeSection === 'orders' && (
              <>
                <div className="text-black text-2xl font-bold font-['Inter'] capitalize leading-7 mb-8">
                  My Orders
                </div>
                
                {/* Order Item */}
                <div className="self-stretch h-72 relative bg-neutral-50 rounded-[10px] mb-6">
                  {/* Product Image Container */}
                  <div className="w-56 h-64 left-[16px] top-[16px] absolute bg-white rounded-[10px] overflow-hidden">
                    <div className="w-56 h-64 left-0 top-0 absolute overflow-hidden">
                      <img className="w-16 h-40 left-[75px] top-[44px] absolute" src="https://placehold.co/70x161" alt="Product" />
                    </div>
                  </div>
                  
                  {/* Product Details */}
                  <div className="w-64 h-64 left-[256px] top-[16px] absolute">
                    {/* Rating/Badge */}
                    <div className="w-16 h-3 left-0 top-[38.25px] absolute justify-center text-amber-500 text-xs font-black font-['Inter'] leading-3"></div>
                    
                    {/* Product Name */}
                    <div className="left-0 top-[62.50px] absolute justify-center text-black text-xl font-medium font-['Inter']">
                      Cleanser Liquid Detergent
                    </div>
                    
                    {/* Price */}
                    <div className="w-20 h-5 left-0 top-[94.39px] absolute justify-center text-red-600 text-lg font-semibold font-['Inter'] leading-snug">
                      150 TK
                    </div>
                    
                    {/* Quantity Selector */}
                    <div className="w-32 h-9 left-0 top-[132.28px] absolute rounded-[10px] border border-neutral-400/20">
                      {/* Minus Button */}
                      <div className="w-2 h-3.5 left-[21px] top-[11.25px] absolute">
                        <div className="w-2.5 h-2.5 left-0 top-[2px] absolute justify-center text-black text-[10px] font-black font-['Font_Awesome_5_Pro'] leading-[10px]">-</div>
                      </div>
                      
                      {/* Quantity Display */}
                      <div className="w-16 h-5 left-[29.75px] top-[8px] absolute">
                        <div className="w-16 h-5 left-[2px] top-[1px] absolute overflow-hidden">
                          <div className="w-1.5 h-5 left-[29.86px] top-[-0.75px] absolute text-center justify-center text-black text-xs font-bold font-['Inter'] leading-tight">1</div>
                        </div>
                      </div>
                      
                      {/* Plus Button */}
                      <div className="w-2 h-3.5 left-[99.75px] top-[11.25px] absolute">
                        <div className="w-2.5 h-2.5 left-0 top-[2px] absolute justify-center text-black text-[10px] font-black font-['Font_Awesome_5_Pro'] leading-[10px]">+</div>
                      </div>
                    </div>
                    
                    {/* Free Shipping Badge */}
                    <div className="w-24 h-5 left-0 top-[189.78px] absolute opacity-5 bg-green-600 rounded-md" />
                    <div className="w-20 h-3.5 left-[10px] top-[192.28px] absolute justify-center text-green-600 text-[10px] font-medium font-['Inter'] uppercase leading-none">
                      free shipping
                    </div>
                    
                    {/* Stock Status */}
                    <div className="w-3 h-3 left-0 top-[222.28px] absolute justify-center text-green-600 text-xs font-black font-['Font_Awesome_5_Pro'] leading-3">•</div>
                    <div className="w-12 h-5 left-[16px] top-[218.08px] absolute justify-center text-black text-xs font-normal font-['Inter'] leading-tight">
                      In stock
                    </div>
                  </div>
                  
                  {/* Save Badge */}
                  <div className="w-20 h-10 left-[16px] top-[16px] absolute bg-green-600 rounded-md">
                    <div className="w-6 h-3.5 left-[10px] top-[5px] absolute justify-center text-white text-[10px] font-normal font-['Inter'] uppercase leading-none">
                      save
                    </div>
                    <div className="w-14 h-4 left-[10px] top-[20px] absolute justify-center text-white text-sm font-medium font-['Inter'] leading-none">
                      50TK
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <div className="w-6 h-6 left-[713px] top-[79px] absolute cursor-pointer">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                </div>

                {/* Second Order Item */}
                <div className="self-stretch h-72 relative bg-neutral-50 rounded-[10px]">
                  {/* Product Image Container */}
                  <div className="w-56 h-64 left-[16px] top-[16px] absolute bg-white rounded-[10px] overflow-hidden">
                    <div className="w-56 h-64 left-0 top-0 absolute overflow-hidden">
                      <img className="w-16 h-40 left-[75px] top-[44px] absolute" src="https://placehold.co/70x161" alt="Product" />
                    </div>
                  </div>
                  
                  {/* Product Details */}
                  <div className="w-64 h-64 left-[256px] top-[16px] absolute">
                    {/* Rating/Badge */}
                    <div className="w-16 h-3 left-0 top-[38.25px] absolute justify-center text-amber-500 text-xs font-black font-['Inter'] leading-3"></div>
                    
                    {/* Product Name */}
                    <div className="left-0 top-[62.50px] absolute justify-center text-black text-xl font-medium font-['Inter']">
                      Cleanser Liquid Detergent
                    </div>
                    
                    {/* Price */}
                    <div className="w-20 h-5 left-0 top-[94.39px] absolute justify-center text-red-600 text-lg font-semibold font-['Inter'] leading-snug">
                      150 TK
                    </div>
                    
                    {/* Quantity Selector */}
                    <div className="w-32 h-9 left-0 top-[132.28px] absolute rounded-[10px] border border-neutral-400/20">
                      {/* Minus Button */}
                      <div className="w-2 h-3.5 left-[21px] top-[11.25px] absolute">
                        <div className="w-2.5 h-2.5 left-0 top-[2px] absolute justify-center text-black text-[10px] font-black font-['Font_Awesome_5_Pro'] leading-[10px]">-</div>
                      </div>
                      
                      {/* Quantity Display */}
                      <div className="w-16 h-5 left-[29.75px] top-[8px] absolute">
                        <div className="w-16 h-5 left-[2px] top-[1px] absolute overflow-hidden">
                          <div className="w-1.5 h-5 left-[29.86px] top-[-0.75px] absolute text-center justify-center text-black text-xs font-bold font-['Inter'] leading-tight">1</div>
                        </div>
                      </div>
                      
                      {/* Plus Button */}
                      <div className="w-2 h-3.5 left-[99.75px] top-[11.25px] absolute">
                        <div className="w-2.5 h-2.5 left-0 top-[2px] absolute justify-center text-black text-[10px] font-black font-['Font_Awesome_5_Pro'] leading-[10px]">+</div>
                      </div>
                    </div>
                    
                    {/* Free Shipping Badge */}
                    <div className="w-24 h-5 left-0 top-[189.78px] absolute opacity-5 bg-green-600 rounded-md" />
                    <div className="w-20 h-3.5 left-[10px] top-[192.28px] absolute justify-center text-green-600 text-[10px] font-medium font-['Inter'] uppercase leading-none">
                      free shipping
                    </div>
                    
                    {/* Stock Status */}
                    <div className="w-3 h-3 left-0 top-[222.28px] absolute justify-center text-green-600 text-xs font-black font-['Font_Awesome_5_Pro'] leading-3">•</div>
                    <div className="w-12 h-5 left-[16px] top-[218.08px] absolute justify-center text-black text-xs font-normal font-['Inter'] leading-tight">
                      In stock
                    </div>
                  </div>
                  
                  {/* Save Badge */}
                  <div className="w-20 h-10 left-[16px] top-[16px] absolute bg-green-600 rounded-md">
                    <div className="w-6 h-3.5 left-[10px] top-[5px] absolute justify-center text-white text-[10px] font-normal font-['Inter'] uppercase leading-none">
                      save
                    </div>
                    <div className="w-14 h-4 left-[10px] top-[20px] absolute justify-center text-white text-sm font-medium font-['Inter'] leading-none">
                      50TK
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <div className="w-6 h-6 left-[713px] top-[79px] absolute cursor-pointer">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'transactions' && (
              <>
                <div className="text-black text-2xl font-bold font-['Inter'] capitalize leading-7 mb-8">
                  My Transaction
                </div>
                
                {/* Transaction Table */}
                <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                  {/* Table Header */}
                  <div className="grid grid-cols-4 bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="text-black text-base font-semibold font-['Inter']">Medium</div>
                    <div className="text-black text-base font-semibold font-['Inter']">Date</div>
                    <div className="text-black text-base font-semibold font-['Inter']">Status</div>
                    <div className="text-black text-base font-semibold font-['Inter']">Transaction Id</div>
                  </div>
                  
                  {/* Transaction Rows */}
                  <div className="divide-y divide-gray-100">
                    <div className="grid grid-cols-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-black text-sm font-normal font-['Inter']">Bkash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">08/28/25</div>
                      <div className="text-black text-sm font-normal font-['Inter']">In Cash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">YY67G67HBSG</div>
                    </div>
                    
                    <div className="grid grid-cols-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-black text-sm font-normal font-['Inter']">Nagad</div>
                      <div className="text-black text-sm font-normal font-['Inter']">08/28/25</div>
                      <div className="text-black text-sm font-normal font-['Inter']">In Cash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">YY67G67HBSG</div>
                    </div>
                    
                    <div className="grid grid-cols-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-black text-sm font-normal font-['Inter']">Bkash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">08/28/25</div>
                      <div className="text-black text-sm font-normal font-['Inter']">Payment</div>
                      <div className="text-black text-sm font-normal font-['Inter']">YY67G67HBSG</div>
                    </div>
                    
                    <div className="grid grid-cols-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-black text-sm font-normal font-['Inter']">Bkash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">08/28/25</div>
                      <div className="text-black text-sm font-normal font-['Inter']">Bonus</div>
                      <div className="text-black text-sm font-normal font-['Inter']">YY67G67HBSG</div>
                    </div>
                    
                    <div className="grid grid-cols-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-black text-sm font-normal font-['Inter']">Bkash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">08/28/25</div>
                      <div className="text-black text-sm font-normal font-['Inter']">In Cash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">YY67G67HBSG</div>
                    </div>
                    
                    <div className="grid grid-cols-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-black text-sm font-normal font-['Inter']">Bkash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">08/28/25</div>
                      <div className="text-black text-sm font-normal font-['Inter']">In Cash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">YY67G67HBSG</div>
                    </div>
                    
                    <div className="grid grid-cols-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-black text-sm font-normal font-['Inter']">Bkash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">08/28/25</div>
                      <div className="text-black text-sm font-normal font-['Inter']">In Cash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">YY67G67HBSG</div>
                    </div>
                    
                    <div className="grid grid-cols-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-black text-sm font-normal font-['Inter']">Bkash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">08/28/25</div>
                      <div className="text-black text-sm font-normal font-['Inter']">In Cash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">YY67G67HBSG</div>
                    </div>
                    
                    <div className="grid grid-cols-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-black text-sm font-normal font-['Inter']">Bkash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">08/28/25</div>
                      <div className="text-black text-sm font-normal font-['Inter']">In Cash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">YY67G67HBSG</div>
                    </div>
                    
                    <div className="grid grid-cols-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="text-black text-sm font-normal font-['Inter']">Bkash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">08/28/25</div>
                      <div className="text-black text-sm font-normal font-['Inter']">In Cash</div>
                      <div className="text-black text-sm font-normal font-['Inter']">YY67G67HBSG</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'password' && (
              <div className="text-black text-2xl font-bold font-['Inter'] capitalize leading-7">
                Change Password
                <p className="text-gray-600 text-base font-normal mt-4">Update your account password here.</p>
              </div>
            )}
          </div>

          {/* Logout Button (positioned at bottom) */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
