import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';

const settingsPath = join(process.cwd(), 'data', 'settings.json');

/**
 * GET handler returns the current pricing and configuration settings.
 */
export async function GET() {
  try {
    const data = await fs.readFile(settingsPath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (err) {
    console.error(err);
    return NextResponse.json({}, { status: 200 });
  }
}

/**
 * POST handler updates the settings file with provided JSON body.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Basic validation: ensure required top-level keys exist
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    await fs.writeFile(settingsPath, JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}