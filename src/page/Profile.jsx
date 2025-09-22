import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getCurrentUser, isAuthenticated, removeTokens } from '../utils/auth.js';
import { Api_Base_Url } from '../config/api.js';
import TradeTransaction from '../components/transaction/Tradetransaction.jsx';
import WalletTransaction from '../components/transaction/WalletTraansaction.jsx';
import CurrencyTransaction from '../components/transaction/CurrencyTransaction.jsx';
import Myorders from '../components/orders/Myorders';
import DonationTransaction from '../components/transaction/DonationTransaction.jsx';

export default function Profile() {
  const [user, setUser] = useState(null);           // Auth info (id, role, tokens)
  const [profile, setProfile] = useState(null);     // Fetched profile data from /auth/user/
  const [originalProfile, setOriginalProfile] = useState(null); // For diffing on save
  const [imgError, setImgError] = useState(false);  // Track profile image load failure
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

  const locationPresetRef = React.useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [removeImage, setRemoveImage] = useState(false); // Flag to remove existing profile image
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();
  // Change password state
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwShow1, setPwShow1] = useState(false);
  const [pwShow2, setPwShow2] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  // Transactions tab selection
  const [transactionTab, setTransactionTab] = useState('trade');
  // Donation states
  const [donationMode, setDonationMode] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [donating, setDonating] = useState(false);
  // Hold-to-confirm for donation
  const [showDonationHold, setShowDonationHold] = useState(false);
  const [donationHoldProgress, setDonationHoldProgress] = useState(0); // 0-100
  const [donationHoldStarted, setDonationHoldStarted] = useState(false); // track if we showed start toast
  const donationHoldTimerRef = React.useRef(null);
  const donationHoldStartRef = React.useRef(null);
  const DONATION_HOLD_DURATION = 2000; // ms
  const DONATION_PROGRESS_RADIUS = 54;
  const DONATION_CIRCUMFERENCE = 2 * Math.PI * DONATION_PROGRESS_RADIUS;

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
      setProfile(response.data);
      setOriginalProfile(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        reference_phone: response.data.reference_phone || response.data.referred_by_phone || response.data.referred_by_name || '',
        division: response.data.division || '',
        district: response.data.district || '',
        upazila: response.data.upazila || ''
      });
      localStorage.setItem('userProfile', JSON.stringify(response.data));
      
      // Set location preset data
      locationPresetRef.current = {
        division: response.data.division || '',
        district: response.data.district || '',
        upazila: response.data.upazila || ''
      };
    } catch (err) {
      console.error('[Profile.jsx] Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch divisions
  // const fetchDivisions = useCallback(async () => {
  //   try {
  //     setLoadingDivisions(true);
  //     const res = await axios.get(`${Api_Base_Url}/api/locations/divisions/`);
  //     setDivisions(res.data || []);
  //   } catch (err) {
  //     console.error('[Profile.jsx] Failed to load divisions', err);
  //     toast.error('Failed to load divisions');
  //   } finally {
  //     setLoadingDivisions(false);
  //   }
  // }, []);

  // Fetch upazilas for district id
  // const fetchUpazilas = useCallback(async (districtId, preselectName) => {
  //   if (!districtId) { setUpazilas([]); setSelectedUpazilaId(''); return; }
  //   try {
  //     setLoadingUpazilas(true);
  //     const res = await axios.get(`${Api_Base_Url}/api/locations/districts/${districtId}/upazilas/`);
  //     setUpazilas(res.data || []);
  //     if (preselectName) {
  //       const match = (res.data || []).find(u => u.name === preselectName);
  //       if (match) {
  //         setSelectedUpazilaId(match.id.toString());
  //         setFormData(prev => ({ ...prev, upazila: match.name }));
  //       }
  //     }
  //   } catch (err) {
  //     console.error('[Profile.jsx] Failed to load upazilas', err);
  //     toast.error('Failed to load upazilas');
  //   } finally {
  //     setLoadingUpazilas(false);
  //   }
  // }, []);

  // Fetch districts for division id
  // const fetchDistricts = useCallback(async (divisionId, preselectName) => {
  //   if (!divisionId) { setDistricts([]); setSelectedDistrictId(''); return; }
  //   try {
  //     setLoadingDistricts(true);
  //     const res = await axios.get(`${Api_Base_Url}/api/locations/divisions/${divisionId}/districts/`);
  //     setDistricts(res.data || []);
  //     if (preselectName) {
  //       const match = (res.data || []).find(d => d.name === preselectName);
  //       if (match) {
  //         setSelectedDistrictId(match.id.toString());
  //         setFormData(prev => ({ ...prev, district: match.name }));
  //         // Also fetch upazilas and preset if we have upazila data
  //         if (locationPresetRef.current && locationPresetRef.current.upazila) {
  //           fetchUpazilas(match.id.toString(), locationPresetRef.current.upazila);
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     console.error('[Profile.jsx] Failed to load districts', err);
  //     toast.error('Failed to load districts');
  //   } finally {
  //     setLoadingDistricts(false);
  //   }
  // }, [fetchUpazilas]);
  // useEffect(() => {
  //   fetchDivisions();
  // }, [fetchDivisions]);

  // Preset location dropdowns after divisions are loaded and profile data is available
  // useEffect(() => {
  //   if (divisions.length > 0 && locationPresetRef.current) {
  //     const locationData = locationPresetRef.current;
      
  //     // Find and set division
  //     if (locationData.division) {
  //       const divisionMatch = divisions.find(d => d.name === locationData.division);
  //       if (divisionMatch) {
  //         setSelectedDivisionId(divisionMatch.id.toString());
  //         // Fetch districts for this division and preset district
  //         fetchDistricts(divisionMatch.id.toString(), locationData.district);
  //       }
  //     }
      
  //     // Clear the preset data after use
  //     locationPresetRef.current = null;
  //   }
  // }, [divisions, fetchDistricts]);

  // When division changes manually by user
  // useEffect(() => {
  //   if (selectedDivisionId) {
  //     const divObj = divisions.find(d => d.id.toString() === selectedDivisionId);
  //     setFormData(prev => ({ ...prev, division: divObj ? divObj.name : '' , district: '', upazila: ''}));
  //     setSelectedDistrictId('');
  //     setSelectedUpazilaId('');
  //     setDistricts([]);
  //     setUpazilas([]);
  //     fetchDistricts(selectedDivisionId);
  //   }
  // }, [selectedDivisionId, divisions, fetchDistricts]);

  // When district changes manually by user
  // useEffect(() => {
  //   if (selectedDistrictId) {
  //     const distObj = districts.find(d => d.id.toString() === selectedDistrictId);
  //     setFormData(prev => ({ ...prev, district: distObj ? distObj.name : '', upazila: '' }));
  //     setSelectedUpazilaId('');
  //     setUpazilas([]);
  //     fetchUpazilas(selectedDistrictId);
  //   }
  // }, [selectedDistrictId, districts, fetchUpazilas]);

  // When upazila changes manually
  // useEffect(() => {
  //   if (selectedUpazilaId) {
  //     const upObj = upazilas.find(u => u.id.toString() === selectedUpazilaId);
  //     setFormData(prev => ({ ...prev, upazila: upObj ? upObj.name : '' }));
  //   }
  // }, [selectedUpazilaId, upazilas]);

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
        // Set profile location data for preset after divisions are loaded
        // locationPresetRef.current = {
        //   division: parsed.division || '',
        //   district: parsed.district || '',
        //   upazila: parsed.upazila || ''
        // };
        setLoading(false); // show cached immediately
  } catch { /* ignore */ }
    }
    // Always fetch fresh
    fetchProfile(authUser.accessToken);
  }, [navigate, fetchProfile]);

  // handleLogout retained in case needed elsewhere; removed unused reference to satisfy linter.

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
    if (activeSection !== 'account') {
      // Safety guard: do not allow selecting outside Account info
      toast.info('You can change photo only in Account info.');
      // Reset input value so the same file can be re-selected later
      if (e.target) e.target.value = '';
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    // Validate size (<= 1MB)
    const maxBytes = 1024 * 1024; // 1MB
    if (file.size > maxBytes) {
      toast.error('Image must be 1MB or less');
      if (e.target) e.target.value = '';
      return;
    }
    // Reset image error state when choosing a new file
    if (imgError) setImgError(false);
    if (removeImage) setRemoveImage(false); // selecting new image cancels removal
    setImageFile(file);
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
        if (removeImage && profile?.user_img) {
          // Allow proceeding to removal even if no other payload changes
        } else {
        toast.info('No changes to update');
        setSaving(false);
        return;
        }
      }


      let response;
      if (removeImage && profile?.user_img) {
        // Send null (assuming backend treats null as removal). If backend requires different field, adjust here.
        try {
          response = await axios.patch(`${Api_Base_Url}/auth/user/`, { user_img: null, ...payload }, {
            headers: {
              'Authorization': `Bearer ${user.accessToken}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (imgRemoveErr) {
          console.error('[Profile.jsx] Image removal failed:', imgRemoveErr);
          toast.error('Failed to remove image');
          throw imgRemoveErr;
        }
      } else if (hasImage) {
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
        response = await axios.patch(`${Api_Base_Url}/auth/user/`, payload, {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }

      toast.success('Profile updated successfully');
      
      // Update local state with response
      setProfile(response.data);
      setOriginalProfile(response.data);
      localStorage.setItem('userProfile', JSON.stringify(response.data));
      
      // Update formData to match response to ensure UI shows the saved values
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        reference_phone: response.data.reference_phone || response.data.referred_by_phone || '',
        division: response.data.division || '',
        district: response.data.district || '',
        upazila: response.data.upazila || ''
      });
      
      // Update location dropdown selections to match the saved data
      // if (response.data.division && divisions.length > 0) {
      //   const divMatch = divisions.find(d => d.name === response.data.division);
      //   if (divMatch) {
      //     setSelectedDivisionId(divMatch.id.toString());
      //   }
      // }
      // if (response.data.district && districts.length > 0) {
      //   const distMatch = districts.find(d => d.name === response.data.district);
      //   if (distMatch) {
      //     setSelectedDistrictId(distMatch.id.toString());

      //   }
      // }
      // if (response.data.upazila && upazilas.length > 0) {
      //   const upMatch = upazilas.find(u => u.name === response.data.upazila);
      //   if (upMatch) {
      //     setSelectedUpazilaId(upMatch.id.toString());
      //   }
      // }
      
      // Clear image selection
      setImageFile(null);
      setRemoveImage(false);
      
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

  const handleChangePassword = async () => {
    if (!user) { toast.error('Not authenticated'); return; }
    if (!pw1 || !pw2) { toast.error('Enter both password fields'); return; }
    if (pw1 !== pw2) { toast.error('Passwords do not match'); return; }
    setChangingPw(true);
    try {
      const res = await axios.post(`${Api_Base_Url}/auth/password/change/`, {
        new_password1: pw1,
        new_password2: pw2
      }, {
        headers: { 'Authorization': `Bearer ${user.accessToken}`, 'Content-Type': 'application/json' }
      });
      const msg = typeof res.data === 'string' ? res.data : (res.data?.detail || 'Password updated');
      toast.success(msg);
      setPw1('');
      setPw2('');
    } catch (err) {
      console.error('[Profile.jsx] Password change error:', err);
      let message = 'Failed to change password';
      const data = err.response?.data;
      if (data) {
        if (typeof data === 'string') message = data;
        else if (Array.isArray(data)) message = data.join(', ');
        else if (data.detail) message = data.detail;
        else message = Object.entries(data).map(([k,v]) => `${k}: ${Array.isArray(v)? v.join(', '): v}`).join('\n');
      }
      toast.error(message);
    } finally {
      setChangingPw(false);
    }
  };

  // Donation handlers
  const handleStartDonation = () => {
    setDonationMode(true);
    setDonationAmount('');
  };

  const handleCancelDonation = () => {
    if (donating) return; // prevent cancel while sending
    setDonationMode(false);
    setDonationAmount('');
  };

  const handleSubmitDonation = async () => {
    if (!user) { toast.error('Not authenticated'); return; }
    const amt = donationAmount.trim();
    if (!amt) { toast.error('Enter amount'); return; }
    if (!/^[0-9]+(\.[0-9]+)?$/.test(amt)) { toast.error('Invalid amount'); return; }
    if (parseFloat(amt) <= 0) { toast.error('Amount must be greater than 0'); return; }
    setDonating(true);
    try {
      await axios.post(`${Api_Base_Url}/api/donation/`, { amount: amt }, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      toast.success('Donation successful. Thank you!');
      // Refresh profile to update balance (if backend deducts from balance)
      fetchProfile(user.accessToken);
      setDonationMode(false);
      setDonationAmount('');
    } catch (err) {
      console.error('[Profile.jsx] Donation error:', err);
      let message = 'Donation failed';
      const data = err.response?.data;
      if (data) {
        if (typeof data === 'string') message = data;
        else if (data.detail) message = data.detail;
        else message = Object.entries(data).map(([k,v]) => `${k}: ${Array.isArray(v)? v.join(', '): v}`).join('\n');
      }
      toast.error(message);
    } finally {
      setDonating(false);
    }
  };

  // Donation hold overlay helpers
  const validateDonationAndOpenHold = () => {
    if (donating) return;
    if (!user) { toast.error('Not authenticated'); return; }
    const amt = donationAmount.trim();
    if (!amt) { toast.error('Enter amount'); return; }
    if (!/^[0-9]+(\.[0-9]+)?$/.test(amt)) { toast.error('Invalid amount'); return; }
    if (parseFloat(amt) <= 0) { toast.error('Amount must be greater than 0'); return; }
    setDonationHoldProgress(0);
    setShowDonationHold(true);
  };

  const startDonationHold = () => {
    if (donating) return;
    // Clear any existing timer
    if (donationHoldTimerRef.current) {
      clearInterval(donationHoldTimerRef.current);
      donationHoldTimerRef.current = null;
    }
    donationHoldStartRef.current = performance.now();
    setDonationHoldProgress(0);
    if (!donationHoldStarted) {
      toast.info('Keep holding to confirm donation...');
      setDonationHoldStarted(true);
    }
    donationHoldTimerRef.current = setInterval(() => {
      const now = performance.now();
      const elapsed = now - (donationHoldStartRef.current || now);
      const p = Math.min(100, Math.round((elapsed / DONATION_HOLD_DURATION) * 100));
      setDonationHoldProgress(p);
      if (p >= 100) {
        clearInterval(donationHoldTimerRef.current);
        donationHoldTimerRef.current = null;
        donationHoldStartRef.current = null;
        setTimeout(() => {
          // Subtle vibration feedback on supported mobile devices
          try {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate(60); // 60ms light buzz
            }
          } catch {/* ignore vibration errors */}
          setShowDonationHold(false);
          handleSubmitDonation();
          setDonationHoldProgress(0);
          setDonationHoldStarted(false);
        }, 120);
      }
    }, 30);
  };

  const cancelDonationHold = () => {
    if (donationHoldTimerRef.current) {
      clearInterval(donationHoldTimerRef.current);
      donationHoldTimerRef.current = null;
    }
    donationHoldStartRef.current = null;
    if (donationHoldProgress > 0 && donationHoldProgress < 100 && donationHoldStarted) {
      toast.info('Donation hold cancelled');
    }
    setDonationHoldProgress(0);
    setDonationHoldStarted(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (donationHoldTimerRef.current) cancelAnimationFrame(donationHoldTimerRef.current);
    };
  }, []);

  const sidebarItems = [
    { id: 'account', label: 'Account info', icon: '👤' },
    { id: 'transactions', label: 'Transaction History', icon: '💳' },
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
    <section className="min-h-[80vh] py-4 md:py-8 px-4 md:px-6 bg-stone-100">
      <div className="max-w-[1360px] mx-auto">
        <div className="bg-stone-100 rounded-[10px] p-0 md:p-8">
          {/* Responsive container: stack on mobile, side-by-side on md+ */}
          <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-72 w-full md:min-h-[640px] bg-neutral-50 rounded-xl p-5 flex flex-col">

            <div className='flex flex-row md:flex-col md:items-center gap-4 md:gap-3 '>
            <div className="relative group mb-4">
              <div className="w-32 h-32 md:w-full md:h-auto aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 mx-auto md:mx-0">
                {profile?.user_img && !imgError ? (
                  <img
                    className="w-full h-full object-cover"
                    src={profile.user_img}
                    alt="Profile"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <img src="/pfp.png" alt="" />

                )}
                <button
                  type="button"
                  onClick={() => {
                    if (activeSection !== 'account') {
                      toast.info('You can change photo only in Account info.');
                      return;
                    }
                    fileInputRef.current?.click();
                  }}
                  className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-medium transition-opacity ${activeSection !== 'account' ? 'cursor-not-allowed' : ''}`}
                  style={{ pointerEvents: 'none' }}
                  aria-hidden="true"
                >
                  {/* Overlay purely visual now; click handled by container below */}
                  {uploadingImage
                    ? 'Uploading...'
                    : (activeSection === 'account' ? 'Change Photo' : 'Go to Account info to change')}
                </button>
                {/* Click target (transparent) to open file dialog */}
                <div
                  onClick={() => {
                    if (activeSection !== 'account') {
                      toast.info('You can change photo only in Account info.');
                      return;
                    }
                    if (!uploadingImage) fileInputRef.current?.click();
                  }}
                  className="absolute inset-0 z-10"
                  style={{ background: 'transparent' }}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
              {imageFile && activeSection === 'account' && (
                <p className="text-xs text-green-600 mt-1 text-center">New image selected (will save on update)</p>
              )}
              {!imageFile && profile?.user_img && activeSection === 'account' && !removeImage && (
                <div className="mt-2 flex justify-center relative z-20">
                  <button
                    type="button"
                    onClick={() => setRemoveImage(true)}
                    className="text-[11px] px-2 py-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition"
                  >Remove Image</button>
                </div>
              )}
              {removeImage && activeSection === 'account' && (
                <div className="mt-2 flex flex-col items-center gap-1 relative z-20">
                  <p className="text-[10px] text-red-600">Image will be removed on save.</p>
                  <button
                    type="button"
                    onClick={() => setRemoveImage(false)}
                    className="text-[11px] px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition"
                  >Undo</button>
                </div>
              )}
            </div>
            <div>
            <div className="mb-1 text-black text-lg font-bold leading-tight truncate text-center md:text-left">{profile?.name || 'User'}</div>
            <div className="text-stone-700 text-sm mb-1 text-center md:text-left">{user?.role ? user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Customer'}</div>
            <div className="text-stone-500 text-xs mb-4 text-center md:text-left">{profile?.phone || formData.phone}</div>

            </div>
            </div>

            <div className="flex flex-row md:flex-col gap-1 mt-2 flex-1 overflow-x-auto md:overflow-visible no-scrollbar">
              {sidebarItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`min-w-[90px] md:min-w-full text-left px-2 py-2 rounded-lg text-xs md:text-sm font-medium transition flex items-center justify-between md:justify-between ${activeSection === item.id ? 'bg-green-600 text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs">›</span>
                </button>
              ))}
            </div>

          </div>

          {/* Main Content Area */}
          <div className="flex-1 md:mt-0 mt-2 md:pr-6">
            {activeSection === 'account' && (
              <>
                {/* Page Title */}
                <div className="flex items-start justify-between mb-10">
                  <div className="text-black text-2xl font-bold font-['Inter'] capitalize leading-7">Account info</div>
                  <div className="bg-white border border-green-100 shadow-sm rounded-xl px-4 py-3 flex flex-col items-stretch min-w-[190px] relative overflow-hidden">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs uppercase tracking-wide text-gray-500">Balance</span>
                      {!donationMode && (
                        <button
                          type="button"
                          onClick={handleStartDonation}
                          className="text-[10px] px-2 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 transition md:text-xs"
                        >Donate</button>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-green-600 flex items-center gap-1 mt-1">৳{profile?.balance || '0.00'}</div>
                    {donationMode && (
                      <div className="mt-3 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="1"
                            placeholder="Amount"
                            value={donationAmount}
                            onChange={(e)=> setDonationAmount(e.target.value)}
                            className="w-full h-9 px-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={validateDonationAndOpenHold}
                            disabled={donating}
                            className={`flex-1 h-9 rounded-md font-semibold text-white ${donating ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} transition`}
                          >{donating ? 'Sending...' : 'Send'}</button>
                          <button
                            type="button"
                            onClick={handleCancelDonation}
                            disabled={donating}
                            className="h-9 px-3 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center"
                          >Cancel</button>
                        </div>
                      </div>
                    )}
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
                    <span className="text-xs text-neutral-500">You can't update this</span>
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

                {/* Reference Code (one-time) - Only show for non-shop owners */}
                {/* {user?.role !== 'shop_owner' && ( */}
                  <div className="mb-8">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-black text-sm font-normal font-['Inter'] leading-tight">Reference Phone</span>
                      { (originalProfile?.reference_phone || originalProfile?.referred_by_phone) ? (
                        <span className="text-xs text-neutral-500">Set (locked)</span>
                      ) : (
                        <span className="text-xs text-neutral-500">Can be set only once</span>
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
                {/* )} */}

                {/* Location Fields with dynamic selects */}
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"> */}
                  {/* Division */}
                  {/* <div className="flex flex-col">
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
                  </div> */}
                  {/* District */}
                  {/* <div className="flex flex-col">
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
                  </div> */}
                  {/* Upazila */}
                  {/* <div className="flex flex-col">
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
                </div> */}

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
                      onClick={() => { setImageFile(null); }}
                      className="text-xs text-red-600 hover:underline"
                    >Remove new image</button>
                  )}
                </div>
              </>
            )}



            {activeSection === 'transactions' && (
              <>
                <div className="text-black text-2xl font-bold font-['Inter'] capitalize leading-7 mb-6">
                  My History
                </div>
                <div className="mb-4 overflow-x-auto">
                  <div className="inline-flex whitespace-nowrap rounded-lg border border-gray-200 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setTransactionTab('trade')}
                      className={`px-4 py-2 text-sm font-medium transition ${transactionTab==='trade' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                    >Buying</button>
                    <button
                      type="button"
                      onClick={() => setTransactionTab('wallet')}
                      className={`px-4 py-2 text-sm font-medium transition border-l border-gray-200 ${transactionTab==='wallet' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                    >Bonus </button>
                    <button
                      type="button"
                      onClick={() => setTransactionTab('currency')}
                      className={`px-4 py-2 text-sm font-medium transition border-l border-gray-200 ${transactionTab==='currency' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                    >Transaction </button>
                    <button
                      type="button"
                      onClick={() => setTransactionTab('donation')}
                      className={`px-4 py-2 text-sm font-medium transition border-l border-gray-200 ${transactionTab==='donation' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                    >Donation</button>
                  </div>
                </div>
                {transactionTab === 'trade' && (
                  <TradeTransaction token={user?.accessToken} />
                )}
                {transactionTab === 'wallet' && (
                  <WalletTransaction token={user?.accessToken} />
                )}
                {transactionTab === 'currency' && (
                  <CurrencyTransaction token={user?.accessToken} />
                )}
                {transactionTab === 'donation' && (
                  <DonationTransaction token={user?.accessToken} />
                )}
              </>
            )}

            {activeSection === 'password' && (
              <div>
                <div className="text-black text-2xl font-bold font-['Inter'] capitalize leading-7 mb-6">
                  Change Password
                  <p className="text-gray-600 text-base font-normal mt-2">Update your account password here.</p>
                </div>

                <div className="max-w-lg bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  {/* New Password */}
                  <div className="mb-5">
                    <label className="mb-1 block text-black text-sm font-normal">New password</label>
                    <div className="relative">
                      <input
                        type={pwShow1 ? 'text' : 'password'}
                        value={pw1}
                        onChange={(e) => setPw1(e.target.value)}
                        className="w-full h-11 px-3 pr-20 bg-white rounded-md border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setPwShow1((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                      >{pwShow1 ? 'Hide' : 'Show'}</button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-5">
                    <label className="mb-1 block text-black text-sm font-normal">Confirm new password</label>
                    <div className="relative">
                      <input
                        type={pwShow2 ? 'text' : 'password'}
                        value={pw2}
                        onChange={(e) => setPw2(e.target.value)}
                        className="w-full h-11 px-3 pr-20 bg-white rounded-md border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Re-enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setPwShow2((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                      >{pwShow2 ? 'Hide' : 'Show'}</button>
                    </div>
                    {pw1 && pw2 && pw1 !== pw2 && (
                      <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPw || !pw1 || !pw2 || pw1 !== pw2}
                      className={`h-11 px-6 rounded-lg text-white text-sm font-semibold transition ${changingPw || !pw1 || !pw2 || pw1 !== pw2 ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >{changingPw ? 'Updating...' : 'Update Password'}</button>
                    <button
                      type="button"
                      onClick={() => { setPw1(''); setPw2(''); }}
                      className="h-11 px-4 rounded-lg border text-sm bg-white hover:bg-gray-50"
                    >Clear</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
          {/* Legacy absolute logout removed (moved into sidebar) */}
          </div>
      </div>

        {/* Donation Hold-to-confirm overlay */}
        {showDonationHold && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
              <div className="bg-white rounded-2xl p-6 text-center relative shadow-xl">
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => { cancelDonationHold(); setShowDonationHold(false); }}
                  className="absolute right-3 top-3 p-2 rounded-full text-gray-500 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Hold to Confirm</h3>
                <p className="text-xs text-gray-500 mb-4">Donate ৳{donationAmount || '0'} to ANT Foundation</p>
                <div className="text-sm font-medium mb-4">Amount: <span className="text-green-600 font-semibold">৳{donationAmount || '0'}</span></div>
                <div
                  className="mx-auto relative w-40 h-40 select-none"
                  onPointerDown={(e) => { e.preventDefault(); startDonationHold(); }}
                  onPointerUp={cancelDonationHold}
                  onPointerLeave={cancelDonationHold}
                >
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" stroke="#E5E7EB" strokeWidth="10" fill="none" />
                    <circle
                      cx="60" cy="60" r="54"
                      stroke="#10B981" strokeWidth="10" fill="none" strokeLinecap="round"
                      style={{
                        strokeDasharray: DONATION_CIRCUMFERENCE,
                        strokeDashoffset: DONATION_CIRCUMFERENCE - (donationHoldProgress / 100) * DONATION_CIRCUMFERENCE,
                        transition: 'stroke-dashoffset 30ms linear'
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 11.5c2.5 0 3.5 2 3.5 4.5M8 11c1-1.5 2.5-2 4-2s3 .5 4 2M6.5 9.5c1.5-2 3.5-3 5.5-3s4 .8 5.5 3M5 8c2-3 4.5-4 7-4s5 1 7 4M9.5 13.5c.5 1 .5 2 .5 3M12 13c1 1.5 1 3 1 4.5" />
                    </svg>
                  </div>
                  <div className="absolute bottom-3 inset-x-0 text-[11px] text-gray-500">
                    {donationHoldProgress < 100 ? `Hold ${Math.ceil((DONATION_HOLD_DURATION * (1 - donationHoldProgress / 100)) / 1000)}s` : 'Release'}
                  </div>
                </div>
                <div className="mt-4 text-[11px] text-gray-500">Keep holding until the circle completes</div>
              </div>
            </div>
          </div>
        )}
    </section>
  );
}

// Donation Hold-to-confirm overlay
// Placed after component for clarity if future extraction desired
