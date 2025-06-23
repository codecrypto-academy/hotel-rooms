"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Coins,
  Eye,
  ArrowRight,
  Sparkles,
  Leaf,
  Building,
  Globe,
  Lock,
  TrendingUp,
  Star,
  Wallet,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    setIsVisible(true)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const features = [
    {
      icon: Shield,
      title: "Reservas Seguras",
      description: "Tus reservas están aseguradas en la blockchain, inmutables y verificables en todo momento.",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      icon: Coins,
      title: "Tokenización",
      description: "Convierte tus estancias en activos digitales que puedes transferir, vender o intercambiar.",
      gradient: "from-gold to-yellow-500",
      bgGradient: "from-yellow-50 to-orange-50",
    },
    {
      icon: Eye,
      title: "Transparencia",
      description: "Precios y disponibilidad visibles en la blockchain, sin costos ocultos ni sorpresas.",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
  ]

  const stats = [
    { number: "1,247", label: "Tokens Activos", icon: Coins },
    { number: "89%", label: "Ocupación", icon: TrendingUp },
    { number: "4.9", label: "Rating", icon: Star },
    { number: "24/7", label: "Soporte", icon: Globe },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <Image
            src="/images/brickell-entry.jpg"
            alt="Modern Luxury Hotel"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        </div>

        {/* Floating Elements */}
        {/* 
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-gold rounded-full animate-pulse opacity-60" />
          <div className="absolute top-40 right-20 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-40" />
          <div className="absolute bottom-40 left-20 w-3 h-3 bg-green-400 rounded-full animate-bounce opacity-50" />
          <div className="absolute top-60 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-30" />
        </div>
        */}

        {/* Hero Content */}
        <div
          className={`relative z-10 text-center text-white px-6 max-w-6xl mx-auto transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="mb-6">
            <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by Blockchain
            </Badge>
          </div>

          <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                <span className="relative inline-block text-transparent bg-gradient-to-r from-gold via-[#E1C68F] to-gold bg-clip-text animate-gold-shimmer">
                    HOTEL CALIFORNIA
                </span>
            <br />
            <span className="text-2xl md:text-4xl lg:text-5xl font-light text-white/90">
            
            </span>
          </h1>

          <p className="text-lg md:text-2xl lg:text-3xl mb-8 text-white/90 font-light leading-relaxed max-w-4xl mx-auto">
            La primera plataforma descentralizada para reservar habitaciones de lujo con{" "}
            <span className="text-gold font-medium">NFTs</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="#features">
              <Button
                size="lg"
                className="bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-500 hover:to-gold text-white font-semibold px-8 py-4 text-lg shadow-2xl hover:shadow-gold/25 transition-all duration-300 group"
              >
                Explorar Plataforma
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/90 border-white/30 text-black hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg"
              >
                <Wallet className="mr-2 w-5 h-5" />
                Conectar Wallet
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center backdrop-blur-sm bg-white/5 rounded-2xl p-4 border border-white/10"
              >
                <stat.icon className="w-6 h-6 text-gold mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)`,
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-gold/10 text-gold border-gold/20 mb-4">
              <Building className="w-3 h-3 mr-1" />
              Tecnología Blockchain
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
              ¿Por qué usar nuestra plataforma?
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Simplifica tus reservas y hazlas inmutables en la blockchain con tecnología de vanguardia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br ${feature.bgGradient} hover:scale-105`}
              >
                <CardContent className="p-8 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                    <div className={`w-full h-full bg-gradient-to-br ${feature.gradient} rounded-full blur-2xl`} />
                  </div>
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-700 leading-relaxed text-lg">{feature.description}</p>
                  <div className="mt-6 flex items-center text-slate-600 group-hover:text-slate-900 transition-colors">
                    <span className="text-sm font-medium">Saber más</span>
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.3) 0%, transparent 70%)`,
            }}
          />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Leaf className="w-12 h-12 text-gold mx-auto mb-4" />
            </div>
            <blockquote className="text-3xl md:text-5xl font-light text-white leading-relaxed italic mb-8">
              &quot;You can check out any time you like,
              <br />
              <span className="text-gold">but you can never leave</span>&quot;
            </blockquote>
            <div className="flex items-center justify-center gap-2 text-white/60">
              <div className="w-12 h-px bg-gold" />
              <span className="text-sm font-medium">Hotel California</span>
              <div className="w-12 h-px bg-gold" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gold/5 via-yellow-50 to-gold/5">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Comienza tu experiencia
            </h2>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Únete a la revolución de las reservas hoteleras descentralizadas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-700 hover:to-slate-900 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <Lock className="mr-2 w-5 h-5" />
                  Conectar Wallet
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg"
                onClick={() => {
                const el = document.getElementById("hero");
                if (el) {
                   el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Hotel California
             </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gold bg-clip-text text-transparent">
                Hotel California NFT
              </h3>
            </div>
            <div className="flex items-center justify-center gap-6 mb-6 text-white/60">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Blockchain Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Secure & Transparent</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">Future of Hospitality</span>
              </div>
            </div>
            <div className="text-white/40 text-sm">
              &copy; {new Date().getFullYear()} Hotel California NFT. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
