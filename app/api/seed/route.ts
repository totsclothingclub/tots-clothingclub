import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Seed endpoint inactive. Real Supabase database is connected.' })
}

export async function POST() {
  return NextResponse.json({ status: 'ok', message: 'Seed endpoint inactive. Real Supabase database is connected.' })
}
