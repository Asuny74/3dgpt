"use client";

import { useState } from 'react';

interface FormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
  shipping: 'standard' | 'express';
}

export default function CommandePage() {
  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    phone: '',
    address: '',
    shipping: 'standard',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, send data to backend and redirect to Stripe checkout
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="container mx-auto px-4 py-8 flex-1 text-center">
        <h1 className="text-3xl font-bold mb-4">Merci pour votre commande !</h1>
        <p>Vous recevrez un email de confirmation avec les détails.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 flex-1">
      <h1 className="text-3xl font-bold mb-6 text-center">Passer commande</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white shadow p-6 rounded-lg">
        <div className="mb-4">
          <label className="block font-semibold mb-2">Nom</label>
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            className="block w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            className="block w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Téléphone</label>
          <input
            type="tel"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            className="block w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Adresse de livraison</label>
          <input
            type="text"
            name="address"
            value={values.address}
            onChange={handleChange}
            className="block w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Mode de livraison</label>
          <select
            name="shipping"
            value={values.shipping}
            onChange={handleChange}
            className="block w-full border border-gray-300 p-2 rounded"
          >
            <option value="standard">Standard (5‑7 j) – Gratuit</option>
            <option value="express">Express (2‑3 j) – +20 %</option>
          </select>
        </div>
        {/* Récapitulatif placeholder */}
        <div className="mb-4 p-4 bg-gray-50 border rounded">
          <p className="mb-2 font-semibold">Récapitulatif</p>
          <p className="text-sm">(Les détails de votre devis seront affichés ici.)</p>
        </div>
        <button
          type="submit"
          className="bg-primary text-white py-2 px-4 rounded w-full hover:bg-primary/90"
        >
          Payer avec Stripe
        </button>
      </form>
    </main>
  );
}