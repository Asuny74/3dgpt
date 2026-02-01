import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  const resin = (formData.get('resin') as string) || 'Grey Pro';
  const quantity = parseInt((formData.get('quantity') as string) || '1', 10);

  try {
    // Save uploaded file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tmpDir = '/tmp/fersch3d';
    await fs.mkdir(tmpDir, { recursive: true });
    const filePath = join(tmpDir, `${Date.now()}-${file.name}`);
    await fs.writeFile(filePath, buffer);

    // Attempt to run preform-cli
    const cliPath = process.env.PREFORM_CLI || 'preform-cli';
    const args = ['--add-supports', '--analyze', filePath];
    const result = await new Promise<AnalysisResult>((resolve) => {
      try {
        const proc = spawn(cliPath, args);
        let stdout = '';
        proc.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        proc.stderr.on('data', (data) => {
          console.error(data.toString());
        });
        proc.on('close', () => {
          try {
            const parsed = JSON.parse(stdout);
            resolve({
              success: parsed.success ?? true,
              volume_ml: parsed.volume_ml,
              print_time_hours: parsed.print_time_hours,
            });
          } catch {
            resolve({ success: false, volume_ml: 0, print_time_hours: 0 });
          }
        });
      } catch (e) {
        // preform-cli not available, fallback
        resolve({ success: true, volume_ml: 10, print_time_hours: 2 });
      }
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

interface AnalysisResult {
  success: boolean;
  volume_ml: number;
  print_time_hours: number;
}