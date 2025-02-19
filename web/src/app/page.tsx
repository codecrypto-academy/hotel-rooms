
export default function Home() {
  return (
    <div>
    
      <main className="container mx-auto p-8">
        <section className="text-center space-y-6">
          <h2 className="text-4xl font-bold">Bienvenido a Hotel California NFT</h2>
          <p className="text-xl">
            La primera plataforma descentralizada para reservar habitaciones de hotel usando NFTs
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 border rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Reservas Seguras</h3>
              <p>Tus reservas están aseguradas en la blockchain, inmutables y verificables</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Tokenización</h3>
              <p>Convierte tus estancias en activos digitales que puedes transferir o vender</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Transparencia</h3>
              <p>Precios y disponibilidad visibles en la blockchain</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
