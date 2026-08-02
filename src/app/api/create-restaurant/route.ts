import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // Lazy init — avoids build-time crash when env vars aren't loaded yet
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { userId, restaurantName, slug, primaryColor, referralCode } = await req.json();

    if (!userId || !restaurantName || !slug) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const insertData: Record<string, any> = {
      user_id: userId,
      name: restaurantName,
      slug,
      primary_color: primaryColor || '#4F46E5',
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

