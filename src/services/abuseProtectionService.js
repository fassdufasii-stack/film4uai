import { supabase } from '../lib/supabaseClient';

const DAILY_LIMIT = 30; // 30 AI requests per day for premium users
const BURST_LIMIT_MS = 800; // 0.8 seconds between individual requests
let lastRequestTime = 0;
let burstCount = 0;
const MAX_BURST = 2; // Allow 2 rapid-fire requests (for combined chat + recs)

export const validateAIRequest = async () => {
    const now = Date.now();

    if (now - lastRequestTime < BURST_LIMIT_MS) {
        burstCount++;
        if (burstCount > MAX_BURST) {
            throw new Error("Whoa! Slow down. The AI needs a second to think.");
        }
    } else {
        burstCount = 1;
    }

    lastRequestTime = now;

    // 2. CHECK AUTH & QUOTA
    const { data: { user } } = await supabase.auth.getUser();

    // IP-based Soft Limit for Guests (using LocalStorage as proxy)
    if (!user) {
        const guestHistory = JSON.parse(localStorage.getItem('f4u_guest_quota') || '{"count": 0, "date": ""}');
        const today = new Date().toISOString().split('T')[0];

        if (guestHistory.date === today) {
            if (guestHistory.count >= 50) {
                throw new Error("Guest quota exceeded (50/day). Sign in for 30 daily AI requests.");
            }
            guestHistory.count += 1;
        } else {
            guestHistory.date = today;
            guestHistory.count = 1;
        }
        localStorage.setItem('f4u_guest_quota', JSON.stringify(guestHistory));
        return true;
    }

    // Authenticated User Tracking (Server-side Quota)
    const { data: quota, error } = await supabase
        .from('user_quotas')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error || !quota) return true; // Assume okay if quota table fails
    if (quota.is_blocked) throw new Error("Your account has been flagged for unusual activity. Contact support.");

    const today = new Date().toISOString().split('T')[0];
    const lastDate = quota.last_request_date;

    // Reset if it's a new day
    if (lastDate !== today) {
        await supabase.from('user_quotas').update({
            daily_ai_requests: 1,
            last_request_date: today,
            total_requests: quota.total_requests + 1
        }).eq('id', user.id);
    } else {
        if (quota.daily_ai_requests >= DAILY_LIMIT) {
            throw new Error(`Daily limit reached (${DAILY_LIMIT}/${DAILY_LIMIT}). Try again tomorrow!`);
        }
        await supabase.from('user_quotas').update({
            daily_ai_requests: quota.daily_ai_requests + 1,
            total_requests: quota.total_requests + 1
        }).eq('id', user.id);
    }

    return true;
};
