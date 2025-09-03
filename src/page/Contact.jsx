import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Contact() {
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await axios.get('/data.json');
        setContactData(response.data.contact);
      } catch (error) {
        console.error('Error fetching contact data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send the form data to your backend
      console.log('Form submitted:', formData);

      // Reset form after successful submission
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        message: ''
      });

      // You could add a success message here
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading contact information...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <div className="inline-flex items-center">
          <h1 className="text-3xl font-bold relative inline-block">
            <img 
              src="/Vector.png" 
              alt="Background decoration" 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200px] h-auto z-0"
            />
            <span className="relative z-10 p-4">Contact</span>
          </h1>
          <h1 className="text-3xl font-bold text-green-600 ml-1">Us</h1>
        </div>
      </div>

      {contactData && (
        <div className="p-6 bg-white rounded-sm shadow-[0px_0px_8px_4px_rgba(0,0,0,0.06)] inline-flex justify-center items-start gap-5 overflow-hidden">
          {/* Location Section */}
          <div className="flex justify-start items-start gap-4">
            <div className="p-4 rounded-[100px] outline-1 outline-offset-[-1px] outline-green-600 flex justify-start items-center gap-2.5 overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M7 18C5.17107 18.4117 4 19.0443 4 19.7537C4 20.9943 7.58172 22 12 22C16.4183 22 20 20.9943 20 19.7537C20 19.0443 18.8289 18.4117 17 18" stroke="#1ABA1A" stroke-width="1.5" stroke-linecap="round" />
                <path d="M13.2574 17.4936C12.9201 17.8184 12.4693 18 12.0002 18C11.531 18 11.0802 17.8184 10.7429 17.4936C7.6543 14.5008 3.51519 11.1575 5.53371 6.30373C6.6251 3.67932 9.24494 2 12.0002 2C14.7554 2 17.3752 3.67933 18.4666 6.30373C20.4826 11.1514 16.3536 14.5111 13.2574 17.4936Z" fill="#1ABA1A" stroke="white" stroke-width="1.5" />
                <path d="M14.5 8C14.5 9.3807 13.3807 10.5 12 10.5C10.6193 10.5 9.5 9.3807 9.5 8C9.5 6.61929 10.6193 5.5 12 5.5C13.3807 5.5 14.5 6.61929 14.5 8Z" fill="white" />
              </svg>
            </div>
            <div className="w-56 inline-flex flex-col justify-start items-start gap-3">
              <div className="self-stretch justify-start text-black text-xl font-bold font-['Inter']">
                {contactData.location.title}
              </div>
              <div className="self-stretch justify-start text-stone-500 text-base font-medium font-['Inter']">
                {contactData.location.address}
              </div>
            </div>
          </div>

          {/* Email Section */}
          <div className="flex justify-start items-start gap-4">
            <div className="p-4 rounded-[100px] outline-1 outline-offset-[-1px] outline-green-600 flex justify-start items-center gap-2.5 overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="#1ABA1A" stroke-width="1.5" stroke-linejoin="round" />
                <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="#1ABA1A" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
            </div>
            <div className="w-56 inline-flex flex-col justify-start items-start gap-3">
              <div className="self-stretch justify-start text-black text-xl font-bold font-['Inter']">
                {contactData.email.title}
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                {contactData.email.addresses.map((email, index) => (
                  <div key={index} className="self-stretch justify-start text-stone-500 text-base font-medium font-['Inter']">
                    {email}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phone Section */}
          <div className="flex justify-start items-start gap-4">
            <div className="p-4 rounded-[100px] outline-1 outline-offset-[-1px] outline-green-600 flex justify-start items-center gap-2.5 overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9.15826 5.71223L8.7556 4.80625C8.49232 4.21388 8.36068 3.91768 8.16381 3.69101C7.91708 3.40694 7.59547 3.19794 7.23568 3.08785C6.94859 3 6.62446 3 5.97621 3C5.02791 3 4.55376 3 4.15573 3.18229C3.68687 3.39702 3.26344 3.86328 3.09473 4.3506C2.95151 4.76429 2.99254 5.18943 3.07458 6.0397C3.94791 15.0902 8.90982 20.0521 17.9603 20.9254C18.8106 21.0075 19.2358 21.0485 19.6494 20.9053C20.1368 20.7366 20.603 20.3131 20.8178 19.8443C21 19.4462 21 18.9721 21 18.0238C21 17.3755 21 17.0514 20.9122 16.7643C20.8021 16.4045 20.5931 16.0829 20.309 15.8362C20.0824 15.6393 19.7862 15.5077 19.1938 15.2444L18.2878 14.8417C17.6463 14.5566 17.3255 14.4141 16.9996 14.3831C16.6876 14.3534 16.3731 14.3972 16.0811 14.5109C15.776 14.6297 15.5064 14.8544 14.967 15.3038C14.4302 15.7512 14.1618 15.9749 13.8338 16.0947C13.543 16.2009 13.1586 16.2403 12.8524 16.1951C12.5069 16.1442 12.2424 16.0029 11.7133 15.7201C10.0673 14.8405 9.15953 13.9328 8.27987 12.2867C7.99714 11.7577 7.85578 11.4931 7.80487 11.1477C7.75974 10.8414 7.79908 10.457 7.9053 10.1663C8.02512 9.83828 8.24881 9.56986 8.69619 9.033C9.14562 8.49368 9.37034 8.22402 9.48915 7.91891C9.60285 7.62694 9.64662 7.3124 9.61695 7.00048C9.58594 6.67452 9.44338 6.35376 9.15826 5.71223Z" stroke="#1ABA1A" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </div>
            <div className="w-56 inline-flex flex-col justify-start items-start gap-3">
              <div className="self-stretch justify-start text-black text-xl font-bold font-['Inter']">
                {contactData.phone.title}
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                {contactData.phone.numbers.map((number, index) => (
                  <div key={index} className="self-stretch justify-start text-stone-500 text-base font-medium font-['Inter']">
                    {number}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form */}
      <div className="mt-12 w-full max-w-[966px]">
        <form onSubmit={handleSubmit} className="w-full p-6 bg-white rounded-sm shadow-[0px_0px_8px_4px_rgba(0,0,0,0.06)] inline-flex flex-col justify-start items-start gap-9 overflow-hidden">
          <div className="self-stretch flex flex-col justify-start items-start gap-6 overflow-hidden">
            {/* Full Name Input */}
            <div className="self-stretch px-6 py-2.5 outline-1 outline-offset-[-1px] outline-stone-300 inline-flex justify-start items-center gap-2.5 overflow-hidden">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Your Full Name"
                required
                className="w-full bg-transparent text-black text-base font-medium font-['Inter'] placeholder:text-neutral-400 focus:outline-none"
              />
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-11">
              {/* Phone and Email Row */}
              <div className="self-stretch inline-flex justify-between items-center gap-6">
                <div className="flex-1 px-6 py-2.5 outline-1 outline-offset-[-1px] outline-stone-300 flex justify-start items-center gap-2.5 overflow-hidden">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Your Phone"
                    required
                    className="w-full bg-transparent text-black text-base font-medium font-['Inter'] placeholder:text-neutral-400 focus:outline-none"
                  />
                </div>
                <div className="flex-1 px-6 py-2.5 outline-1 outline-offset-[-1px] outline-stone-300 flex justify-start items-center gap-2.5 overflow-hidden">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your Email"
                    required
                    className="w-full bg-transparent text-black text-base font-medium font-['Inter'] placeholder:text-neutral-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Message Textarea */}
              <div className="self-stretch h-48 px-6 py-2.5 outline-1 outline-offset-[-1px] outline-stone-300 inline-flex justify-start items-start gap-2.5 overflow-hidden">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Message"
                  required
                  rows={8}
                  className="w-full h-full bg-transparent text-black text-base font-medium font-['Inter'] placeholder:text-neutral-400 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed rounded inline-flex justify-center items-center gap-2.5 overflow-hidden transition-colors duration-200"
          >
            <span className="justify-start text-white text-base font-medium font-['Inter'] leading-normal">
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </span>
          </button>
        </form>
      </div>

      {/* Google Map Section */}
      <div className="mt-12 w-full max-w-[966px]">
        <div className="text-center mb-8">
        </div>
        <div className="w-full bg-white rounded-sm shadow-[0px_0px_8px_4px_rgba(0,0,0,0.06)] p-6 overflow-hidden">
          <h2 className="text-2xl mb-2 font-bold text-black">Find us on <span className="text-green-600">Google Map</span></h2>

          <div className="w-full flex justify-center">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d36817.03303496042!2d90.38397440000001!3d23.773183999999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sbd!4v1756792745185!5m2!1sen!2sbd"
              width="100%"
              height="450"
              style={{ border: 0, maxWidth: '100%' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Find us on Google Map"
              className="rounded"
            />
          </div>
        </div>
      </div>

    </section>
  );
}
