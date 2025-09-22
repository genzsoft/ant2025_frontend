import React from 'react';

function WhyChoseUs() {
    return (
        <section className="w-full bg-white py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
                    {/* Text / Features */}
                    <div className="order-1">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-zinc-800 mb-6 sm:mb-8">Why Choose ANT</h2>

                        <div className="flex flex-col gap-6">
                            {/* Feature 1: Quality Assurance */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    {/* Shield / Check Icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" className="flex-shrink-0">
                                        <path d="M12 3L5 6V11C5 16.523 8.804 20.353 12 21C15.196 20.353 19 16.523 19 11V6L12 3Z" stroke="#66BF84" strokeWidth="1.5" strokeLinejoin="round" />
                                        <path d="M9 12.2L11 14L15 10" stroke="#66BF84" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="text-green-500 text-lg sm:text-xl font-semibold">Assurance of receiving high-quality products</p>
                                </div>
                            </div>

                            {/* Feature 2: Discount Facility */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    {/* Tag / Percent Icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                                        <path d="M3 12.586L12.586 3H17a2 2 0 0 1 2 2v4.414L10.414 19a2 2 0 0 1-2.828 0L3 14.414a2 2 0 0 1 0-2.828Z" stroke="#66BF84" strokeWidth="1.5" strokeLinejoin="round" />
                                        <path d="M14 7H14.01" stroke="#66BF84" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M8 15L16 7" stroke="#66BF84" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    <p className="text-green-500 text-lg sm:text-xl font-semibold">Discount facility on all products of this website</p>
                                </div>
                            </div>

                            {/* Feature 3: Nearby Shops Service */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    {/* Location / Shop Icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                                        <path d="M12 21C12 21 18 17 18 11C18 7.68629 15.3137 5 12 5C8.68629 5 6 7.68629 6 11C6 17 12 21 12 21Z" stroke="#66BF84" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="11" r="2.5" stroke="#66BF84" strokeWidth="1.5" />
                                        <path d="M4 4H20" stroke="#66BF84" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    <p className="text-green-500 text-lg sm:text-xl font-semibold">Online service to find nearby shops for product purchase</p>
                                </div>
                            </div>

                            {/* Feature 4: Product Information Access */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    {/* Info / Document Icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                                        <path d="M7 3H13L17 7V19C17 20.1046 16.1046 21 15 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3Z" stroke="#66BF84" strokeWidth="1.5" strokeLinejoin="round" />
                                        <path d="M13 3V7H17" stroke="#66BF84" strokeWidth="1.5" strokeLinejoin="round" />
                                        <path d="M9 12H13" stroke="#66BF84" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M9 16H12" stroke="#66BF84" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    <p className="text-green-500 text-lg sm:text-xl font-semibold">Access to all product-related information online</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Images Collage */}
                    <div className="order-2 md:order-2">
                        <div className="relative mx-auto w-full max-w-md sm:max-w-lg md:max-w-none md:w-full h-64 sm:h-80 md:h-[420px] lg:h-[480px]">
                            {/* Decorative blur backgrounds (hidden on small) */}
                            <div className="hidden sm:block absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 bg-lime-300/30 rounded-full blur-3xl" />
                            <div className="hidden sm:block absolute bottom-0 left-0 w-56 h-56 bg-lime-300/30 rounded-full blur-3xl" />

                            {/* Main images */}
                            <img src="/P4.png" alt="Auto part 1" className="absolute sm:items-center left-2 sm:left-10 md:left-10 top-2 sm:top-4 md:top-6 h-48 sm:h-64 md:h-[360px] w-auto object-contain drop-shadow" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default WhyChoseUs;