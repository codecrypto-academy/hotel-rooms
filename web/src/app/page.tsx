export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex items-center justify-center h-[80vh] bg-gray-100 overflow-hidden">
        <img
          className="absolute inset-0 w-full h-full object-cover object-center opacity-80"
          src="/images/brickell-entry.jpg"
          alt="Modern Luxury Hotel"
        />
        <div className="relative z-10 text-center text-white px-4">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-md">
            Bienvenido a Hotel California NFT
          </h2>
          <p className="text-xl md:text-2xl mb-6 drop-shadow-sm">
            La primera plataforma descentralizada para reservar habitaciones de
            lujo con NFTs
          </p>

          {/* CTA => This link can also push user to connect, 
              but if they're not connected, they'll see the 
              "Conectar Wallet" button up top anyway. */}
          <a
            href="#features"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition"
          >
            Ver más
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto p-8">
        <div className="text-center space-y-6">
          <h3 className="text-3xl md:text-4xl font-bold">
            ¿Por qué usar nuestra plataforma?
          </h3>
          <p className="text-lg md:text-xl text-gray-600">
            Simplifica tus reservas y hazlas inmutables en la blockchain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="p-6 border border-gray-100 shadow-sm rounded-lg">
            <h4 className="text-2xl font-semibold mb-4">Reservas Seguras</h4>
            <p className="text-gray-700">
              Tus reservas están aseguradas en la blockchain, inmutables y
              verificables.
            </p>
          </div>
          <div className="p-6 border border-gray-100 shadow-sm rounded-lg">
            <h4 className="text-2xl font-semibold mb-4">Tokenización</h4>
            <p className="text-gray-700">
              Convierte tus estancias en activos digitales que puedes transferir
              o vender.
            </p>
          </div>
          <div className="p-6 border border-gray-100 shadow-sm rounded-lg">
            <h4 className="text-2xl font-semibold mb-4">Transparencia</h4>
            <p className="text-gray-700">
              Precios y disponibilidad visibles en la blockchain, sin costos
              ocultos.
            </p>
          </div>
        </div>
      </section>
      <div className="container mx-auto p-11 text-xl text-center italic bg-gray-900 my-2 text-white rounded-md">
        You can check out any time you like, but you can never leave
      </div>
      {/* Footer */}
      <footer className="container mx-auto p-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Hotel California NFT. All rights
        reserved.
      </footer>
    </div>
  );
}
