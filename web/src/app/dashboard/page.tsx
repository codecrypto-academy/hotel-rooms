export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Bienvenido al Dashboard</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-600 mb-4">
          Desde aquí podrás:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Mintear nuevos tokens en la sección &quot;Mintear&quot;</li>
          <li>Comprar tokens existentes en la sección &quot;Comprar&quot;</li>
        </ul>
      </div>
    </div>
  )
} 