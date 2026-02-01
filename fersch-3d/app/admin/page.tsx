"use client";

import { useEffect, useState } from 'react';

interface Settings {
  resinPrices: Record<string, number>;
  /** Quantity markups rules. Each rule has a min and optional max quantity and a markup percentage. */
  quantityMarkups: { min: number; max: number | null; markup: number }[];
  machineHourlyRate: number;
  preparationFee: number;
  vatRate: number;
  deliveryOptions: { name: string; duration: string; costType: string; cost: number }[];
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
  deliveryOptions: [
    { name: 'Standard', duration: '5-7 jours', costType: 'flat', cost: 0 },
    { name: 'Express', duration: '2-3 jours', costType: 'percentage', cost: 20 },
  ],
};

export default function AdminPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        } else {
          setSettings(defaultSettings);
        }
      } catch (err) {
        console.error(err);
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleResinPriceChange = (name: string, value: number) => {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            resinPrices: { ...prev.resinPrices, [name]: value },
          }
        : prev
    );
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      alert('Paramètres enregistrés');
    } catch (err) {
      alert('Erreur lors de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <main className="container mx-auto px-4 py-8 flex-1 text-center">
        Chargement…
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 flex-1">
      <h1 className="text-3xl font-bold mb-6 text-center">Administration</h1>

      {/* Resin prices */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Prix des résines (€/L)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(settings.resinPrices).map(([name, price]) => (
            <div key={name} className="flex items-center gap-2">
              <label className="w-32 font-medium">{name}</label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => handleResinPriceChange(name, parseFloat(e.target.value))}
                className="flex-1 border p-2 rounded"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Quantity markups */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Majorations par quantité (%)</h2>
        <div className="space-y-2">
          {settings.quantityMarkups.map((rule, idx) => {
            const label =
              rule.max === null
                ? `${rule.min}+`
                : rule.min === rule.max
                ? `${rule.min}`
                : `${rule.min}-${rule.max}`;
            return (
              <div key={idx} className="flex items-center gap-2">
                <label className="w-32 font-medium">{label}</label>
                <input
                  type="number"
                  value={rule.markup}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setSettings((prev) =>
                      prev
                        ? {
                            ...prev,
                            quantityMarkups: prev.quantityMarkups.map((m, i) =>
                              i === idx ? { ...m, markup: value } : m
                            ),
                          }
                        : prev
                    );
                  }}
                  className="flex-1 border p-2 rounded"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Fixed costs */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Coûts fixes</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <label className="w-48 font-medium">Coût machine/heure (€)</label>
            <input
              type="number"
              value={settings.machineHourlyRate}
              onChange={(e) =>
                setSettings((prev) =>
                  prev
                    ? { ...prev, machineHourlyRate: parseFloat(e.target.value) }
                    : prev
                )
              }
              className="flex-1 border p-2 rounded"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-48 font-medium">Frais préparation (€)</label>
            <input
              type="number"
              value={settings.preparationFee}
              onChange={(e) =>
                setSettings((prev) =>
                  prev
                    ? { ...prev, preparationFee: parseFloat(e.target.value) }
                    : prev
                )
              }
              className="flex-1 border p-2 rounded"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-48 font-medium">TVA (%)</label>
            <input
              type="number"
              value={settings.vatRate}
              onChange={(e) =>
                setSettings((prev) =>
                  prev
                    ? { ...prev, vatRate: parseFloat(e.target.value) }
                    : prev
                )
              }
              className="flex-1 border p-2 rounded"
            />
          </div>
        </div>
      </section>

      {/* Delivery options */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Livraison</h2>
        <div className="space-y-2">
          {settings.deliveryOptions.map((opt, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-center gap-2 border p-2 rounded"
            >
              <label className="w-24 font-medium">{opt.name}</label>
              <input
                type="text"
                value={opt.duration}
                onChange={(e) => {
                  const v = e.target.value;
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          deliveryOptions: prev.deliveryOptions.map((o, i) =>
                            i === idx ? { ...o, duration: v } : o
                          ),
                        }
                      : prev
                  );
                }}
                className="w-32 border p-2 rounded"
              />
              <select
                value={opt.costType}
                onChange={(e) => {
                  const v = e.target.value;
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          deliveryOptions: prev.deliveryOptions.map((o, i) =>
                            i === idx ? { ...o, costType: v } : o
                          ),
                        }
                      : prev
                  );
                }}
                className="border p-2 rounded"
              >
                <option value="flat">Forfait (€)</option>
                <option value="percentage">Pourcentage (%)</option>
              </select>
              <input
                type="number"
                value={opt.cost}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          deliveryOptions: prev.deliveryOptions.map((o, i) =>
                            i === idx ? { ...o, cost: v } : o
                          ),
                        }
                      : prev
                  );
                }}
                className="w-24 border p-2 rounded"
              />
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </main>
  );
}