import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Uses service role to bypass RLS — only called server-side during registration
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, restaurantName, slug, primaryColor } = await req.json();

    if (!userId || !restaurantName || !slug) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('restaurants').insert({
      user_id: userId,
      name: restaurantName,
      slug,
      primary_color: primaryColor || '#4F46E5',
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
