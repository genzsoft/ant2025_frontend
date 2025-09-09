import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, getStoredTokens } from '../utils/auth.js';
import { Api_Base_Url } from '../config/api.js';

export default function Recharge() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cashin'); // 'cashin' | 'send'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [cashInForm, setCashInForm] = useState({
    account: '',
    amount: '',
    trxId: '',
    method: 'Bkash',
  });

  const [sendForm, setSendForm] = useState({
    account: '',
    amount: '',
  });

  // Guard: Only shop owners can access
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/auth');
      return;
    }
    const user = getCurrentUser();
    if (!user || user.role !== 'shop_owner') {
      navigate('/');
    }
  }, [navigate]);

  const onCashInChange = (e) => {
    const { name, value } = e.target;
    setCashInForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSendChange = (e) => {
    const { name, value } = e.target;
    setSendForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitCashIn = async (e) => {
    e.preventDefault();
    e.preventDefault();
    setError('');

    // basic validation
    if (!cashInForm.account || !cashInForm.amount) {
      setError('Please provide account number and amount.');
      return;
    }
    // optional: enforce 11-digit phone
    const phoneOnly = cashInForm.account.replace(/\D/g, '');
    if (phoneOnly.length < 10) {
      setError('Please enter a valid receiver phone number.');
      return;
    }

    // format amount as string
    const amountStr = String(cashInForm.amount);

    setSubmitting(true);
    try {
      const tokens = getStoredTokens();
      const headers = {
        'Content-Type': 'application/json'
      };
      if (tokens && tokens.access) headers['Authorization'] = `Bearer ${tokens.access}`;

      const body = {
        receiver_phone: cashInForm.account,
        amount: amountStr
      };

  const res = await fetch(`${Api_Base_Url}/api/cashin/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {

        const msg = data?.detail || data?.message || JSON.stringify(data);
        console.log('Cashin error response:', msg);
        
        // Clean up error message - remove brackets and quotes
        let cleanMsg = msg;
        if (typeof msg === 'string') {
          // Remove array brackets and quotes: ["message"] -> message
          cleanMsg = msg.replace(/^\["?|"?\]$/g, '').replace(/^"|"$/g, '');
        }
        
        throw new Error(cleanMsg || 'Cashin failed');
      }

      // success
      alert('Cash In submitted successfully');
      setCashInForm({ account: '', amount: '', trxId: '', method: 'Bkash' });
    } catch (err) {
      console.error('Cashin error', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const submitSend = async (e) => {
    e.preventDefault();
    setError('');

    // basic validation
    if (!sendForm.account || !sendForm.amount) {
      setError('Please provide account number and amount.');
      return;
    }
    const phoneOnly = sendForm.account.replace(/\D/g, '');
    if (phoneOnly.length < 10) {
      setError('Please enter a valid receiver phone number.');
      return;
    }

    const amountStr = String(sendForm.amount);

    setSubmitting(true);
    try {
      const tokens = getStoredTokens();
      const headers = {
        'Content-Type': 'application/json'
      };
      if (tokens && tokens.access) headers['Authorization'] = `Bearer ${tokens.access}`;

      const body = {
        receiver_phone: sendForm.account,
        amount: amountStr
      };

      console.log('=== TOP UP REQUEST ===');
      console.log('URL:', `${Api_Base_Url}/api/cashin/`);
      console.log('Headers:', headers);
      console.log('Request Body:', body);

      const res = await fetch(`${Api_Base_Url}/api/cashin/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      console.log('=== TOP UP RESPONSE ===');
      console.log('Status:', res.status, res.statusText);
      console.log('Response Headers:', Object.fromEntries(res.headers.entries()));

      const data = await res.json();
      console.log('Response Data:', data);

      if (!res.ok) {
        const msg = data?.detail || data?.message || JSON.stringify(data);
        console.log('Top Up error response:', msg);
        
        // Clean up error message - remove brackets and quotes
        let cleanMsg = msg;
        if (typeof msg === 'string') {
          // Remove array brackets and quotes: ["message"] -> message
          cleanMsg = msg.replace(/^\["?|"?\]$/g, '').replace(/^"|"$/g, '');
        }
        
        throw new Error(cleanMsg || 'Top Up failed');
      }

      // success
      console.log('Top Up SUCCESS:', data);
      alert('Top Up submitted successfully');
      setSendForm({ account: '', amount: '' });
    } catch (err) {
      console.error('Top Up error', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-100 text-green-700 mb-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {/* banknote / cash icon */}
              <rect x="2.5" y="6" width="19" height="12" rx="2" fill="none" />
              <circle cx="12" cy="12" r="2.25" fill="none" />
              <path d="M7 9v6" />
              <path d="M17 9v6" />
            </svg>
          </div>


          
          
        </div>

        {/* Segmented control */}
        <div className="grid grid-cols-2 bg-gray-100 rounded-xl p-1 mb-4">
          <button
            className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'cashin' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('cashin')}
          >
            Cash In
          </button>
          <button
            className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'send' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('send')}
          >
            Top Up
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          {/* Error Message */}
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="text-red-600 text-sm font-medium">{error}</div>
            </div>
          )}

          {activeTab === 'cashin' ? (
            <form onSubmit={submitCashIn} className="space-y-3">
              {/* Account Number */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Account Number</label>
                <input
                  type="tel"
                  name="account"
                  value={cashInForm.account}
                  onChange={onCashInChange}
                  placeholder="e.g. 017XXXXXXXX"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={cashInForm.amount}
                  onChange={onCashInChange}
                  placeholder="৳ Amount"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                />
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Transaction ID</label>
                <input
                  type="text"
                  name="trxId"
                  value={cashInForm.trxId}
                  onChange={onCashInChange}
                  placeholder="Bkash/Nagad/Rocket TRX ID"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
                <div className="relative">
                  <select
                    name="method"
                    value={cashInForm.method}
                    onChange={onCashInChange}
                    className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Bkash">Bkash</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Nagad">Nagad</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:bg-green-400"
              >
                {submitting && (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                <span>Submit Cash In</span>
              </button>
            </form>
          ) : (
            <form onSubmit={submitSend} className="space-y-3">
              {/* Account Number */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Account Number</label>
                <input
                  type="tel"
                  name="account"
                  value={sendForm.account}
                  onChange={onSendChange}
                  placeholder="e.g. 017XXXXXXXX"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  inputMode="numeric"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={sendForm.amount}
                  onChange={onSendChange}
                  placeholder="৳ Amount"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:bg-green-400"
              >
                {submitting && (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                <span>Top Up</span>
              </button>
            </form>
          )}
        </div>

        {/* Tips */}
        <p className="mt-4 text-center text-[11px] text-gray-500">
          Make sure your transaction ID matches your payment method.
        </p>
      </div>
    </section>
  );
}
