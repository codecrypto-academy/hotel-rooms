"use client";
import Link from "next/link";
import { useWeb3 } from "@/context/Web3Context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isConnected, role } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.replace("/");
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[url('/images/pattern.svg')] bg-repeat">
          <Header /> 
      <nav className="bg-white border-b border-gray-100 shadow-sm mt-6">
        <div className="container mx-auto px-6 py-3">
          <ul className="flex space-x-6 text-gray-600">

            {/* Admin-only links */}
            {role === 'admin' && (
              <>
                <li>
                  <Link href="/dashboard/mint" className="hover:text-gold transition-colors">
                    TOKENIZAR
                  </Link>
                </li>
                 <li>
                   <Link href="/dashboard/rooms" className="hover:text-gold transition-colors">
                     HABITACIONES
                   </Link>
                 </li>
              </>
            )}

            {/* Public/user-visible links */}
            {role !== 'admin' && (
                <>
                 <li>
                   <Link href="/dashboard/comprar" className="hover:text-gold transition-colors">
                     COMPRAR
                   </Link>
                 </li>
                <li>
                  <Link href="/dashboard/resumen" className="hover:text-gold transition-colors">
                    RESUMEN
                  </Link>
                </li>
                 <li>
                   <Link href="/dashboard/buy" className="hover:text-gold transition-colors">
                     MAYORISTA
                   </Link>
                 </li>
                 <li className="">
                 <Link href="/dashboard/mistokens" className="hover:text-gold transition-colors">
                 MIS TOKENS
                 </Link>
                 </li>
               </>
            )}
          </ul>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}
