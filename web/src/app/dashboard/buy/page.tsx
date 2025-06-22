"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { ethers } from "ethers"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Calendar as CalendarIcon,
  TrendingUp,
  Package,
  DollarSign,
  Search,
  ShoppingCart,
  BarChart3,
  Clock,
  Star,
  Building,
  Percent,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useWeb3 } from "@/context/Web3Context";
import { getContractABI, getContractAddress } from "@/lib/contract";
import { RoomStatus, RoomType, RoomDay, EnrichedRoomDay } from "@/lib/types";

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

export default function WholesaleBuyPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [rooms, setRooms] = useState<EnrichedRoomDay[]>([])
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [error, setError] = useState<string>("")

  const { account, provider } = useWeb3()

  const parseRoomDay = (rawRoom: any): RoomDay | null => {
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

  const searchRooms = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) {
      setError("Please select both start and end dates")
      return
    }

    if (!provider) {
      setError("Web3 provider not available")
      return
    }

    try {
      setLoading(true)
      setError("")
      setSearchPerformed(true)

      const signer = await provider.getSigner()
      const contractAddress = await getContractAddress()
      const abi = await getContractABI()
      const contract = new ethers.Contract(contractAddress, abi, provider)

      // Fetch all room days from contract
      const allRooms: any[] = await contract.getAllRoomDays(0, 100)

      const startTimestamp = Math.floor(startDate.getTime() / 1000)
      const endTimestamp = Math.floor(endDate.getTime() / 1000)

      // Parse and filter rooms
      const parsedRooms = allRooms
        .map(parseRoomDay)
        .filter((room): room is RoomDay => room !== null)

      let filteredRooms = parsedRooms.filter((room) => {
        const roomDate = Number(room.date)
        const roomStatus = room.status
        return (
          roomStatus === RoomStatus.AVAILABLE &&
          roomDate >= startTimestamp &&
          roomDate <= endTimestamp
        )
      })

      // Apply room type filter
      if (selectedRoomType !== "all") {
        const typeEnum = Number(selectedRoomType) as RoomType
        filteredRooms = filteredRooms.filter(room => room.roomType === typeEnum)
      }

      // Apply price filters
      if (minPrice) {
        const minPriceWei = ethers.parseEther(minPrice)
        filteredRooms = filteredRooms.filter(room => room.pricePerNight >= minPriceWei)
      }

      if (maxPrice) {
        const maxPriceWei = ethers.parseEther(maxPrice)
        filteredRooms = filteredRooms.filter(room => room.pricePerNight <= maxPriceWei)
      }

      // Enrich with metadata
      const enrichedRooms: EnrichedRoomDay[] = await Promise.all(
        filteredRooms.map(async (room): Promise<EnrichedRoomDay> => {
          const metadata = await fetchMetadata(room.tokenId)
          return { ...room, metadata }
        })
      )

      setRooms(enrichedRooms)
    } catch (error) {
      console.error("Error fetching rooms:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(`Error fetching rooms: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleRoomSelection = (tokenId: string) => {
    const newSelected = new Set(selectedRooms)
    if (newSelected.has(tokenId)) {
      newSelected.delete(tokenId)
    } else {
      newSelected.add(tokenId)
    }
    setSelectedRooms(newSelected)
  }

  const selectAllRooms = () => {
    if (selectedRooms.size === rooms.length) {
      setSelectedRooms(new Set())
    } else {
      setSelectedRooms(new Set(rooms.map((room) => room.tokenId.toString())))
    }
  }

  const selectedRoomData = rooms.filter((room) => selectedRooms.has(room.tokenId.toString()))

  const investmentSummary = useMemo(() => {
    const totalInvestment = selectedRoomData.reduce(
      (acc, room) => acc + Number(ethers.formatEther(room.pricePerNight)),
      0,
    )

    const roomTypeBreakdown = selectedRoomData.reduce(
      (acc, room) => {
        const type = room.roomType
        const typeName = roomTypeNames[type]
        if (!acc[typeName]) {
          acc[typeName] = { count: 0, investment: 0 }
        }
        acc[typeName].count += 1
        acc[typeName].investment += Number(ethers.formatEther(room.pricePerNight))
        return acc
      },
      {} as Record<string, { count: number; investment: number }>,
    )

    const estimatedReturn = Object.entries(roomTypeBreakdown).reduce((acc, [typeName, data]) => {
      const roomTypeInfo = roomTypes.find((rt) => rt.name === typeName)
      const returnRate = roomTypeInfo?.expectedReturn || 15
      return acc + (data.investment * returnRate) / 100
    }, 0)

    return {
      totalInvestment,
      roomTypeBreakdown,
      estimatedReturn,
      totalRooms: selectedRoomData.length,
    }
  }, [selectedRoomData])

  const buySelectedRooms = async () => {
    if (!provider || selectedRooms.size === 0) return

    try {
      setLoading(true)
      setError("")

      // Get signer for transaction
      const signer = await provider.getSigner()
      const contractAddress = await getContractAddress()
      const abi = await getContractABI()
      const contract = new ethers.Contract(contractAddress, abi, signer)

      // Prepare token IDs and calculate total value
      const tokenIds = selectedRoomData.map((room) => Number(room.tokenId))
      const totalValue = selectedRoomData.reduce(
        (acc, room) => acc + room.pricePerNight,
        BigInt(0)
      )

      // Execute the transaction
      const tx = await contract.transferRoomDayMultiple(tokenIds, {
        value: totalValue,
      })

      // Wait for transaction confirmation
      await tx.wait()

      alert(
        `Successfully purchased ${selectedRooms.size} room tokens for ${investmentSummary.totalInvestment.toFixed(4)} ETH`
      )
      
      // Reset state after successful purchase
      setSelectedRooms(new Set())
      // Optionally refresh the room list
      searchRooms({ preventDefault: () => {} } as React.FormEvent)
    } catch (error) {
      console.error("Error buying rooms:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(`Error buying rooms: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const getRoomTypeName = (roomType: RoomType): string => {
    return roomTypeNames[roomType] || "Unknown Type"
  }

  const formatPrice = (pricePerNight: bigint): string => {
    try {
      return Number(ethers.formatEther(pricePerNight)).toFixed(4)
    } catch (error) {
      console.warn("Error formatting price:", error)
      return "0.0000"
    }
  }

  const formatDate = (timestamp: bigint): string => {
    try {
      return new Date(Number(timestamp) * 1000).toLocaleDateString()
    } catch (error) {
      console.warn("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Wholesale Investment
            </h1>
            <p className="text-slate-600">Bulk purchase hotel room tokens for maximum returns</p>
          </div>
        </div>
        {/* Connection Status */}
        <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
          <div className={`w-2 h-2 rounded-full ${account ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-slate-600">
            {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected to wallet'}
          </span>
        </div>
      </div>

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

      {/* Search Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-600" />
            Search Available Rooms
          </CardTitle>
          <CardDescription>Find and filter room tokens available for wholesale purchase</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={searchRooms} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-11 justify-between text-left font-normal"
                    >
                      {startDate
                        ? format(startDate, "PPP")
                        : "Select start date"}
                      <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-4 z-50 rounded-xl border shadow-lg bg-white" align="start">
                    <Calendar
                      mode="single"
                      locale={es}
                      selected={startDate}
                      onSelect={setStartDate}
                      className="rounded-lg border shadow-sm"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-11 justify-between text-left font-normal"
                    >
                      {endDate
                        ? format(endDate, "PPP")
                        : "Select end date"}
                      <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-4 z-50 rounded-xl border shadow-lg bg-white" align="start">
                    <Calendar
                      mode="single"
                      locale={es}
                      selected={endDate}
                      onSelect={setEndDate}
                      className="rounded-lg border shadow-sm"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-type">Room Type</Label>
                <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All room types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Room Types</SelectItem>
                    <SelectItem value={RoomType.STANDARD.toString()}>Standard Room</SelectItem>
                    <SelectItem value={RoomType.DELUXE.toString()}>Deluxe Suite</SelectItem>
                    <SelectItem value={RoomType.SUITE.toString()}>Presidential Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price Range (ETH)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    type="number"
                    step="0.01"
                  />
                  <Input
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    type="number"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !startDate || !endDate || !account}
              className="w-full md:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Rooms
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Investment Summary */}
      {selectedRooms.size > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Investment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{investmentSummary.totalRooms}</div>
                <div className="text-sm text-slate-600">Selected Rooms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {investmentSummary.totalInvestment.toFixed(4)} ETH
                </div>
                <div className="text-sm text-slate-600">Total Investment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {investmentSummary.estimatedReturn.toFixed(4)} ETH
                </div>
                <div className="text-sm text-slate-600">Estimated Annual Return</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {investmentSummary.totalInvestment > 0 
                    ? ((investmentSummary.estimatedReturn / investmentSummary.totalInvestment) * 100).toFixed(1)
                    : "0"
                  }%
                </div>
                <div className="text-sm text-slate-600">Expected ROI</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {searchPerformed && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-slate-600" />
                  Available Room Tokens ({rooms.length})
                </CardTitle>
                <CardDescription>Select rooms for bulk purchase</CardDescription>
              </div>
              {rooms.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllRooms}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    {selectedRooms.size === rooms.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Badge variant="secondary">{selectedRooms.size} selected</Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Clock className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
                  <p className="text-slate-600">Searching for available rooms...</p>
                </div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No rooms found</h3>
                <p className="text-slate-600">Try adjusting your search criteria to find available rooms.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((room, i) => {
                    const isSelected = selectedRooms.has(room.tokenId.toString())
                    const roomTypeName = getRoomTypeName(room.roomType)
                    const roomTypeInfo = roomTypes.find((rt) => rt.name === roomTypeName)

                    return (
                      <Card
                        key={room.tokenId.toString()}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          isSelected ? "ring-2 ring-green-500 bg-green-50" : "hover:bg-slate-50"
                        }`}
                        onClick={() => toggleRoomSelection(room.tokenId.toString())}
                      >
                        <CardContent className="p-4 space-y-4">
                          {/* Image from metadata */}
                          {room.metadata?.image && (
                            <img
                              src={room.metadata.image}
                              alt={room.metadata.name ?? `Room ${room.roomId.toString()}`}
                              className="w-full h-40 object-cover rounded-md shadow-sm"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement
                                img.style.display = 'none'
                              }}
                            />
                          )}

                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox checked={isSelected} readOnly />
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
                            </div>
                            <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                              Token #{room.tokenId.toString()}
                            </Badge>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Date:</span>
                              <span className="font-medium">
                                {formatDate(room.date)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Price:</span>
                              <span className="font-bold text-green-600">
                                {formatPrice(room.pricePerNight)} ETH
                              </span>
                            </div>
                            {roomTypeInfo && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-600">Expected ROI:</span>
                                <span className="font-medium text-blue-600">
                                  {roomTypeInfo.expectedReturn}%
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Display metadata attributes */}
                          {room.metadata?.attributes && room.metadata.attributes.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-2">
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
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {selectedRooms.size > 0 && (
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={buySelectedRooms}
                      disabled={loading || !account}
                      size="lg"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500"
                    >
                      {loading ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Purchase {selectedRooms.size} Rooms ({investmentSummary.totalInvestment.toFixed(4)} ETH)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Investment Tips */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Investment Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Maximize Returns</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  Presidential Suites offer the highest ROI at 22% annually
                </li>
                <li className="flex items-start gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Peak season dates (holidays, events) command premium prices
                </li>
                <li className="flex items-start gap-2">
                  <Package className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Bulk purchases of 10+ rooms qualify for additional bonuses
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Risk Management</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  Diversify across different room types and dates
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  Monitor market trends and occupancy rates
                </li>
                <li className="flex items-start gap-2">
                  <Percent className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  Consider seasonal demand patterns in your strategy
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
