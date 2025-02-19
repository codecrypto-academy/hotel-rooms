import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
          <div className="flex space-x-4">
            <Link 
              href="/dashboard/mint" 
              className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors"
            >
              Mintear
            </Link>
            <Link 
              href="/dashboard/comprar" 
              className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors"
            >
              Comprar
            </Link>
            <Link 
              href="/dashboard/rooms" 
              className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors"
            >
              Habitaciones
            </Link>
            <Link 
              href="/dashboard/resumen" 
              className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors"
            >
              Resumen
            </Link>
            <Link 
              href="/dashboard/mistokens" 
              className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors"
            >
              Mis  Tokens
            </Link>

            <Link 
              href="/dashboard/checkin" 
              className="px-4 py-2 hover:bg-gray-700 rounded-md transition-colors"
            >
              Check-in
            </Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  )
} 