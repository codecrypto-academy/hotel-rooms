"use client"

import type React from "react"

import { useState, useMemo, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Wallet,
    Calendar,
    Building,
    DollarSign,
    TrendingUp,
    Filter,
    Search,
    Star,
    CheckCircle,
    AlertCircle,
    Package,
    BarChart3,
    CreditCard
} from "lucide-react"
import { useWeb3 } from "@/context/Web3Context"
import { getContractABI, getContractAddress } from "@/lib/contract"
import { RoomStatus, RoomType, RoomDay, EnrichedRoomDay, Metadata } from "@/lib/types"
import Image from 'next/image'

interface RawRoom {
  roomId: string | number | bigint
  date: string | number | bigint
  year: number
  month: number
  day: number
  roomType: number
  pricePerNight: string | number | bigint
  status: number
  tokenId: string | number | bigint
  owner: string
}

const roomTypes = [
    { id: RoomType.STANDARD, name: "Standard Room", basePrice: 0.08, expectedReturn: 15 },
    { id: RoomType.DELUXE, name: "Deluxe Suite", basePrice: 0.15, expectedReturn: 18 },
    { id: RoomType.SUITE, name: "Presidential Suite", basePrice: 0.35, expectedReturn: 22 },
]

const roomTypeNames: Record<RoomType, string> = {
    [RoomType.STANDARD]: "Standard Room",
    [RoomType.DELUXE]: "Deluxe Suite",
    [RoomType.SUITE]: "Presidential Suite",
    [RoomType.ALL]: "All Room Types"
}

const roomTypeConfig = {
    [RoomType.ALL]: {
        name: "Standard",
        color: "bg-blue-500",
        lightColor: "bg-blue-50",
        textColor: "text-blue-700",
        icon: Building,
    },
    [RoomType.STANDARD]: {
        name: "Standard",
        color: "bg-blue-500",
        lightColor: "bg-blue-50",
        textColor: "text-blue-700",
        icon: Building,
    },
    [RoomType.DELUXE]: {
        name: "Deluxe",
        color: "bg-purple-500",
        lightColor: "bg-purple-50",
        textColor: "text-purple-700",
        icon: Star,
    },
    [RoomType.SUITE]: {
        name: "Suite",
        color: "bg-gradient-to-r from-yellow-500 to-yellow-600",
        lightColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        icon: Package,
    },
}

const statusConfig = {
    [RoomStatus.ALL]: {
        name: "Available",
        color: "bg-green-500",
        textColor: "text-green-700",
        bgColor: "bg-green-50",
        icon: CheckCircle,
    },
    [RoomStatus.AVAILABLE]: {
        name: "Available",
        color: "bg-green-500",
        textColor: "text-green-700",
        bgColor: "bg-green-50",
        icon: CheckCircle,
    },
    [RoomStatus.BOOKED]: {
        name: "Booked",
        color: "bg-orange-500",
        textColor: "text-orange-700",
        bgColor: "bg-orange-50",
        icon: Calendar,
    },
    [RoomStatus.USED]: {
        name: "Used",
        color: "bg-gray-500",
        textColor: "text-gray-700",
        bgColor: "bg-gray-50",
        icon: CheckCircle,
    },
}

