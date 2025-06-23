'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Building, 
  Star, 
  Package, 
  CalendarCheck, 
  Copy, 
  AlertTriangle 
} from "lucide-react"
import { getContractABI, getContractAddress } from '@/lib/contract'
import { ethers } from 'ethers'
import { useWeb3 } from '@/context/Web3Context'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import Image from 'next/image'

// Room type configuration with prices
const roomTypes = [
  { id: 0, name: "Standard Room", price: "0.08", color: "bg-blue-500", icon: Building },
  { id: 1, name: "Deluxe Suite", price: "0.15", color: "bg-purple-500", icon: Star },
  { id: 2, name: "Presidential Suite", price: "0.35", color: "bg-yellow-500", icon: Package },
]

// Status configuration (only showing available rooms to clients)
const statusConfig = {
  0: { label: 'Disponible', color: 'bg-green-500', icon: CalendarCheck },
  1: { label: 'Reservado', color: 'bg-yellow-500', icon: CalendarCheck },
  2: { label: 'Mantenimiento', color: 'bg-red-500', icon: CalendarCheck },
  3: { label: 'Ocupado', color: 'bg-gray-500', icon: CalendarCheck },
} as const

interface RoomDay {
  tokenId: bigint
  roomId: bigint
  year: number
  month: number
  day: number
  status: number
  roomType: number
  pricePerNight: bigint
  owner: string
}

interface LoadingState {
  isLoading: boolean
  error: string | null
}

export default function AvailableRoomsPage() {
  const [roomDays, setRoomDays] = useState<RoomDay[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })
  const { provider, account } = useWeb3()
  const router = useRouter()

  // Helper to get room type configuration
  const getRoomTypeConfig = useCallback((roomType: number) => {
    return roomTypes.find(type => type.id === roomType) || null
  }, [])

  // Helper to get status configuration
  const getStatusConfig = useCallback((status: number) => {
    return statusConfig[status as keyof typeof statusConfig] || null
  }, [])

  // Copy token ID to clipboard
  const copyTokenId = useCallback(async (tokenId: string) => {
    try {
      await navigator.clipboard.writeText(tokenId)
      console.log('Token ID copied:', tokenId)
    } catch (error) {
      console.error('Failed to copy token ID:', error)
      console.error('Failed to copy token ID')
    }
  }, [])

  // Parse contract room data
  const parseContractRoomDay = useCallback((room: any): RoomDay => {
    try {
      return {
        tokenId: BigInt(room.tokenId),
        roomId: BigInt(room.roomId),
        year: Number(room.year),
        month: Number(room.month),
        day: Number(room.day),
        status: Number(room.status),
        roomType: Number(room.roomType),
        pricePerNight: BigInt(room.pricePerNight),
        owner: room.owner,
      }
    } catch (error) {
      console.error('Error parsing room data:', error, room)
      throw new Error(`Failed to parse room data for token ${room.tokenId}`)
    }
  }, [])

  // Fetch available rooms
  const fetchAvailableRooms = useCallback(async () => {
    if (!provider) {
      setLoadingState({ isLoading: false, error: 'No wallet connection' })
      return
    }

    setLoadingState({ isLoading: true, error: null })

    try {
      const contractAddress = await getContractAddress()
      const abi = await getContractABI()
      
      if (!contractAddress || !abi) {
        throw new Error('Contract configuration not available')
      }

      const contract = new ethers.Contract(contractAddress, abi, provider)
      
      // Get all room days (you might want to filter for available only)
      const roomDaysRaw = await contract.getAllRoomDays(0, 100)
      
      if (!Array.isArray(roomDaysRaw)) {
        throw new Error('Invalid room data format received from contract')
      }

      const parsed = roomDaysRaw
        .map(parseContractRoomDay)
        .filter(room => room.status === 0) // Only show available rooms
        .sort((a, b) => {
          // Sort by date first, then by room type
          if (a.year !== b.year) return a.year - b.year
          if (a.month !== b.month) return a.month - b.month
          if (a.day !== b.day) return a.day - b.day
          return a.roomType - b.roomType
        })

      setRoomDays(parsed)
      setLoadingState({ isLoading: false, error: null })
    } catch (error) {
      console.error('Error fetching room data:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error desconocido al cargar las habitaciones'
      setLoadingState({ isLoading: false, error: errorMessage })
    }
  }, [provider, parseContractRoomDay])

  useEffect(() => {
    fetchAvailableRooms()
  }, [fetchAvailableRooms])

  // Render room type badge
  const renderRoomTypeBadge = (roomType: number) => {
    const config = getRoomTypeConfig(roomType)
    if (!config) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Tipo Desconocido
        </Badge>
      )
    }

    const Icon = config.icon
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.name}
      </Badge>
    )
  }

  // Render status badge
  const renderStatusBadge = (status: number) => {
    const config = getStatusConfig(status)
    if (!config) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Estado Desconocido
        </Badge>
      )
    }

    const Icon = config.icon
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  // Get price from room type configuration
  const getRoomPrice = (roomType: number): string => {
    const config = getRoomTypeConfig(roomType)
    return config ? `${config.price} ETH` : 'Price N/A'
  }

  // Format date
  const formatRoomDate = (year: number, month: number, day: number): string => {
    try {
      const date = new Date(year, month - 1, day)
      return format(date, 'PPP')
    } catch (error) {
      console.error('Error formatting date:', error)
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    }
  }

  // Loading state
  if (loadingState.isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Habitaciones Disponibles</CardTitle>
            <CardDescription>
              Encuentra y reserva tu habitación perfecta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
             <div className="text-center space-y-4">
              <Image
                src="/images/logo.png"
                alt="Hotel California Logo"
                width={48}
                height={48}
                className="mx-auto animate-spin slow-spin"
              />
              <span>Cargando habitaciones disponibles...</span>
             </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (loadingState.error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Habitaciones Disponibles</CardTitle>
            <CardDescription>
              Encuentra y reserva tu habitación perfecta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {loadingState.error}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={fetchAvailableRooms} 
              className="mt-4"
              variant="outline"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Habitaciones Disponibles</CardTitle>
          <CardDescription>
            Encuentra y reserva tu habitación perfecta ({roomDays.length} habitaciones disponibles)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roomDays.length === 0 ? (
            <div className="text-center py-8">
              <CalendarCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No hay habitaciones disponibles
              </p>
              <p className="text-sm text-muted-foreground">
                Vuelve a intentarlo más tarde o contacta con nosotros
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo de Habitación</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomDays.map((room) => (
                    <TableRow 
                      key={room.tokenId.toString()}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {room.tokenId.toString()}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyTokenId(room.tokenId.toString())}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatRoomDate(room.year, room.month, room.day)}
                      </TableCell>
                      <TableCell>
                        {renderRoomTypeBadge(room.roomType)}
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        {getRoomPrice(room.roomType)}
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(room.status)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => router.push(`/dashboard/comprar?tokenId=${room.tokenId.toString()}`)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Reservar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
