import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [authMethod, setAuthMethod] = useState('password'); // 'password' or 'otp'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupStep, setSignupStep] = useState('form'); // 'form' or 'otp'
  const [otpTimer, setOtpTimer] = useState(0);
  const [user, setUser] = useState(null); // Store user data after successful registration
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    referCode: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  // OTP Timer Effect
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(timer => timer - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Check for existing user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    
    if (activeTab === 'signup' && signupStep === 'form') {
      // Validate signup form
      if (!formData.phone || !formData.password || !formData.confirmPassword) {
        alert('Please fill all required fields');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      // Simulate sending OTP
      console.log('Sending OTP to:', formData.phone);
      setSignupStep('otp');
      setOtpTimer(40);
      
    } else if (activeTab === 'signup' && signupStep === 'otp') {
      // Validate and submit OTP
      if (!formData.otp || formData.otp.length !== 6) {
        alert('Please enter valid 6-digit OTP');
        return;
      }
      
      // Simulate OTP verification and registration
      console.log('Verifying OTP and registering user');
      
      // Mock user data after successful registration
      const userData = {
        id: Date.now(),
        phone: formData.phone,
        name: 'User', // You can add name field to signup form if needed
        isLoggedIn: true
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Dispatch custom event for navbar update
      window.dispatchEvent(new CustomEvent('userStatusChanged'));
      
      alert('Registration successful! You are now logged in.');
      
      // Redirect to home page after successful signup
      navigate('/');
      
      // Reset form
      setSignupStep('form');
      setActiveTab('login');
      setFormData({
        email: '',
        phone: '',
        referCode: '',
        password: '',
        confirmPassword: '',
        otp: ''
      });
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted');
  };

  const handleResendOTP = () => {
    if (otpTimer === 0) {
      console.log('Resending OTP to:', formData.phone);
      setOtpTimer(40);
      setFormData(prev => ({ ...prev, otp: '' }));
    }
  };

  const handleBackToForm = () => {
    setSignupStep('form');
    setOtpTimer(0);
    setFormData(prev => ({ ...prev, otp: '' }));
  };

  // If user is logged in, redirect to home page
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <section className="min-h-[80vh] flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8 lg:gap-16">
          {/* Left Side - Auth Form */}
          <div className="w-full lg:w-[578px] flex flex-col justify-start items-center gap-8 lg:gap-12">
            <div className="self-stretch flex flex-col justify-start items-start gap-8 lg:gap-11">
              <div className="self-stretch flex flex-col justify-start items-start gap-4 lg:gap-5">
                <div className="self-stretch flex flex-col justify-center items-end gap-3">
                  <div className="self-stretch flex flex-col justify-start items-start gap-5 lg:gap-7">
                    <div className="self-stretch flex flex-col justify-start items-start gap-4 lg:gap-6">
                      {/* Tab Navigation */}
                      <div className="self-stretch rounded inline-flex justify-start items-center overflow-hidden">
                        <button
                          onClick={() => {
                            setActiveTab('login');
                            setSignupStep('form');
                            setOtpTimer(0);
                          }}
                          className={`flex-1 px-4 md:px-6 py-3 flex justify-center items-center gap-2.5 overflow-hidden ${activeTab === 'login' ? 'bg-green-600' : 'bg-zinc-100'
                            }`}
                          disabled={activeTab === 'signup' && signupStep === 'otp'}
                        >
                          <div className={`justify-start text-sm md:text-base font-semibold font-['Inter'] leading-normal ${activeTab === 'login' ? 'text-white' : 'text-neutral-400'
                            }`}>
                            Log in
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('signup');
                            setSignupStep('form');
                            setOtpTimer(0);
                          }}
                          className={`flex-1 px-4 md:px-6 py-3 flex justify-center items-center gap-2.5 overflow-hidden ${activeTab === 'signup' ? 'bg-green-600' : 'bg-zinc-100'
                            }`}
                        >
                          <div className={`justify-start text-sm md:text-base font-semibold font-['Inter'] leading-normal ${activeTab === 'signup' ? 'text-white' : 'text-neutral-400'
                            }`}>
                            Sign Up
                          </div>
                        </button>
                      </div>

                      {/* Login Form */}
                      {activeTab === 'login' && (
                        <>
                          {/* Email Field */}
                          <div className="self-stretch px-4 md:px-6 py-3 bg-neutral-50 outline-1 outline-offset-[-1px] outline-stone-300 inline-flex justify-start items-center gap-2.5 overflow-hidden">
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Email Address*"
                              className="w-full bg-transparent text-sm md:text-base font-semibold font-['Inter'] leading-normal placeholder:text-neutral-400 focus:outline-none"
                            />
                          </div>

                          {/* Refer Code Field */}
                          <div className="self-stretch px-4 md:px-6 py-3 bg-neutral-50 outline-1 outline-offset-[-1px] outline-stone-300 inline-flex justify-start items-center gap-2.5 overflow-hidden">
                            <input
                              type="text"
                              name="referCode"
                              value={formData.referCode}
                              onChange={handleInputChange}
                              placeholder="Refer code*"
                              className="w-full bg-transparent text-sm md:text-base font-semibold font-['Inter'] leading-normal placeholder:text-neutral-400 focus:outline-none"
                            />
                          </div>
                        </>
                      )}

                      {/* Signup Form */}
                      {activeTab === 'signup' && signupStep === 'form' && (
                        <>
                          {/* Phone Number Field */}
                          <div className="self-stretch px-4 md:px-6 py-3 bg-neutral-50 outline-1 outline-offset-[-1px] outline-stone-300 inline-flex justify-start items-center gap-2.5 overflow-hidden">
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Phone Number*"
                              className="w-full bg-transparent text-sm md:text-base font-semibold font-['Inter'] leading-normal placeholder:text-neutral-400 focus:outline-none"
                            />
                          </div>

                          {/* Password Field */}
                          <div className="self-stretch px-4 md:px-6 py-3 bg-neutral-50 outline-1 outline-offset-[-1px] outline-stone-300 flex justify-between items-center overflow-hidden">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="Password*"
                              className="w-full bg-transparent text-sm md:text-base font-semibold font-['Inter'] leading-normal placeholder:text-neutral-400 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="w-5 h-5 md:w-6 md:h-6 relative cursor-pointer flex-shrink-0 ml-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="#9A9A9A" strokeWidth="1.5" />
                                <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="#9A9A9A" strokeWidth="1.5" />
                              </svg>
                            </button>
                          </div>

                          {/* Confirm Password Field */}
                          <div className="self-stretch px-4 md:px-6 py-3 bg-neutral-50 outline-1 outline-offset-[-1px] outline-stone-300 flex justify-between items-center overflow-hidden">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              placeholder="Confirm Password*"
                              className="w-full bg-transparent text-sm md:text-base font-semibold font-['Inter'] leading-normal placeholder:text-neutral-400 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="w-5 h-5 md:w-6 md:h-6 relative cursor-pointer flex-shrink-0 ml-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="#9A9A9A" strokeWidth="1.5" />
                                <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="#9A9A9A" strokeWidth="1.5" />
                              </svg>
                            </button>
                          </div>
                        </>
                      )}

                      {/* OTP Verification Step */}
                      {activeTab === 'signup' && signupStep === 'otp' && (
                        <div className="self-stretch flex flex-col gap-4">
                          {/* Back Button */}
                          <button
                            onClick={handleBackToForm}
                            className="self-start flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="m15 18-6-6 6-6"/>
                            </svg>
                            Back to form
                          </button>

                          {/* OTP Info */}
                          <div className="text-center py-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Your Phone</h3>
                            <p className="text-sm text-gray-600">
                              We've sent a 6-digit code to<br />
                              <span className="font-semibold">{formData.phone}</span>
                            </p>
                          </div>

                          {/* OTP Input */}
                          <div className="self-stretch px-4 md:px-6 py-3 bg-neutral-50 outline-1 outline-offset-[-1px] outline-stone-300 inline-flex justify-start items-center gap-2.5 overflow-hidden">
                            <input
                              type="text"
                              name="otp"
                              value={formData.otp}
                              onChange={handleInputChange}
                              placeholder="Enter 6-digit OTP*"
                              maxLength="6"
                              className="w-full bg-transparent text-sm md:text-base font-semibold font-['Inter'] leading-normal placeholder:text-neutral-400 focus:outline-none text-center tracking-wider"
                            />
                          </div>

                          {/* Resend OTP */}
                          <div className="text-center">
                            {otpTimer > 0 ? (
                              <p className="text-sm text-gray-600">
                                Resend OTP in <span className="font-semibold text-green-600">{otpTimer}s</span>
                              </p>
                            ) : (
                              <button
                                onClick={handleResendOTP}
                                className="text-sm text-green-600 hover:text-green-700 font-semibold underline"
                              >
                                Resend OTP
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Password/OTP Section */}
                    <div className="self-stretch flex flex-col sm:flex-row justify-start items-center gap-4">
                      <div className="w-full sm:flex-1 rounded flex justify-start items-center overflow-hidden">
                        <button
                          onClick={() => setAuthMethod('password')}
                          className={`flex-1 px-4 md:px-6 py-3 flex justify-center items-center gap-2.5 overflow-hidden ${authMethod === 'password' ? 'bg-green-600' : 'bg-zinc-100'
                            }`}
                        >
                          <div className={`justify-start text-sm md:text-base font-semibold font-['Inter'] leading-normal ${authMethod === 'password' ? 'text-white' : 'text-neutral-400'
                            }`}>
                            {activeTab === 'login' ? 'Password' : 'OTP'}
                          </div>
                        </button>
                        <button
                          onClick={() => setAuthMethod('otp')}
                          className={`flex-1 px-4 md:px-6 py-3 flex justify-center items-center gap-2.5 overflow-hidden ${authMethod === 'otp' ? 'bg-green-600' : 'bg-zinc-100'
                            }`}
                        >
                          <div className={`justify-start text-sm md:text-base font-semibold font-['Inter'] leading-normal ${authMethod === 'otp' ? 'text-white' : 'text-neutral-400'
                            }`}>
                            {activeTab === 'login' ? 'OTP' : 'Password'}
                          </div>
                        </button>
                      </div>
                      <div className="w-full sm:flex-1 px-4 md:px-6 py-3 bg-neutral-50 outline-1 outline-offset-[-1px] outline-stone-300 flex justify-between items-center overflow-hidden">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={`${authMethod === 'password' ? 'Password' : 'OTP'}*`}
                          className="w-full bg-transparent text-sm md:text-base font-semibold font-['Inter'] leading-normal placeholder:text-neutral-400 focus:outline-none"
                        />
                        {authMethod === 'password' && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="w-5 h-5 md:w-6 md:h-6 relative cursor-pointer flex-shrink-0"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="#9A9A9A" stroke-width="1.5" />
                              <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="#9A9A9A" stroke-width="1.5" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch text-right justify-start text-neutral-400 text-sm md:text-base font-semibold font-['Inter'] underline leading-normal cursor-pointer">
                    {activeTab === 'login' ? 'Forgot Your Password?' : (signupStep === 'otp' ? '' : 'Get OTP?')}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={activeTab === 'login' ? handleLoginSubmit : handleSignupSubmit}
                className="self-stretch h-12 px-4 md:px-6 py-3 bg-green-600 hover:bg-green-700 inline-flex justify-center items-center gap-2.5 overflow-hidden transition-colors"
              >
                <div className="justify-start text-white text-sm md:text-base font-semibold font-['Inter'] leading-normal">
                  {activeTab === 'login' 
                    ? 'Log in' 
                    : (signupStep === 'form' ? 'Get OTP' : 'Verify & Register')
                  }
                </div>
              </button>
            </div>

            {/* Terms for Sign Up */}
            {activeTab === 'signup' && signupStep === 'form' && (
              <div className="justify-start text-center sm:text-left">
                <span className="text-stone-500 text-xs font-normal font-['Inter']">By continuing, you agree to Safe's </span>
                <span className="text-black text-xs font-normal font-['Inter'] underline cursor-pointer">Terms and Conditions</span>
              </div>
            )}
          </div>

          {/* Right Side - Benefits & QR Code */}
          <div className="w-full lg:w-96 flex flex-col justify-start items-start gap-8 lg:gap-12 lg:flex-shrink-0">
            <div className="flex flex-col justify-start items-start gap-4 lg:gap-5">
              <div className="self-stretch inline-flex justify-start items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                  <path d="M18.3346 10.0001C18.3346 5.39771 14.6036 1.66675 10.0013 1.66675C5.39893 1.66675 1.66797 5.39771 1.66797 10.0001C1.66797 14.6024 5.39893 18.3334 10.0013 18.3334C14.6036 18.3334 18.3346 14.6024 18.3346 10.0001Z" fill="#0EBC3F" />
                  <path d="M6.66797 10.4167L8.7513 12.5L13.3346 7.5" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div className="justify-start text-black text-sm font-semibold font-['Inter']">Delivering in 10000+ Cities</div>
              </div>
              <div className="inline-flex justify-start items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                  <path d="M18.3346 10.0001C18.3346 5.39771 14.6036 1.66675 10.0013 1.66675C5.39893 1.66675 1.66797 5.39771 1.66797 10.0001C1.66797 14.6024 5.39893 18.3334 10.0013 18.3334C14.6036 18.3334 18.3346 14.6024 18.3346 10.0001Z" fill="#0EBC3F" />
                  <path d="M6.66797 10.4167L8.7513 12.5L13.3346 7.5" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div className="justify-start text-black text-sm font-semibold font-['Inter']">Presence in 6 Continents</div>
              </div>
              <div className="inline-flex justify-start items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                  <path d="M18.3346 10.0001C18.3346 5.39771 14.6036 1.66675 10.0013 1.66675C5.39893 1.66675 1.66797 5.39771 1.66797 10.0001C1.66797 14.6024 5.39893 18.3334 10.0013 18.3334C14.6036 18.3334 18.3346 14.6024 18.3346 10.0001Z" fill="#0EBC3F" />
                  <path d="M6.66797 10.4167L8.7513 12.5L13.3346 7.5" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div className="justify-start text-black text-sm font-semibold font-['Inter']">100 Million Products</div>
              </div>
              <div className="inline-flex justify-start items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                  <path d="M18.3346 10.0001C18.3346 5.39771 14.6036 1.66675 10.0013 1.66675C5.39893 1.66675 1.66797 5.39771 1.66797 10.0001C1.66797 14.6024 5.39893 18.3334 10.0013 18.3334C14.6036 18.3334 18.3346 14.6024 18.3346 10.0001Z" fill="#0EBC3F" />
                  <path d="M6.66797 10.4167L8.7513 12.5L13.3346 7.5" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div className="justify-start text-black text-sm font-semibold font-['Inter']">10 Million Happy Customers & Counting</div>
              </div>
            </div>
            <div className="self-stretch flex flex-col sm:flex-row lg:flex-row justify-start items-center sm:items-start gap-4 sm:gap-7">
              <img className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0" src="https://placehold.co/123x122" alt="QR Code" />
              <div className="flex-1 min-w-0 flex flex-col justify-start items-center sm:items-start gap-4 sm:gap-6 lg:gap-10">
                <div className="w-full flex flex-col justify-start items-center sm:items-start gap-2">
                  <div className="justify-start text-black text-base sm:text-lg font-bold font-['Inter'] text-center sm:text-left">DON'T HAVE ANT APP?</div>
                  <div className="justify-start text-black text-sm font-medium font-['Inter'] text-center sm:text-left">Download it here!</div>
                </div>
                <div className="w-full justify-start text-black text-sm font-medium font-['Inter'] text-center sm:text-left">Scan the QR code</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
