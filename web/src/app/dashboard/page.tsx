import Image from "next/image";

export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto mt-6 p-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        Panel Principal
      </h1>
      <div className="bg-white/90 shadow-lg rounded-lg p-6 flex flex-col md:flex-row gap-6">
        {/* Text Section */}
        <div className="flex-1">
          <p className="text-gray-600 mb-4">Desde aquí podrás:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Mintear nuevos tokens en la sección <strong>“Mintear”</strong></li>
            <li>Comprar tokens existentes en la sección <strong>“Comprar”</strong></li>
            <li>Explorar o gestionar habitaciones en <strong>“Habitaciones”</strong></li>
          </ul>
        </div>
        {/* Image Section */}
        <div className="w-full md:w-1/2">
          <Image
            src="/images/brickell-entry.jpg"
            alt="Hotel Entrance"
            width={600}
            height={400}
            className="rounded-md object-cover"
          />
        </div>
      </div>
    </div>
  );
}
