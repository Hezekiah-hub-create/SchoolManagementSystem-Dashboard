import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log(`Request received: ${request.method} ${request.nextUrl.pathname}`);
  return NextResponse.json({ message: 'Welcome to the API' });
}
