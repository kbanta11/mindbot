import { createClient } from '@supabase/supabase-js';
import { NeynarAPIClient, FeedType, FilterType } from "@neynar/nodejs-sdk";
import dotenv from 'dotenv';
import { NextRequest, NextResponse } from 'next/server';
dotenv.config();

const supabaseUrl = 'https://vnwfytqnalnrdswuvvgz.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY ?? '');
const signer = process.env.NEYNAR_BOT_SIGNER;

export async function POST(req: NextRequest) {
    const { fid, name, message } = await req.json();
    // add supebase user or switch to gratitude active if already exists
    const { data, error } = await supabase.from('users').upsert({
        fid: fid,
        name: name,
        gratitude_active: true,
    }, {
        onConflict: 'fid'
    });

    if (error) {
        console.error(`Error adding/updating user: ${name}: ${error.message}`);
        return NextResponse.json({ error: error }, { status: 400})
    }

    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set('Content-Type', 'application/json');
    requestHeaders.set('Accept', 'application/json');
    requestHeaders.set('api_key', process.env.NEYNAR_API_KEY ?? '');
    // send cast from mindbot tagging user with gratitude
    const response = await fetch('https://api.neynar.com/v2/farcaster/cast', {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({
            signer_uuid: signer,
            text: `Thanks for joining A Nudge of Gratitude. Welcome @${name}, who is grateful for this today:\n${message}`,
            channel_id: 'mindbot'
        })
    })
    const castData = await response.json();

    return NextResponse.json({ success: true, castHash: castData?.cast?.hash }, { status: 200 });
}