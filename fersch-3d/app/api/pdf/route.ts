import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * GET handler generates a PDF quote based on query parameters.
 * Accepts parameters:
 * - fileName: name of the uploaded file
 * - resin
 * - volume_ml
 * - print_time_hours
 * - quantity
 * - unitPriceHT
 * - priceHT
 * - vat
 * - priceTTC
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;
    const fileName = params.get('fileName') || 'fichier.stl';
    const resin = params.get('resin') || 'Grey Pro';
    const volume_ml = parseFloat(params.get('volume_ml') || '0');
    const print_time_hours = parseFloat(params.get('print_time_hours') || '0');
    const quantity = parseInt(params.get('quantity') || '1', 10);
    const unitPriceHT = parseFloat(params.get('unitPriceHT') || '0');
    const priceHT = parseFloat(params.get('priceHT') || '0');
    const vat = parseFloat(params.get('vat') || '0');
    const priceTTC = parseFloat(params.get('priceTTC') || '0');

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Embed logo
    try {
      const logoPath = join(process.cwd(), 'public', 'logos', '1GMvkfV.png');
      const imageBytes = await fs.readFile(logoPath);
      const pngImage = await pdfDoc.embedPng(imageBytes);
      const scale = 100 / pngImage.width; // scale to 100px width
      const logoWidth = pngImage.width * scale;
      const logoHeight = pngImage.height * scale;
      page.drawImage(pngImage, {
        x: 40,
        y: height - logoHeight - 40,
        width: logoWidth,
        height: logoHeight,
      });
    } catch (e) {
      // silently ignore if logo fails to embed
    }

    // Fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = height - 160;
    const lineHeight = 18;

    // Title
    page.drawText('Devis Fersch 3D', {
      x: 40,
      y: yPosition,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight * 2;

    // Details table
    const rows: Array<[string, string]> = [
      ['Fichier', fileName],
      ['Résine', resin],
      ['Volume matière (mL)', volume_ml.toFixed(2)],
      ["Temps d'impression (h)", print_time_hours.toFixed(2)],
      ['Quantité', quantity.toString()],
      ['Prix unitaire HT (€)', unitPriceHT.toFixed(2)],
      ['Prix total HT (€)', priceHT.toFixed(2)],
      ['TVA (€)', vat.toFixed(2)],
    ];
    for (const [label, value] of rows) {
      page.drawText(label, { x: 40, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });
      page.drawText(value, { x: 250, y: yPosition, size: 12, font, color: rgb(0, 0, 0) });
      yPosition -= lineHeight;
    }
    // Total TTC
    yPosition -= lineHeight;
    page.drawText('Prix total TTC (€)', {
      x: 40,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(priceTTC.toFixed(2), {
      x: 250,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=devis-fersch3d.pdf`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}