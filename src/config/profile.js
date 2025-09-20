import axios from 'axios';
import { Api_Base_Url } from './api.js';
import { getCurrentUser } from '../utils/auth.js';

// Return cached copy (in-memory) to avoid unnecessary re-parses
let _cachedProfile = null;
let _pending = null; // promise to dedupe concurrent calls

// Get cached (memory or localStorage)
export const getCachedUserProfile = () => {
  if (_cachedProfile) return _cachedProfile;
  try {
    const stored = localStorage.getItem('userProfile');
    if (stored) {
      _cachedProfile = JSON.parse(stored);
      return _cachedProfile;
    }
  } catch {
    // ignore
  }
  return null;
};

// Fetch fresh user profile data from API (always network unless already inflight)
export const fetchUserProfile = async () => {
  // Deduplicate in-flight request
  if (_pending) return _pending;
  const user = getCurrentUser();
  if (!user || !user.accessToken) return null;
  _pending = axios
    .get(`${Api_Base_Url}/auth/user/`, {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        Accept: 'application/json'
      }
    })
    .then(res => {
      _cachedProfile = res.data;
      try { localStorage.setItem('userProfile', JSON.stringify(res.data)); } catch { /* ignore storage quota */ }
      return _cachedProfile;
    })
    .catch(err => {
      console.error('[profile.js] fetchUserProfile error:', err);
      return null;
    })
    .finally(() => { _pending = null; });
  return _pending;
};

// Convenience: ensure we have some profile (cached or fetch)
export const ensureUserProfile = async () => {
  const cached = getCachedUserProfile();
  if (cached) return cached;
  return await fetchUserProfile();
};

export const clearUserProfileCache = () => {
  _cachedProfile = null;
  try { localStorage.removeItem('userProfile'); } catch { /* ignore */ }
};

export const getUserImage = () => {
  const p = getCachedUserProfile();
  return p?.user_img || 'https://placehold.co/214x220';
};


  