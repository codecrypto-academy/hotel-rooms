"use client";
import Link from "next/link";
import { useWeb3 } from "@/context/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWeb3();
  const router = useRouter();

  // If user somehow navigates to /dashboard but isn't connected, send them home
  useEffect(() => {
    if (!isConnected) {
      router.replace("/");
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[url('/images/pattern.svg')] bg-repeat">
      {/* Optional internal navigation */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 py-3">
          <ul className="flex space-x-6 text-gray-600">
            <li>
              <Link href="/dashboard/mint" className="hover:text-gray-900 transition-colors">
                Mintear
              </Link>
            </li>
            <li>
              <Link href="/dashboard/comprar" className="hover:text-gray-900 transition-colors">
                Comprar
              </Link>
            </li>
            <li>
              <Link href="/dashboard/rooms" className="hover:text-gray-900 transition-colors">
                Habitaciones
              </Link>
            </li>
            <li>
              <Link href="/dashboard/resumen" className="hover:text-gray-900 transition-colors">
                Resumen
              </Link>
            </li>

            <li>
              <Link href="/dashboard/buy" className="hover:text-gray-900 transition-colors">
                Buy
              </Link>
            </li>
            <li>
              <Link href="/dashboard/mistokens" className="hover:text-gray-900 transition-colors">
                Mis tokens
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}
