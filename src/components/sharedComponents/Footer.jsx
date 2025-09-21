import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../config/sitesetting.js';

const Footer = () => {
  const settings = useSiteSettings();

  const resolveAsset = (url, fallback) => {
    if (!url) return fallback;
    if (/^https?:/i.test(url)) return url;
    return `${window._env_?.BASE_URL || ''}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <footer className="bg-white ">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12">
        {/** Prepare social links */}
        {(() => {
          // Only consider these four as per requirement
          const formatUrl = (u) => {
            if (!u) return '';
            return /^https?:/i.test(u) ? u : `https://${u}`;
          };
          const socialPlatforms = [
            { key: 'facebook_link', label: 'Facebook' },
            { key: 'twitter_link', label: 'Twitter' },
            { key: 'whatsapp_link', label: 'WhatsApp' },
            { key: 'instagram_link', label: 'Instagram' },
          ];
          const availableSocial = socialPlatforms
            .map(p => ({ ...p, url: formatUrl(settings?.[p.key]) }))
            .filter(p => p.url);

          const gridCols = availableSocial.length > 0 ? 'md:grid-cols-3' : 'md:grid-cols-3';
          const gridClass = `grid grid-cols-1 ${gridCols} gap-12`;

          return (
            <div className={gridClass}>
              {/* Brand */}
              <div>
                <div className="flex items-center gap-4">
                  <img src={resolveAsset(settings?.logo, '/ant.png')} alt="ANT" className="h-12 w-12 rounded object-contain" onError={(e)=>{e.currentTarget.src='/ant.png';}} />
                  <span className="text-2xl  font-bold text-gray-800">ANT</span>
                </div>
                <p className="mt-4 text-gray-700">
                  {settings?.footer_short_description || 'ANT enhances your customer service, sales, and marketing efforts with intuitive features that anyone can use.'}
                </p>

              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold">Quick Links</h4>
                <ul className="mt-3 space-y-2 text-gray-700">
                  <li><Link to="/product" className="hover:text-green-600">Products</Link></li>
                  <li><Link to="/shops" className="hover:text-green-600">Shops</Link></li>
                  <li><Link to="/about" className="hover:text-green-600">About us</Link></li>
                  <li><Link to="/contact" className="hover:text-green-600">Contact</Link></li>
                </ul>
              </div>



              {/* Follow us (only if at least one link) */}
              {availableSocial.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold">Follow us</h4>
                  <ul className="mt-3 space-y-2 text-gray-700">
                    {availableSocial.map(s => (
                      <li key={s.key}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-green-600">{s.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })()}
        

        <hr className="my-8 border-neutral-500" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-700 text-sm">
          <p>© {settings?.copyright_text || 'ant.com. All rights reserved.'}</p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-green-600">Terms & conditions</Link>
            <Link to="/privacy" className="hover:text-green-600">Privacy policy</Link>
          </div>
        </div>

        {/* Bengali credit line */}
        <div className="mt-3 w-full text-center text-black text-lg font-normal font-['Hind_Siliguri']">
       <a href="">{settings.footer_text} </a>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;