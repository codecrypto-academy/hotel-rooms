"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useWeb3 } from "@/context/Web3Context"
import { Wallet, Home, LayoutDashboard, Sparkles, Menu, X } from "lucide-react"
import Image from "next/image"

export function Header() {
  const { connect, account, isConnected } = useWeb3()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleConnect = async () => {
    await connect()
    router.push("/dashboard")
  }

  const handleGoDashboard = () => {
    router.push("/dashboard")
  }

  const handleGoHome = () => {
    router.push("/")
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-lg shadow-slate-900/5"
            : "bg-white/80 backdrop-blur-md border-b border-white/20"
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Title */}
            <div
              className="flex items-center space-x-3 cursor-pointer group transition-all duration-300 hover:scale-105"
              onClick={handleGoHome}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gold to-yellow-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-gold/10 to-yellow-500/10 flex items-center justify-center border border-gold/20">
                  <Image
                    src="/images/logo.png"
                    alt="Hotel California Logo"
                    width={28}
                    height={28}
                    className="object-contain group-hover:rotate-12 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                  Hotel California
                </h1>
                <div className="flex items-center gap-1 -mt-1">
                  <span className="text-xs font-medium text-gold">NFT</span>
                  <Badge className="bg-gold/10 text-gold border-gold/20 text-xs px-1.5 py-0">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                    Web3
                  </Badge>
                </div>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Hotel California NFT
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {isConnected ? (
                <div className="flex items-center space-x-4">
                  {/* Connected Status */}
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-full px-4 py-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-slate-700">
                      {account?.slice(0, 6)}...{account?.slice(-4)}
                    </span>
                  </div>

                  {/* Dashboard Button */}
                  <Button
                    onClick={handleGoDashboard}
                    className="bg-gold text-white font-semibold px-6 py-2.5 shadow-lg hover:shadow-xl hover:shadow-gold/25 hover:bg-goldHover transition-all duration-300 group"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Dashboard
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleConnect}
                  className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-700 hover:to-slate-900 text-white font-semibold px-6 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Wallet className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Conectar Wallet
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/50 bg-white/95 backdrop-blur-xl">
            <div className="container mx-auto px-6 py-4 space-y-4">
              <Button variant="ghost" onClick={handleGoHome} className="w-full justify-start text-left">
                <Home className="w-4 h-4 mr-3" />
                Inicio
              </Button>

              {isConnected ? (
                <>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-slate-700">Conectado</span>
                    </div>
                    <span className="text-xs font-mono text-slate-600">
                      {account?.slice(0, 6)}...{account?.slice(-4)}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      handleGoDashboard()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-500 hover:to-gold text-black font-semibold"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Ir al Dashboard
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    handleConnect()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-700 hover:to-slate-900 text-white font-semibold"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Conectar Wallet
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-20" />
    </>
  )
}
