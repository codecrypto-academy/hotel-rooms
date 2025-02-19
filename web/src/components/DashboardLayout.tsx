import { Header } from '@/components/Header';
import Link from 'next/link';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <div className="container mx-auto p-4">
        <nav className="mb-8">
          <ul className="flex space-x-4">
            <li>
              <Link href="/dashboard/mint" className="text-blue-600 hover:text-blue-800">
                Mintear Habitación
              </Link>
            </li>
            <li>
              <Link href="/dashboard/buy" className="text-blue-600 hover:text-blue-800">
                Comprar Habitación
              </Link>
            </li>
            <li>
              <Link href="/dashboard/resume" className="text-blue-600 hover:text-blue-800">
                Resumen de Habitaciones
              </Link>
            </li>
          </ul>
        </nav>
        {children}
      </div>
    </div>
  );
} 