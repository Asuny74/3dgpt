export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Fersch 3D</h1>
          <p className="text-lg mb-8">Votre service d’impression 3D haute précision</p>
          <a
            href="/devis"
            className="inline-block bg-white text-primary font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100"
          >
            Obtenir un devis gratuit
          </a>
        </div>
      </section>

      {/* Pourquoi choisir Fersch */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">Pourquoi choisir Fersch ?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-semibold text-xl mb-2">Qualité supérieure</h3>
              <p>Impressions précises et fiables grâce à la Form 4 de Formlabs.</p>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2">Tarifs transparents</h3>
              <p>Calcul automatique des coûts selon vos pièces et nos matières.</p>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-2">Service réactif</h3>
              <p>Devis instantané et livraisons rapides en fonction de vos besoins.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Galerie */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">Galerie de réalisations</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 aspect-square rounded-lg flex items-center justify-center text-gray-500"
              >
                Image {i + 1}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}