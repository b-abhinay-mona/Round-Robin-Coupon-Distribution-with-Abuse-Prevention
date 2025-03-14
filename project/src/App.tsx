import React, { useState, useEffect } from 'react';
import { Ticket, Timer, AlertCircle, RefreshCw, Shield } from 'lucide-react';
import { supabase } from './lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<number>(0);
  const [lastCoupon, setLastCoupon] = useState<string | null>(null);

  useEffect(() => {
    const checkClaimStatus = async () => {
      const lastClaimTime = localStorage.getItem('lastClaimTime');
      if (lastClaimTime) {
        const diff = Date.now() - parseInt(lastClaimTime);
        if (diff < 3600000) { // 1 hour
          setTimeLeft(Math.ceil((3600000 - diff) / 1000));
        }
      }
    };

    const fetchCouponsCount = async () => {
      const { count } = await supabase
        .from('coupons')
        .select('*', { count: 'exact', head: true })
        .eq('claimed', false);
      
      setAvailableCoupons(count || 0);
    };

    checkClaimStatus();
    fetchCouponsCount();

    // Set up periodic refresh of coupon count
    const countInterval = setInterval(fetchCouponsCount, 30000);

    // Set up countdown timer
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev > 0) {
          return prev - 1;
        }
        return null;
      });
    }, 1000);

    return () => {
      clearInterval(countInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const claimCoupon = async () => {
    try {
      setLoading(true);

      // Get client IP from ipify API
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip: user_ip } = await response.json();
      
      if (!user_ip) {
        throw new Error('Could not determine IP address');
      }

      // Check for existing claims from this IP in the last hour
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const { count: recentClaims } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', user_ip)
        .gte('claimed_at', oneHourAgo);

      if (recentClaims && recentClaims > 0) {
        toast.error('Please wait one hour between claims');
        return;
      }

      // Get next available coupon
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('claimed', false)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;

      if (!coupon) {
        toast.error('No coupons available!');
        return;
      }

      // Update coupon and record claim
      const { error: updateError } = await supabase
        .from('coupons')
        .update({ 
          claimed: true, 
          claimed_at: new Date().toISOString()
        })
        .eq('id', coupon.id);

      if (updateError) throw updateError;

      // Record the claim with IP address
      const { error: claimError } = await supabase
        .from('claims')
        .insert([{
          coupon_id: coupon.id,
          ip_address: user_ip,
          claimed_at: new Date().toISOString()
        }]);

      if (claimError) throw claimError;

      // Update local storage and state
      localStorage.setItem('lastClaimTime', Date.now().toString());
      localStorage.setItem('lastCouponCode', coupon.code);
      setTimeLeft(3600);
      setLastCoupon(coupon.code);
      setAvailableCoupons(prev => prev - 1);
      
      toast.success('Successfully claimed your coupon!');

    } catch (error) {
      console.error('Claim error:', error);
      toast.error('Failed to claim coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <Ticket className="w-12 h-12 text-purple-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Coupon Distribution
        </h1>
        
        <div className="flex items-center justify-center gap-2 mb-6">
          <RefreshCw className="w-4 h-4 text-gray-500" />
          <p className="text-center text-gray-600">
            Available Coupons: {availableCoupons}
          </p>
        </div>

        {lastCoupon && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-green-700">
              <Ticket className="w-5 h-5" />
              <p>Your coupon code: <span className="font-mono font-bold">{lastCoupon}</span></p>
            </div>
          </div>
        )}

        {timeLeft ? (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Timer className="w-5 h-5" />
              <span>Please wait {Math.floor(timeLeft / 60)}m {timeLeft % 60}s before claiming again</span>
            </div>
          </div>
        ) : (
          <button
            onClick={claimCoupon}
            disabled={loading || availableCoupons === 0}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors
              ${loading || availableCoupons === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600'}`}
          >
            {loading ? 'Claiming...' : 'Claim Coupon'}
          </button>
        )}

        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                You can claim one coupon per hour. Make sure to save your coupon code once claimed!
              </p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-700">
                Our system ensures fair distribution of coupons and prevents abuse through IP tracking and time-based restrictions.
              </p>
            </div>
          </div>
        </div>

        <Toaster position="top-center" />
      </div>
    </div>
  );
}

export default App;