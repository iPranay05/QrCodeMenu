import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { accessToken, userId, restaurantName, slug, primaryColor, referralCode } = await req.json();

    if (!restaurantName || !slug) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    let verifiedUserId: string | null = null;

    if (accessToken) {
      // 1. Primary path: verify active session access token
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
      if (!authError && user) {
        verifiedUserId = user.id;
      }
    } else if (userId) {
      // 2. Fallback path (when email confirmation is required, session token is not yet issued)
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (!userError && userData?.user) {
        const createdAt = new Date(userData.user.created_at).getTime();
        // Only accept freshly created user accounts (within last 10 minutes)
        if (Date.now() - createdAt < 10 * 60 * 1000) {
          verifiedUserId = userData.user.id;
        }
      }
    }

    if (!verifiedUserId) {
      return NextResponse.json({ error: 'Unauthorized or expired session' }, { status: 401 });
    }

    // Check if a restaurant already exists for this user
    const { data: existingRest } = await supabaseAdmin
      .from('restaurants')
      .select('id')
      .eq('user_id', verifiedUserId)
      .maybeSingle();

    if (existingRest) {
      return NextResponse.json({ error: 'A restaurant profile already exists for this account.' }, { status: 400 });
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 3);

    const insertData: Record<string, unknown> = {
      user_id: verifiedUserId,
      name: restaurantName,
      slug,
      primary_color: primaryColor || '#4F46E5',
      subscription_status: 'trial',
      trial_ends_at: trialEndsAt.toISOString(),
    };

    // Only attach referral code if provided and non-empty
    if (referralCode && referralCode.trim()) {
      insertData.referral_code = referralCode.trim().toUpperCase();
    }

    const { error } = await supabaseAdmin.from('restaurants').insert(insertData);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