export default function MisTokens() {
    const [roomDays, setRoomDays] = useState<EnrichedRoomDay[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>("")
    const [dataLoaded, setDataLoaded] = useState(false)

    const { account, provider } = useWeb3()

    const parseRoomDay = (rawRoom: RawRoom): RoomDay | null => {
        try {
            return {
                roomId: BigInt(rawRoom.roomId?.toString() || "0"),
                date: BigInt(rawRoom.date?.toString() || "0"),
                year: Number(rawRoom.year || 0),
                month: Number(rawRoom.month || 0),
                day: Number(rawRoom.day || 0),
                roomType: Number(rawRoom.roomType || 0) as RoomType,
                pricePerNight: BigInt(rawRoom.pricePerNight?.toString() || "0"),
                status: Number(rawRoom.status || 0) as RoomStatus,
                tokenId: BigInt(rawRoom.tokenId?.toString() || "0"),
                owner: rawRoom.owner?.toString() || ""
            }
        } catch (error) {
            console.warn("Failed to parse room data:", error, rawRoom)
            return null
        }
    }

    const fetchMetadata = async (tokenId: bigint): Promise<Metadata | null> => {
        try {
            const response = await fetch(`/api/metadata?tokenId=${tokenId.toString()}`)
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }
            const metadata = await response.json()
            return metadata
        } catch (error) {
            console.warn(`Metadata fetch failed for tokenId: ${tokenId.toString()}`, error)
            return null
        }
    }

    const fetchUserTokens = useCallback(async () => {
        if (!provider || !account) {
            setError("Web3 provider or account not available")
            return
        }

        try {
            setLoading(true)
            setError("")

            const contractAddress = await getContractAddress()
            const abi = await getContractABI()
            const contract = new ethers.Contract(contractAddress, abi, provider)

            // Fetch all room days and filter by owner
            const allRooms: RawRoom[] = await contract.getAllRoomDays(0, 1000)

            // Parse and filter rooms owned by current account
            const parsedRooms = allRooms
                .map(parseRoomDay)
                .filter((room): room is RoomDay => room !== null)
                .filter((room) => room.owner.toLowerCase() === account.toLowerCase())

            // Enrich with metadata
            const enrichedRooms: EnrichedRoomDay[] = await Promise.all(
                parsedRooms.map(async (room): Promise<EnrichedRoomDay> => {
                    const metadata = await fetchMetadata(room.tokenId)
                    return { ...room, metadata: metadata ?? undefined }
                })
            )

            setRoomDays(enrichedRooms)
            setDataLoaded(true)
        } catch (error) {
            console.error("Error fetching user tokens:", error)
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
            setError(`Error fetching tokens: ${errorMessage}`)
        } finally {
            setLoading(false)
        }
    }, [provider, account])

    // Load user tokens on component mount and when account changes
    useEffect(() => {
        if (account && provider) {
            fetchUserTokens()
        }
    }, [account, provider, fetchUserTokens])

    // Portfolio statistics
    const portfolioStats = useMemo(() => {
        const totalTokens = roomDays.length
        const totalValue = roomDays.reduce((acc, room) => acc + Number(ethers.formatEther(room.pricePerNight)), 0)
        const availableTokens = roomDays.filter((room) => room.status === RoomStatus.AVAILABLE).length
        const usedTokens = roomDays.filter((room) => room.status === RoomStatus.USED).length
        const bookedTokens = roomDays.filter((room) => room.status === RoomStatus.BOOKED).length

        const roomTypeBreakdown = roomDays.reduce(
            (acc, room) => {
                acc[room.roomType] = (acc[room.roomType] || 0) + 1
                return acc
            },
            {} as Record<RoomType, number>,
        )

        // Calculate estimated returns
        const estimatedReturns = roomDays.reduce((acc, room) => {
            const roomTypeInfo = roomTypes.find(rt => rt.id === room.roomType)
            const returnRate = roomTypeInfo?.expectedReturn || 15
            const roomValue = Number(ethers.formatEther(room.pricePerNight))
            return acc + (roomValue * returnRate) / 100
        }, 0)

        return {
            totalTokens,
            totalValue,
            availableTokens,
            usedTokens,
            bookedTokens,
            roomTypeBreakdown,
            estimatedReturns,
        }
    }, [roomDays])

    // Filtered rooms
    const filteredRooms = useMemo(() => {
        return roomDays.filter((room) => {
            const matchesSearch =
                searchTerm === "" ||
                room.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                room.roomId.toString().includes(searchTerm) ||
                room.tokenId.toString().includes(searchTerm)

            const matchesStatus = statusFilter === "all" || room.status.toString() === statusFilter

            const matchesRoomType = roomTypeFilter === "all" || room.roomType.toString() === roomTypeFilter

            return matchesSearch && matchesStatus && matchesRoomType
        })
    }, [roomDays, searchTerm, statusFilter, roomTypeFilter])

    const handleSpendToken = async (tokenId: bigint) => {
        if (!provider) {
            setError("Web3 provider not available")
            return
        }

        try {
            setLoading(true)
            setError("")

            const signer = await provider.getSigner()
            const contractAddress = await getContractAddress()
            const abi = await getContractABI()
            const contract = new ethers.Contract(contractAddress, abi, signer)

            // Execute the use token transaction
            const tx = await contract.setToUsed(Number(tokenId))
            await tx.wait()

            // Update local state
            setRoomDays((prev) =>
                prev.map((room) => (room.tokenId === tokenId ? { ...room, status: RoomStatus.USED } : room)),
            )

            alert("Token successfully used!")
        } catch (error) {
            console.error("Error using token:", error)
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
            setError(`Error using token: ${errorMessage}`)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (timestamp: bigint): string => {
        try {
            return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            })
        } catch (error) {
            console.warn("Error formatting date:", error)
            return "Invalid Date"
        }
    }

    const formatPrice = (pricePerNight: bigint): string => {
        try {
            return Number(ethers.formatEther(pricePerNight)).toFixed(4)
        } catch (error) {
            console.warn("Error formatting price:", error)
            return "0.0000"
        }
    }

    const getRoomTypeName = (roomType: RoomType): string => {
        return roomTypeNames[roomType] || "Unknown Type"
    }

    return (
        <div className="container space-y-8 py-6 p-6 mx-auto">
            {/* Header */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 flex flex-col gap-4">
                    {/* Header Row */}
                    <div className="flex items-center justify-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-gold to-goldHover rounded-xl flex items-center justify-center shadow-md">
                            <Wallet className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                My Token Portfolio
                            </h1>
                            <p className="text-sm text-slate-600">
                                Manage and track your hotel room tokens
                            </p>
                        </div>
                    </div>

                    {/* Connection Status */}
                    {/* 
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${account ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-slate-600">
              {account
                ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
                : 'Not connected to wallet'}
            </span>
            {account && (
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUserTokens}
                disabled={loading}
                className="ml-auto"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
            */}
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Portfolio Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Tokens</p>
                                <p className="text-2xl font-bold text-slate-900">{portfolioStats.totalTokens}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Package className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Portfolio Value</p>
                                <p className="text-2xl font-bold text-green-600">{portfolioStats.totalValue.toFixed(4)} ETH</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Available</p>
                                <p className="text-2xl font-bold text-emerald-600">{portfolioStats.availableTokens}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Booked</p>
                                <p className="text-2xl font-bold text-orange-600">{portfolioStats.bookedTokens}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Est. Returns</p>
                                <p className="text-2xl font-bold text-purple-600">{portfolioStats.estimatedReturns.toFixed(4)} ETH</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-slate-600" />
                        Filter & Search
                    </CardTitle>
                    <CardDescription>Filter your token collection by status, type, or search</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                placeholder="Search tokens..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="0">Available</SelectItem>
                                <SelectItem value="1">Booked</SelectItem>
                                <SelectItem value="2">Used</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by room type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Room Types</SelectItem>
                                <SelectItem value="0">Standard Room</SelectItem>
                                <SelectItem value="1">Deluxe Suite</SelectItem>
                                <SelectItem value="2">Presidential Suite</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{filteredRooms.length} tokens found</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Token Grid */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-slate-600" />
                        Your Room Tokens ({filteredRooms.length})
                    </CardTitle>
                    <CardDescription>View and manage your room token collection</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && !dataLoaded ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center space-y-4">
                            <Image
                              src="/images/logo.png"
                              alt="Hotel California Logo"
                              width={48}
                              height={48}
                              className="mx-auto animate-spin slow-spin"
                            />
                            <p className="text-slate-600">Loading your tokens...</p>
                          </div>
                        </div>
                    ) : !account ? (
                        <div className="text-center py-12">
                            <Wallet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Connect your wallet</h3>
                            <p className="text-slate-600">Please connect your wallet to view your token portfolio.</p>
                        </div>
                    ) : filteredRooms.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No tokens found</h3>
                            <p className="text-slate-600">
                                {dataLoaded
                                    ? "You don't have any room tokens yet, or try adjusting your search criteria."
                                    : "Loading your tokens..."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredRooms.map((room) => {
                                const roomTypeInfo = roomTypeConfig[room.roomType]
                                const statusInfo = statusConfig[room.status]
                                const RoomIcon = roomTypeInfo.icon
                                const StatusIcon = statusInfo.icon
                                const roomTypeName = getRoomTypeName(room.roomType)
                                const roomTypeDetails = roomTypes.find(rt => rt.id === room.roomType)

                                return (
                                    <Card
                                        key={room.tokenId.toString()}
                                        className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
                                    >
                                        <div className="relative">
                                            {room.metadata?.image ? (
                                                <Image
                                                    src={room.metadata.image}
                                                    alt={room.metadata.name || "Room"}
                                                    width={640} // or any fixed width you want
                                                    height={160} // proportionate height
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        const img = e.target as HTMLImageElement
                                                        img.style.display = 'none'
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                                    <RoomIcon className="w-12 h-12 text-slate-400" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <Badge className={`${roomTypeInfo.color} text-white`}>
                                                    <RoomIcon className="w-3 h-3 mr-1" />
                                                    {roomTypeInfo.name}
                                                </Badge>
                                            </div>
                                            <div className="absolute top-4 right-4">
                                                <Badge className={`${statusInfo.color} text-white`}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {statusInfo.name}
                                                </Badge>
                                            </div>
                                            <div className="absolute bottom-4 left-4">
                                                <Badge className="bg-black/70 text-white">Token #{room.tokenId.toString()}</Badge>
                                            </div>
                                        </div>

                                        <CardContent className="p-4 space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-slate-900">
                                                    {room.metadata?.name || `Room ${room.roomId.toString()}`}
                                                </h4>
                                                <p className="text-sm text-slate-600">Room #{room.roomId.toString()}</p>
                                                <p className="text-xs text-slate-500">{roomTypeName}</p>
                                                {room.metadata?.description && (
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                        {room.metadata.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-600">Date:</span>
                                                    <span className="font-medium">{formatDate(room.date)}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-600">Value:</span>
                                                    <span className="font-bold text-green-600">
                                                        {formatPrice(room.pricePerNight)} ETH
                                                    </span>
                                                </div>
                                                {roomTypeDetails && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-600">Expected ROI:</span>
                                                        <span className="font-medium text-blue-600">
                                                            {roomTypeDetails.expectedReturn}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Display metadata attributes */}
                                            {room.metadata?.attributes && room.metadata.attributes.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {room.metadata.attributes.slice(0, 3).map((attr, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs">
                                                            {attr.trait_type ? `${attr.trait_type}: ${attr.value}` : attr.value}
                                                        </Badge>
                                                    ))}
                                                    {room.metadata.attributes.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{room.metadata.attributes.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex gap-2 pt-2">
                                                {room.status === RoomStatus.BOOKED && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-500 text-white"
                                                            >
                                                                <CreditCard className="w-4 h-4 mr-2" />
                                                                Use Token
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Use Token</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to use this token for {room.metadata?.name || `Room ${room.roomId.toString()}`}?
                                                                    This action cannot be undone and will mark the token as used.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleSpendToken(room.tokenId)}
                                                                    disabled={loading}
                                                                    className="bg-red-500 hover:bg-red-600"
                                                                >
                                                                    {loading ? "Processing..." : "Use Token"}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Investment Summary */}
            {portfolioStats.totalTokens > 0 && (
                <Card className="text-center backdrop-blur-sm bg-white/5 rounded-2xl p-4 border border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            Portfolio Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-slate-900">{portfolioStats.totalTokens}</div>
                                <div className="text-sm text-slate-600">Total Tokens</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {portfolioStats.totalValue.toFixed(4)} ETH
                                </div>
                                <div className="text-sm text-slate-600">Portfolio Value</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {portfolioStats.estimatedReturns.toFixed(4)} ETH
                                </div>
                                <div className="text-sm text-slate-600">Estimated Annual Returns</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {portfolioStats.totalValue > 0
                                        ? ((portfolioStats.estimatedReturns / portfolioStats.totalValue) * 100).toFixed(1)
                                        : "0"
                                    }%
                                </div>
                                <div className="text-sm text-slate-600">Avg. Expected ROI</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
