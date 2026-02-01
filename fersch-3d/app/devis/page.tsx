"use client";

import { useState } from 'react';

interface AnalysisResult {
  volume_ml: number;
  print_time_hours: number;
  success: boolean;
}

interface PriceResult {
  priceHT: number;
  priceTTC: number;
  vat: number;
  unitPriceHT: number;
}

export default function DevisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [resin, setResin] = useState('Grey Pro');
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [price, setPrice] = useState<PriceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeFile = async () => {
    if (!file) return;
    setStep(2);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resin', resin);
      formData.append('quantity', quantity.toString());

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const data: AnalysisResult = await response.json();
      if (!data.success) {
        setError(
          'Analyse automatique impossible. Merci de nous contacter pour un devis manuel.'
        );
        setStep(1);
        return;
      }
      setAnalysis(data);

      // Compute price
      const priceRes = await fetch('/api/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volume_ml: data.volume_ml,
          print_time_hours: data.print_time_hours,
          resin,
          quantity,
        }),
      });
      const priceData: PriceResult = await priceRes.json();
      setPrice(priceData);
      setStep(3);
    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue.');
      setStep(1);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 flex-1">
      <h1 className="text-3xl font-bold mb-6 text-center">Obtenir un devis</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4 text-center">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="bg-white shadow p-6 rounded-lg max-w-2xl mx-auto">
          <div className="mb-4">
            <label className="block font-semibold mb-2">Fichier STL</label>
            <input
              type="file"
              accept=".stl"
              onChange={handleFileChange}
              className="block w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-2">Résine</label>
            <select
              value={resin}
              onChange={(e) => setResin(e.target.value)}
              className="block w-full border border-gray-300 p-2 rounded"
            >
              <option>Grey Pro</option>
              <option>Clear</option>
              <option>Tough</option>
              <option>Flexible</option>
              <option>Castable</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-2">Quantité</label>
            <input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              className="block w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <button
            onClick={analyzeFile}
            disabled={!file}
            className="bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 disabled:opacity-50 w-full"
          >
            Analyser et calculer
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="text-center py-10">
          <p className="text-lg">Analyse en cours…</p>
        </div>
      )}

      {step === 3 && analysis && price && (
        <div className="bg-white shadow p-6 rounded-lg max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Récapitulatif du devis</h2>
          <table className="w-full mb-4">
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-semibold">Fichier</td>
                <td className="py-2">{file?.name}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-semibold">Résine</td>
                <td className="py-2">{resin}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-semibold">Volume matière (mL)</td>
                <td className="py-2">{analysis.volume_ml.toFixed(2)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-semibold">Temps d'impression (h)</td>
                <td className="py-2">{analysis.print_time_hours.toFixed(2)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-semibold">Quantité</td>
                <td className="py-2">{quantity}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-semibold">Prix unitaire HT</td>
                <td className="py-2">{price.unitPriceHT.toFixed(2)} €</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-semibold">Prix total HT</td>
                <td className="py-2">{price.priceHT.toFixed(2)} €</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-semibold">TVA (20 %)</td>
                <td className="py-2">{price.vat.toFixed(2)} €</td>
              </tr>
              <tr>
                <td className="py-2 font-bold text-lg">Prix total TTC</td>
                <td className="py-2 font-bold text-lg">{price.priceTTC.toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>
          <div className="flex flex-col gap-3">
            <a
              href={
                `/api/pdf?fileName=${encodeURIComponent(
                  file?.name || ''
                )}&resin=${encodeURIComponent(
                  resin
                )}&volume_ml=${analysis.volume_ml.toFixed(2)}&print_time_hours=${analysis.print_time_hours.toFixed(
                  2
                )}&quantity=${quantity}&unitPriceHT=${price.unitPriceHT.toFixed(2)}&priceHT=${price.priceHT.toFixed(
                  2
                )}&vat=${price.vat.toFixed(2)}&priceTTC=${price.priceTTC.toFixed(2)}`
              }
              className="bg-gray-200 text-gray-900 py-2 px-4 rounded text-center hover:bg-gray-300"
            >
              📄 Télécharger le devis PDF
            </a>
            <a
              href="/commande"
              className="bg-primary text-white py-2 px-4 rounded text-center hover:bg-primary/90"
            >
              🛒 Commander et payer
            </a>
          </div>
        </div>
      )}
    </main>
  );
}