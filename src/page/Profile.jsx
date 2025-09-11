import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getCurrentUser, isAuthenticated, removeTokens } from '../utils/auth.js';
import { Api_Base_Url } from '../config/api.js';

export default function Profile() {
  const [user, setUser] = useState(null);           // Auth info (id, role, tokens)
  const [profile, setProfile] = useState(null);     // Fetched profile data from /auth/user/
  const [originalProfile, setOriginalProfile] = useState(null); // For diffing on save
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '', // read-only
    reference_phone: '',
    division: '',
    district: '',
    upazila: ''
  });
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingUpazilas, setLoadingUpazilas] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedUpazilaId, setSelectedUpazilaId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();

  // Trade transactions state & logic
  const [tradeTx, setTradeTx] = useState([]);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [tradePage, setTradePage] = useState(1);
  const [tradeNext, setTradeNext] = useState(null);
  const [tradeCount, setTradeCount] = useState(0);

  const fetchTradeTransactions = useCallback(async ({ reset=false } = {}) => {
    if (!user?.accessToken) return;
    try {
      setTradeError('');
      setTradeLoading(true);
      const url = `${Api_Base_Url}/api/trade-transactions/?page=${tradePage}`;
      const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${user.accessToken}`, 'Accept': 'application/json' } });
  const { results = [], next = null, /* previous unused */ count = 0 } = res.data || {};
      setTradeCount(count);
      setTradeNext(next);
      setTradeTx(prev => reset ? results : [...prev, ...results]);
    } catch (err) {
      console.error('[Profile.jsx] Failed to fetch trade transactions', err);
      setTradeError('Failed to load trade transactions');
    } finally {
      setTradeLoading(false);
    }
  }, [user?.accessToken, tradePage]);

  useEffect(() => {
    if (activeSection === 'transactions') {
      fetchTradeTransactions({ reset: tradePage === 1 });
    }
  }, [activeSection, tradePage, fetchTradeTransactions]);

  const handleLoadMoreTrade = () => { if (tradeNext && !tradeLoading) setTradePage(p => p + 1); };
  const handleRefreshTrade = () => { setTradePage(1); setTradeTx([]); fetchTradeTransactions({ reset: true }); };

  // Fetch profile from backend

  const fetchProfile = useCallback(async (accessToken) => {
    try {
      setError('');
      const response = await axios.get(`${Api_Base_Url}/auth/user/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      console.log('[Profile.jsx] Fetched profile:', response.data);
      setProfile(response.data);
      setOriginalProfile(response.data);
      // Initialize form state
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        reference_phone: response.data.reference_phone || response.data.referred_by_phone || response.data.referred_by_name || '',
        division: response.data.division || '',
        district: response.data.district || '',
        upazila: response.data.upazila || ''
      });
    // Location preselection now handled by chained effects once lists load
      localStorage.setItem('userProfile', JSON.stringify(response.data));
    } catch (err) {
      console.error('[Profile.jsx] Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch divisions
  const fetchDivisions = useCallback(async () => {
    try {
      setLoadingDivisions(true);
      const res = await axios.get(`${Api_Base_Url}/api/locations/divisions/`);
      setDivisions(res.data || []);
    } catch (err) {
      console.error('[Profile.jsx] Failed to load divisions', err);
      toast.error('Failed to load divisions');
    } finally {
      setLoadingDivisions(false);
    }
  }, []);

  // Fetch districts for division id
  const fetchDistricts = useCallback(async (divisionId, preselectName) => {
    if (!divisionId) { setDistricts([]); setSelectedDistrictId(''); return; }
    try {
      setLoadingDistricts(true);
      const res = await axios.get(`${Api_Base_Url}/api/locations/divisions/${divisionId}/districts/`);
      setDistricts(res.data || []);
      if (preselectName) {
        const match = (res.data || []).find(d => d.name === preselectName);
        if (match) {
          setSelectedDistrictId(match.id.toString());
          setFormData(prev => ({ ...prev, district: match.name }));
    // Upazila preselect deferred to effect
        }
      }
    } catch (err) {
      console.error('[Profile.jsx] Failed to load districts', err);
      toast.error('Failed to load districts');
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  // Fetch upazilas for district id
  const fetchUpazilas = useCallback(async (districtId, preselectName) => {
    if (!districtId) { setUpazilas([]); setSelectedUpazilaId(''); return; }
    try {
      setLoadingUpazilas(true);
      const res = await axios.get(`${Api_Base_Url}/api/locations/districts/${districtId}/upazilas/`);
      setUpazilas(res.data || []);
      if (preselectName) {
        const match = (res.data || []).find(u => u.name === preselectName);
        if (match) {
          setSelectedUpazilaId(match.id.toString());
          setFormData(prev => ({ ...prev, upazila: match.name }));
        }
      }
    } catch (err) {
      console.error('[Profile.jsx] Failed to load upazilas', err);
      toast.error('Failed to load upazilas');
    } finally {
      setLoadingUpazilas(false);
    }
  }, []);

  // Preselect division after both profile and divisions load (first render or refetch)
  useEffect(() => {
    if (!profile?.division || !divisions.length) return;
    if (selectedDivisionId) return; // already selected (user changed or preselected)
    const divisionMatch = divisions.find(d => d.name === profile.division);
    if (divisionMatch) {
      setSelectedDivisionId(divisionMatch.id.toString());
      setFormData(prev => ({ ...prev, division: divisionMatch.name }));
      // Fetch districts with intention to preselect
      fetchDistricts(divisionMatch.id, profile.district);
    }
  }, [profile, divisions, selectedDivisionId, fetchDistricts]);

  // Preselect district after districts load
  useEffect(() => {
    if (!profile?.district || !districts.length) return;
    if (selectedDistrictId) return;
    const distMatch = districts.find(d => d.name === profile.district);
    if (distMatch) {
      setSelectedDistrictId(distMatch.id.toString());
      setFormData(prev => ({ ...prev, district: distMatch.name }));
      fetchUpazilas(distMatch.id, profile.upazila);
    }
  }, [profile, districts, selectedDistrictId, fetchUpazilas]);

  // Preselect upazila after upazilas load
  useEffect(() => {
    if (!profile?.upazila || !upazilas.length) return;
    if (selectedUpazilaId) return;
    const upMatch = upazilas.find(u => u.name === profile.upazila);
    if (upMatch) {
      setSelectedUpazilaId(upMatch.id.toString());
      setFormData(prev => ({ ...prev, upazila: upMatch.name }));
    }
  }, [profile, upazilas, selectedUpazilaId]);

  // Initial divisions load
  useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

  // When division changes manually by user
  useEffect(() => {
    if (selectedDivisionId) {
      const divObj = divisions.find(d => d.id.toString() === selectedDivisionId);
      setFormData(prev => ({ ...prev, division: divObj ? divObj.name : '' , district: '', upazila: ''}));
      setSelectedDistrictId('');
      setSelectedUpazilaId('');
      setDistricts([]);
      setUpazilas([]);
      fetchDistricts(selectedDivisionId);
    }
  }, [selectedDivisionId, divisions, fetchDistricts]);

  // When district changes manually by user
  useEffect(() => {
    if (selectedDistrictId) {
      const distObj = districts.find(d => d.id.toString() === selectedDistrictId);
      setFormData(prev => ({ ...prev, district: distObj ? distObj.name : '', upazila: '' }));
      setSelectedUpazilaId('');
      setUpazilas([]);
      fetchUpazilas(selectedDistrictId);
    }
  }, [selectedDistrictId, districts, fetchUpazilas]);

  // When upazila changes manually
  useEffect(() => {
    if (selectedUpazilaId) {
      const upObj = upazilas.find(u => u.id.toString() === selectedUpazilaId);
      setFormData(prev => ({ ...prev, upazila: upObj ? upObj.name : '' }));
    }
  }, [selectedUpazilaId, upazilas]);

  useEffect(() => {
    if (!isAuthenticated()) {
      removeTokens();
      navigate('/auth');
      return;
    }
    const authUser = getCurrentUser();
    if (!authUser) {
      removeTokens();
      navigate('/auth');
      return;
    }
    setUser(authUser);
    // Try cached profile first for quick paint
    const cached = localStorage.getItem('userProfile');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProfile(parsed);
        setOriginalProfile(parsed);
        setFormData(prev => ({
          ...prev,
            name: parsed.name || '',
            email: parsed.email || '',
            phone: parsed.phone || '',
            reference_phone: parsed.reference_phone || parsed.referred_by_phone || '',
            division: parsed.division || '',
            district: parsed.district || '',
            upazila: parsed.upazila || ''
        }));
        setLoading(false); // show cached immediately
  } catch { /* ignore */ }
    }
    // Always fetch fresh
    fetchProfile(authUser.accessToken);
  }, [navigate, fetchProfile]);

  const handleLogout = () => {
    setUser(null);
    removeTokens();
    window.dispatchEvent(new CustomEvent('userStatusChanged'));
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Prevent editing phone directly (read-only)
    if (name === 'phone') return;
    // Prevent editing reference_phone if already set originally
    if (name === 'reference_phone' && (originalProfile?.reference_phone || originalProfile?.referred_by_phone)) {
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Determine changed fields (allowed patchable)
      const patchable = ['name', 'email', 'reference_phone', 'division', 'district', 'upazila'];
      const payload = {};
      patchable.forEach(field => {
        const originalVal = originalProfile?.[field] || '';
        const newVal = formData[field] || '';
        // Only include if changed and not empty OR changed from value to empty explicitly
        if (newVal !== originalVal) {
          // Enforce one-time reference_phone update
          if (field === 'reference_phone' && (originalProfile?.reference_phone || originalProfile?.referred_by_phone)) {
            return; // skip if already set
          }
          if (field === 'reference_phone' && newVal.trim() === '') return; // don't send empty refer code
          payload[field] = newVal;
        }
      });

      const hasImage = !!imageFile;
      if (Object.keys(payload).length === 0 && !hasImage) {
        toast.info('No changes to update');
        setSaving(false);
        return;
      }

      let response;
      if (hasImage) {
        // Attempt multipart PATCH (backend may reject if user_img read-only)
        const form = new FormData();
        Object.entries(payload).forEach(([k,v]) => form.append(k, v));
        form.append('user_img', imageFile);
        setUploadingImage(true);
        try {
          response = await axios.patch(`${Api_Base_Url}/auth/user/`, form, {
            headers: {
              'Authorization': `Bearer ${user.accessToken}`,
              'Content-Type': 'multipart/form-data'
            }
          });
        } catch (imgErr) {
          console.warn('[Profile.jsx] Image upload failed, retrying without image', imgErr);
          toast.warning('Image not updated (read-only). Saving other changes.');
          // Fallback to json without image
          if (Object.keys(payload).length === 0) throw imgErr; // nothing else to save
          response = await axios.patch(`${Api_Base_Url}/auth/user/`, payload, {
            headers: {
              'Authorization': `Bearer ${user.accessToken}`,
              'Content-Type': 'application/json'
            }
          });
        } finally {
          setUploadingImage(false);
        }
      } else {
        console.log('[Profile.jsx] PATCH payload:', payload);
        response = await axios.patch(`${Api_Base_Url}/auth/user/`, payload, {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }

      toast.success('Profile updated');
      setProfile(response.data);
      setOriginalProfile(response.data);
      localStorage.setItem('userProfile', JSON.stringify(response.data));
      // Merge auth user display info if name/email changed
      if (payload.name || payload.email) {
        const updatedAuthUser = { ...user };
        if (payload.name) updatedAuthUser.name = payload.name;
        if (payload.email) updatedAuthUser.email = payload.email;
        setUser(updatedAuthUser);
        window.dispatchEvent(new CustomEvent('userStatusChanged'));
      }
    } catch (err) {
      console.error('[Profile.jsx] PATCH error:', err);
      let message = 'Update failed';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') message = err.response.data;
        else if (err.response.data.detail) message = err.response.data.detail;
        else message = Object.entries(err.response.data).map(([k,v]) => `${k}: ${Array.isArray(v)? v.join(', '): v}`).join('\n');
      }
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const sidebarItems = [
    { id: 'account', label: 'Account info', icon: '👤' },
    { id: 'orders', label: 'My order', icon: '📦' },
    { id: 'transactions', label: 'My transaction', icon: '💳' },
    { id: 'password', label: 'Change password', icon: '🔒' }
  ];

  if (loading) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center p-4 md:p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </section>
    );
  }

  if (error && !profile) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center p-4 md:p-6">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => { if (user) fetchProfile(user.accessToken); }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >Retry</button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[80vh] py-8 px-4 md:px-6 bg-stone-100">
      <div className="max-w-[1360px] mx-auto">
        <div className="bg-stone-100 rounded-[10px] p-8 min-h-[863px] relative">
          
          {/* Sidebar revamped */}
          <div className="w-72 min-h-[640px] absolute left-[30px] top-[20px] bg-neutral-50 rounded-xl p-5 flex flex-col">
            <div className="relative group mb-4">
              <div className="w-full aspect-[214/220] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200">
                <img
                  className="w-full h-full object-cover"
                  src={imagePreview || profile?.user_img || 'https://placehold.co/214x220'}
                  alt="Profile"
                  onError={(e) => { e.target.src = 'https://placehold.co/214x220'; }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-medium transition-opacity"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Uploading...' : 'Change Photo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
              {imageFile && (
                <p className="text-xs text-green-600 mt-1">New image selected (will save on update)</p>
              )}
            </div>
            <div className="mb-1 text-black text-lg font-bold leading-tight truncate">{profile?.name || 'User'}</div>
            <div className="text-stone-500 text-sm mb-1">{user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : 'Customer'}</div>
            <div className="text-stone-500 text-xs mb-4">{profile?.phone || formData.phone}</div>
            <div className="flex flex-col gap-1 mt-2 flex-1">
              {sidebarItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition flex items-center justify-between ${activeSection === item.id ? 'bg-green-600 text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs">›</span>
                </button>
              ))}
            </div>
            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" /></svg>
                Logout
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="ml-[350px] mt-[20px] pr-6">
            {activeSection === 'account' && (
              <>
                {/* Page Title */}
                <div className="flex items-start justify-between mb-10">
                  <div className="text-black text-2xl font-bold font-['Inter'] capitalize leading-7">Account info</div>
                  <div className="bg-white border border-green-100 shadow-sm rounded-xl px-5 py-3 flex flex-col items-start min-w-[170px] relative overflow-hidden">
                    <span className="text-xs uppercase tracking-wide text-gray-500 mb-1">Balance</span>
                    <div className="text-2xl font-bold text-green-600 flex items-center gap-1">৳{profile?.balance || '0.00'}</div>
                  </div>
                </div>

                {/* Name */}
                <div className="mb-8">
                  <div className="mb-4">
                    <span className="text-black text-sm font-normal font-['Inter'] leading-tight">Full Name </span>
                  </div>
                  <div className="w-full h-11 bg-white rounded-md border border-stone-300">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full h-full px-3 bg-transparent text-neutral-800 text-sm font-normal font-['Inter'] leading-tight focus:outline-none rounded-md"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="mb-8">
                  <div className="mb-1 flex items-center justify-between">
                    <div>
                      <span className="text-black text-sm font-normal font-['Inter'] leading-tight">Email Address </span>
                    </div>
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

                {/* Phone (read-only) */}
                <div className="mb-8">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-black text-sm font-normal font-['Inter'] leading-tight">Phone Number</span>
                    <span className="text-xs text-red-500">You can't update this</span>
                  </div>
                  <div className="w-full h-11 bg-gray-50 rounded-md border border-stone-300">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      disabled
                      className="w-full h-full px-3 bg-transparent text-neutral-500 text-sm font-normal font-['Inter'] leading-tight focus:outline-none rounded-md cursor-not-allowed"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                {/* Reference Code (one-time) */}
                <div className="mb-8">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-black text-sm font-normal font-['Inter'] leading-tight">Reference Phone</span>
                    { (originalProfile?.reference_phone || originalProfile?.referred_by_phone) ? (
                      <span className="text-xs text-green-600">Set (locked)</span>
                    ) : (
                      <span className="text-xs text-orange-600">Can be set only once</span>
                    ) }
                  </div>
                  <div className={`w-full h-11 rounded-md border ${ (originalProfile?.reference_phone || originalProfile?.referred_by_phone) ? 'bg-gray-50 border-stone-300' : 'bg-white border-stone-300' }`}>
                    <input
                      type="text"
                      name="reference_phone"
                      value={formData.reference_phone}
                      onChange={handleInputChange}
                      disabled={Boolean(originalProfile?.reference_phone || originalProfile?.referred_by_phone)}
                      className={`w-full h-full px-3 bg-transparent text-sm font-normal font-['Inter'] leading-tight focus:outline-none rounded-md ${(originalProfile?.reference_phone || originalProfile?.referred_by_phone) ? 'text-neutral-500 cursor-not-allowed' : 'text-neutral-800'}`}
                      placeholder="Enter referral phone"
                    />
                  </div>
                </div>

                {/* Location Fields with dynamic selects */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {/* Division */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-black text-sm font-normal">Division</label>
                    <select
                      value={selectedDivisionId}
                      onChange={(e) => setSelectedDivisionId(e.target.value)}
                      className="w-full h-11 px-3 bg-white rounded-md border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Division</option>
                      {loadingDivisions && <option value="" disabled>Loading...</option>}
                      {divisions.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* District */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-black text-sm font-normal">District</label>
                    <select
                      value={selectedDistrictId}
                      onChange={(e) => setSelectedDistrictId(e.target.value)}
                      disabled={!selectedDivisionId || loadingDistricts}
                      className="w-full h-11 px-3 bg-white rounded-md border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                      <option value="">{loadingDistricts ? 'Loading...' : 'Select District'}</option>
                      {districts.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Upazila */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-black text-sm font-normal">Upazila</label>
                    <select
                      value={selectedUpazilaId}
                      onChange={(e) => setSelectedUpazilaId(e.target.value)}
                      disabled={!selectedDistrictId || loadingUpazilas}
                      className="w-full h-11 px-3 bg-white rounded-md border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                      <option value="">{loadingUpazilas ? 'Loading...' : 'Select Upazila'}</option>
                      {upazilas.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                  <button
                    disabled={saving}
                    onClick={handleSave}
                    className={`w-44 h-12 rounded-[10px] flex items-center justify-center text-white text-xs font-semibold font-['Inter'] uppercase leading-none transition ${saving ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 cursor-pointer'}`}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {imageFile && (
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="text-xs text-red-600 hover:underline"
                    >Remove new image</button>
                  )}
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
                {/* Trade Transactions Dynamic List */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-green-600 text-white text-xs font-medium">Trade</span>
                      <span className="text-gray-500 font-normal">Transactions</span>
                    </h4>
                    <div className="flex items-center gap-2">
                      <button onClick={handleRefreshTrade} className="text-xs px-3 py-1 rounded bg-white border border-gray-200 hover:bg-gray-50">Refresh</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {tradeError && (
                      <div className="p-3 rounded bg-red-50 text-red-600 text-sm flex items-start justify-between">
                        <span>{tradeError}</span>
                        <button onClick={handleRefreshTrade} className="underline ml-2">Retry</button>
                      </div>
                    )}
                    {!tradeError && (
                      <div className="text-xs text-gray-500">Total: {tradeCount}</div>
                    )}
                    {tradeTx.map((tx, idx) => {
                      const productName = tx.product_display?.split('|')?.[0]?.trim() || tx.product_display;
                      return (
                        <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col gap-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800">{productName}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase tracking-wide">{tx.type || 'Trade'}</span>
                          </div>
                          <div className="text-gray-500 text-xs leading-snug">{tx.product_display}</div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                            <span>Qty: <strong className="text-gray-800">{tx.quantity}</strong></span>
                            <span>Total: <strong className="text-gray-800">৳{tx.total_amount}</strong></span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                            {tx.buyer_number && <span>Buyer: {tx.buyer_number}</span>}
                            {tx.seller_number && <span>Seller: {tx.seller_number}</span>}
                          </div>
                          <div className="text-[11px] text-gray-400 flex items-center justify-between">
                            <span>{tx.created_at}</span>
                            {tx.shop_display && <span className="truncate max-w-[50%] text-right">{tx.shop_display}</span>}
                          </div>
                        </div>
                      );
                    })}
                    {!tradeLoading && tradeTx.length === 0 && !tradeError && (
                      <div className="text-center py-10 text-sm text-gray-500 bg-white rounded-lg border border-dashed">No trade transactions found.</div>
                    )}
                    {tradeLoading && (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-lg p-4 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                            <div className="h-3 bg-gray-100 rounded w-5/6" />
                            <div className="h-3 bg-gray-100 rounded w-2/3" />
                          </div>
                        ))}
                      </div>
                    )}
                    {tradeNext && !tradeLoading && (
                      <button onClick={handleLoadMoreTrade} className="w-full mt-2 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Load More</button>
                    )}
                  </div>
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

          {/* Legacy absolute logout removed (moved into sidebar) */}
        </div>
      </div>
    </section>
  );
}
