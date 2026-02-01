import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';

interface Settings {
  resinPrices: Record<string, number>;
  quantityMarkups: { min: number; max: number | null; markup: number }[];
  machineHourlyRate: number;
  preparationFee: number;
  vatRate: number;
}

const defaultSettings: Settings = {
  resinPrices: {
    'Grey Pro': 150,
    Clear: 180,
    Tough: 170,
    Flexible: 200,
    Castable: 200,
  },
  quantityMarkups: [
    { min: 1, max: 1, markup: 50 },
    { min: 2, max: 5, markup: 30 },
    { min: 6, max: 10, markup: 20 },
    { min: 11, max: 20, markup: 10 },
    { min: 21, max: null, markup: 5 },
  ],
  machineHourlyRate: 5,
  preparationFee: 10,
  vatRate: 20,
};

/**
 * Compute the markup percentage based on quantity using settings rules.
 */
function getMarkupByQuantity(quantity: number, rules: Settings['quantityMarkups']): number {
  for (const rule of rules) {
    if (quantity >= rule.min && (rule.max === null || quantity <= rule.max)) {
      return rule.markup;
    }
  }
  return 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { volume_ml, print_time_hours, resin, quantity } = body as {
      volume_ml: number;
      print_time_hours: number;
      resin: string;
      quantity: number;
    };

    // Load settings from disk if available, otherwise use defaults
    const settingsPath = join(process.cwd(), 'data', 'settings.json');
    let settings: Settings;
    try {
      const data = await fs.readFile(settingsPath, 'utf8');
      settings = JSON.parse(data) as Settings;
    } catch (err) {
      settings = defaultSettings;
    }

    // Compute costs
    const resinPricePerLiter = settings.resinPrices[resin] ?? 0;
    const resinCost = (volume_ml / 1000) * resinPricePerLiter;
    const machineCost = print_time_hours * settings.machineHourlyRate;
    const fixedCost = settings.preparationFee;
    const subtotal = (resinCost + machineCost + fixedCost) * quantity;
    const markup = getMarkupByQuantity(quantity, settings.quantityMarkups);
    const priceHT = subtotal * (1 + markup / 100);
    const vat = priceHT * (settings.vatRate / 100);
    const priceTTC = priceHT + vat;
    const unitPriceHT = priceHT / quantity;

    return NextResponse.json({ priceHT, vat, priceTTC, unitPriceHT });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}