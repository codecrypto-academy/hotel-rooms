"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Hotel,
  Coins,
  Calendar,
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  Zap,
  Eye,
  ShoppingCart,
  Wallet,
  BarChart3,
  Settings,
  Plus,
} from "lucide-react"
import { useWeb3 } from "@/context/Web3Context"

// Mock role - replace with your actual role logic
const role = "admin" // or "user"

const roomTypes = [
  {
    id: 1,
    name: "Standard Room",
    description: "Comfortable and elegant rooms with modern amenities",
    image: "/images/standard.jpg",
    price: "0.08",
    available: 12,
    rating: 4.8,
    features: ["City View", "Free WiFi", "Air Conditioning", '32" TV'],
    totalRooms: 50,
  },
  {
    id: 2,
    name: "Deluxe Suite",
    description: "Spacious suites with premium furnishing and services",
    image: "/images/deluxe.jpg",
    price: "0.15",
    available: 8,
    rating: 4.9,
    features: ["Ocean View", "Balcony", "Mini Bar", "Jacuzzi"],
    totalRooms: 30,
  },
  {
    id: 3,
    name: "Presidential Suite",
    description: "Ultimate luxury experience with exclusive amenities",
    image: "/images/suite.jpg",
    price: "0.35",
    available: 3,
    rating: 5.0,
    features: ["Panoramic View", "Private Terrace", "Butler Service", "Wine Cellar"],
    totalRooms: 10,
  },
]

const adminStats = [
  {
    label: "Total Rooms",
    value: "90",
    icon: Hotel,
    change: "+5%",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    label: "Active Tokens",
    value: "1,247",
    icon: Coins,
    change: "+12%",
    color: "text-gold",
    bgColor: "bg-yellow-50",
  },
  {
    label: "Monthly Revenue",
    value: "45.8 ETH",
    icon: TrendingUp,
    change: "+22%",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    label: "Occupancy Rate",
    value: "87%",
    icon: BarChart3,
    change: "+8%",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
]

const userStats = [
  {
    label: "My Tokens",
    value: "24",
    icon: Coins,
    change: "+3",
    color: "text-gold",
    bgColor: "bg-yellow-50",
  },
  {
    label: "Total Invested",
    value: "2.4 ETH",
    icon: Wallet,
    change: "+0.3 ETH",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    label: "Available Rooms",
    value: "23",
    icon: Hotel,
    change: "Live",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
]

const recentActivity = [
  { action: "New booking", room: "Deluxe Suite #205", time: "2 minutes ago", amount: "0.15 ETH", type: "booking" },
  { action: "Token minted", room: "Standard Room #101-110", time: "15 minutes ago", amount: "0.8 ETH", type: "mint" },
  {
    action: "Booking confirmed",
    room: "Presidential Suite #301",
    time: "1 hour ago",
    amount: "0.35 ETH",
    type: "booking",
  },
  { action: "Token purchased", room: "Deluxe Suite #220", time: "2 hours ago", amount: "0.15 ETH", type: "purchase" },
]

export default function Dashboard() {
  const { role } = useWeb3();
  const isAdmin = role === "admin"
  const stats = isAdmin ? adminStats : userStats

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-gold to-goldHover rounded-xl flex items-center justify-center shadow-lg">
            <Hotel className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {isAdmin ? "Admin Dashboard" : "Investment Dashboard"}
            </h1>
            <p className="text-slate-600">
              {isAdmin ? "Manage your blockchain-powered hotel operations" : "Track your hotel token investments"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-6`}>
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                  <p className={`text-sm font-medium ${stat.color} flex items-center gap-1`}>
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                >
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-gold/5 to-goldHover/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-gold" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            {isAdmin ? "Manage your hotel operations efficiently" : "Explore investment opportunities"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAdmin ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/dashboard/mint">
                <Button className="w-full h-16 bg-gradient-to-r from-gold to-goldHover hover:from-goldHover hover:to-gold text-white font-medium">
                  <div className="flex flex-col items-center gap-1">
                    <Plus className="w-5 h-5" />
                    <span>Mint Tokens</span>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/resumen">
                <Button variant="outline" className="w-full h-16 border-gold text-gold hover:bg-gold hover:text-white">
                  <div className="flex flex-col items-center gap-1">
                    <BarChart3 className="w-5 h-5" />
                    <span>View Summary</span>
                  </div>
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-16 border-slate-300 hover:bg-slate-50">
                <div className="flex flex-col items-center gap-1">
                  <Hotel className="w-5 h-5" />
                  <span>Manage Rooms</span>
                </div>
              </Button>
              <Button variant="outline" className="w-full h-16 border-slate-300 hover:bg-slate-50">
                <div className="flex flex-col items-center gap-1">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </div>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/comprar">
                <Button className="w-full h-16 bg-gradient-to-r from-gold to-goldHover hover:from-goldHover hover:to-gold text-white font-medium">
                  <div className="flex flex-col items-center gap-1">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Buy Tokens</span>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/rooms">
                <Button variant="outline" className="w-full h-16 border-gold text-gold hover:bg-gold hover:text-white">
                  <div className="flex flex-col items-center gap-1">
                    <Eye className="w-5 h-5" />
                    <span>View Rooms</span>
                  </div>
                </Button>
              </Link>
              <Link href="/dashboard/buy">
                <Button variant="outline" className="w-full h-16 border-slate-300 hover:bg-slate-50">
                  <div className="flex flex-col items-center gap-1">
                    <Coins className="w-5 h-5" />
                    <span>Wholesale</span>
                  </div>
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Room Gallery */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Room Categories</h2>
            <p className="text-slate-600">
              {isAdmin ? "Manage your hotel room inventory" : "Explore available investment opportunities"}
            </p>
          </div>
          <Link href="/dashboard/rooms">
            <Button variant="ghost" className="text-gold hover:text-goldHover group">
              View All
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roomTypes.map((room) => (
            <Card
              key={room.id}
              className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group overflow-hidden bg-white"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={room.image || "/placeholder.svg"}
                  alt={room.name}
                  width={400}
                  height={250}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Badge className="bg-white/95 text-slate-900 hover:bg-white shadow-lg">
                    {room.available} available
                  </Badge>
                  {isAdmin && (
                    <Badge variant="secondary" className="bg-slate-900/80 text-white">
                      {room.totalRooms} total
                    </Badge>
                  )}
                </div>

                {/* Rating */}
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-1 bg-white/95 rounded-full px-3 py-1.5 shadow-lg">
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <span className="text-sm font-semibold text-slate-900">{room.rating}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-gold transition-colors">
                    {room.name}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{room.description}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {room.features.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-900">{room.price}</span>
                    <span className="text-sm text-slate-600">ETH/token</span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gold hover:bg-goldHover text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isAdmin ? "Manage" : "Invest"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-600" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? "Latest transactions and bookings across all properties"
              : "Your recent transactions and activities"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === "booking"
                        ? "bg-blue-100 text-blue-600"
                        : activity.type === "mint"
                          ? "bg-gold/20 text-gold"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {activity.type === "booking" ? (
                      <Calendar className="w-5 h-5" />
                    ) : activity.type === "mint" ? (
                      <Coins className="w-5 h-5" />
                    ) : (
                      <ShoppingCart className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{activity.action}</p>
                    <p className="text-sm text-slate-600">{activity.room}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gold">{activity.amount}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
