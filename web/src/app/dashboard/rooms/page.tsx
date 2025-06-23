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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getContractABI, getContractAddress } from '@/lib/contract'
import { ethers } from 'ethers'
import { useWeb3 } from '@/context/Web3Context'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { RoomDay, RoomStatus, RoomType } from '@/lib/types'
import {
  Calendar,
  Package,
  Star,
  Building,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import Image from 'next/image'

// Type-safe room type configuration
const roomTypeConfig: Partial<Record<RoomStatus, {
  name: string
  color: string
  textColor: string
  icon: React.ComponentType<{ className?: string }>
}>> = {
  [RoomType.STANDARD]: {
    name: "Standard",
    color: "bg-blue-500",
    textColor: "text-blue-700",
    icon: Building,
  },
  [RoomType.DELUXE]: {
    name: "Deluxe",
    color: "bg-purple-500",
    textColor: "text-purple-700",
    icon: Star,
  },
  [RoomType.SUITE]: {
    name: "Suite",
    color: "bg-gradient-to-r from-yellow-500 to-yellow-600",
    textColor: "text-yellow-700",
    icon: Package,
  },
}

// Type-safe room status configuration
const statusConfig: Partial<Record<RoomStatus, {
  name: string
  color: string
  textColor: string
  icon: React.ComponentType<{ className?: string }>
}>> = {
  [RoomStatus.AVAILABLE]: {
    name: "Available",
    color: "bg-green-500",
    textColor: "text-green-700",
    icon: CheckCircle,
  },
  [RoomStatus.BOOKED]: {
    name: "Booked",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    icon: Calendar,
  },
  [RoomStatus.USED]: {
    name: "Used",
    color: "bg-gray-500",
    textColor: "text-gray-700",
    icon: CheckCircle,
  },
}

// Loading state type
interface LoadingState {
  isLoading: boolean
  error: string | null
}

// Contract room data type (raw from contract)
interface ContractRoomDay {
  roomId: bigint | string
  tokenId: bigint | string
  date: bigint | string
  year: number | bigint
  month: number | bigint
  day: number | bigint
  roomType: number | bigint
  pricePerNight: bigint | string
  status: number | bigint
  owner: string
}

export default function RoomsPage() {
  const [roomDays, setRoomDays] = useState<RoomDay[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  })
  const { provider, account } = useWeb3()
  const router = useRouter()

  // Helper function to safely convert BigInt/string to BigInt
  const toBigInt = useCallback((value: bigint | string | number): bigint => {
    if (typeof value === 'bigint') return value
    if (typeof value === 'string') return BigInt(value)
    if (typeof value === 'number') return BigInt(value)
    throw new Error(`Cannot convert ${typeof value} to BigInt`)
  }, [])

  // Helper function to safely convert to number
  const toNumber = useCallback((value: number | bigint | string): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'bigint') return Number(value)
    if (typeof value === 'string') return Number(value)
    throw new Error(`Cannot convert ${typeof value} to number`)
  }, [])

  // Parse raw contract data with proper error handling
  const parseContractRoomDay = useCallback((room: ContractRoomDay): RoomDay => {
    try {
      return {
        roomId: toBigInt(room.roomId),
        tokenId: toBigInt(room.tokenId),
        date: toBigInt(room.date),
        year: toNumber(room.year),
        month: toNumber(room.month),
        day: toNumber(room.day),
        roomType: toNumber(room.roomType) as RoomType,
        pricePerNight: toBigInt(room.pricePerNight),
        status: toNumber(room.status) as RoomStatus,
        owner: room.owner,
      }
    } catch (error) {
      console.error('Error parsing room data:', error, room)
      throw new Error(`Failed to parse room data for token ${room.tokenId}`)
    }
  }, [toBigInt, toNumber])

  // Fetch room days with proper error handling
  const fetchRoomDays = useCallback(async () => {
    if (!provider || !account) {
      router.push('/')
      return
    }

    setLoadingState({ isLoading: true, error: null })

    try {
      const signer = await provider.getSigner()
      const contractAddress = await getContractAddress()
      const abi = await getContractABI()
      
      if (!contractAddress || !abi) {
        throw new Error('Contract configuration not available')
      }

      const contract = new ethers.Contract(contractAddress, abi, signer)
      
      // Get room days with error handling
      const roomDaysRaw: ContractRoomDay[] = await contract.getAllRoomDays(0, 50)
      
      if (!Array.isArray(roomDaysRaw)) {
        throw new Error('Invalid room data format received from contract')
      }

      const parsed = roomDaysRaw.map(parseContractRoomDay)
      setRoomDays(parsed)
      setLoadingState({ isLoading: false, error: null })
    } catch (error) {
      console.error('Error fetching room data:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred while fetching room data'
      setLoadingState({ isLoading: false, error: errorMessage })
    }
  }, [provider, account, router, parseContractRoomDay])

  useEffect(() => {
    fetchRoomDays()
  }, [fetchRoomDays])

  // Render room type badge with type safety
  const renderRoomTypeBadge = (roomType: RoomType) => {
    const config = roomTypeConfig[roomType]
    if (!config) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Unknown Type
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

  // Render room status badge with type safety
  const renderStatusBadge = (status: RoomStatus) => {
    const config = statusConfig[status]
    if (!config) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Unknown Status
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

  // Format price with error handling
  const formatPrice = (pricePerNight: bigint): string => {
    try {
      return `${ethers.formatEther(pricePerNight)} ETH`
    } catch (error) {
      console.error('Error formatting price:', error)
      return 'Invalid Price'
    }
  }

  // Format owner address for display
  const formatOwnerAddress = (address: string): string => {
    if (!address || typeof address !== 'string') return 'Invalid Address'
    if (address.length < 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Render loading state
  if (loadingState.isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Habitaciones</CardTitle>
            <CardDescription>
              Vista general de las habitaciones disponibles
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

  // Render error state
  if (loadingState.error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Habitaciones</CardTitle>
            <CardDescription>
              Vista general de las habitaciones disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Error al cargar las habitaciones: {loadingState.error}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Habitaciones</CardTitle>
          <CardDescription>
            Vista general de las habitaciones disponibles ({roomDays.length} habitaciones)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roomDays.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay habitaciones disponibles
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token ID</TableHead>
                    <TableHead>Room ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Dueño</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomDays.map((room) => (
                    <TableRow key={room.tokenId.toString()}>
                      <TableCell className="font-mono">
                        {room.tokenId.toString()}
                      </TableCell>
                      <TableCell>{room.roomId.toString()}</TableCell>
                      <TableCell>
                        {formatDate(Number(room.date))}
                      </TableCell>
                      <TableCell>
                        {renderRoomTypeBadge(room.roomType)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatPrice(room.pricePerNight)}
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(room.status)}
                      </TableCell>
                      <TableCell 
                        className="font-mono truncate max-w-xs" 
                        title={room.owner}
                      >
                        {formatOwnerAddress(room.owner)}
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
