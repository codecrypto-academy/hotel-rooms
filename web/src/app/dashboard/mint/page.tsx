"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { useWeb3 } from "@/context/Web3Context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Hotel, Clock } from "lucide-react"
import { ethers } from "ethers"
import { getContractABI, getContractAddress } from "@/lib/contract"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

enum RoomType {
  STANDARD = 0,
  DELUXE = 1,
  SUITE = 2,
}

const roomTypeLabels = {
  [RoomType.STANDARD]: "Standard",
  [RoomType.DELUXE]: "Deluxe",
  [RoomType.SUITE]: "Suite",
}

const roomTypeColors = {
  [RoomType.STANDARD]: "bg-blue-50 text-blue-700 border-blue-200",
  [RoomType.DELUXE]: "bg-purple-50 text-purple-700 border-purple-200",
  [RoomType.SUITE]: "bg-amber-50 text-amber-700 border-amber-200",
}

export default function MintPage() {
  const { provider, account } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    roomIdStart: "",
    roomIdEnd: "",
    price: "",
    roomType: RoomType.STANDARD,
  })

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
    
      const roomStart = Number(formData.roomIdStart)
      const roomEnd = Number(formData.roomIdEnd)
    
      if (!provider || !account || !formData.startDate || !formData.endDate) return
    
      if (isNaN(roomStart) || isNaN(roomEnd)) {
        alert("IDs de habitación deben ser números válidos.")
        return
      }
    
      if (roomStart > 100 || roomEnd > 100) {
        alert("El número máximo de habitación es 100.")
        return
      }
    
      if (roomEnd < roomStart) {
        alert("La habitación final debe ser mayor que la de inicio.")
        return
      }
    
      setIsLoading(true)
      try {
        const signer = await provider.getSigner()
        const contractAddress = await getContractAddress()
        const abi = await getContractABI()
        const contract = new ethers.Contract(contractAddress, abi, signer)
    
        const startTimestamp = formData.startDate.getTime() / 1000
        const endTimestamp = formData.endDate.getTime() / 1000
    
        const tx = await contract.mintMultipleRoomDays(
          formData.roomIdStart,
          formData.roomIdEnd,
          startTimestamp,
          endTimestamp,
          formData.roomType,
          ethers.parseEther(formData.price),
        )
        await tx.wait()
        alert("✅ ¡Habitación minteada con éxito!")
      } catch (error) {
        console.error("Error al mintear:", error)
        alert("❌ Error al mintear la habitación")
      } finally {
        setIsLoading(false)
      }
    }

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const diffTime = Math.abs(formData.endDate.getTime() - formData.startDate.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    return 0
  }

  const calculateRooms = () => {
    if (formData.roomIdStart && formData.roomIdEnd) {
      return Math.abs(Number(formData.roomIdEnd) - Number(formData.roomIdStart)) + 1
    }
    return 0
  }

  const totalTokens = calculateDays() * calculateRooms()

  return (
    <div className="min-h-screen from-slate-50 to-slate-100 p-4">
      <div className="container max-w-2xl mx-auto z-0">
        <Card className="border-0 shadow-lg overflow-visible">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Hotel className="w-5 h-5 text-gold" />
              Tokenizar Habitaciones
            </CardTitle>
            <CardDescription>Configura fechas y precios para tus habitaciones</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Date Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-1">
                <Label htmlFor="startDate">Fecha de inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-11 justify-between text-left font-normal"
                    >
                      {formData.startDate
                        ? format(formData.startDate, "PPP")
                        : "Seleccionar fecha"}
                      <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-4 z-50 rounded-xl border shadow-lg bg-white" align="start">
                  <Calendar
                      mode="single"
                      locale={es}
                      selected={formData.startDate}
                      onSelect={(date) => setFormData({ ...formData, startDate: date! })}
                      className="rounded-lg border shadow-sm text-[30px]"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            
              {/* End Date */}
              <div className="space-y-1">
                <Label htmlFor="startDate">Fecha de fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-11 justify-between text-left font-normal"
                    >
                      {formData.endDate
                        ? format(formData.endDate, "PPP")
                        : "Seleccionar fecha"}
                      <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-4 z-50 rounded-xl border shadow-lg bg-white" align="start">
                  <Calendar
                      mode="single"
                      locale={es}
                      selected={formData.endDate}
                      onSelect={(date) => setFormData({ ...formData, endDate: date! })}
                      className="rounded-lg border shadow-sm text-[30px]"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

              {/* Room Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>ID Habitación Inicio</Label>
                  <Input
                    type="number"
                    className="h-11"
                    placeholder="56"
                    value={formData.roomIdStart}
                    onChange={(e) => setFormData({ ...formData, roomIdStart: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>ID Habitación Fin</Label>
                  <Input
                    type="number"
                    className="h-11"
                    placeholder="74"
                    value={formData.roomIdEnd}
                    onChange={(e) => setFormData({ ...formData, roomIdEnd: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Price and Room Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Precio por noche (ETH)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    className="h-11"
                    placeholder="0.1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Tipo de habitación</Label>
                  <Select
                    value={formData.roomType.toString()}
                    onValueChange={(value) => setFormData({ ...formData, roomType: Number(value) })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={RoomType.STANDARD.toString()}>Standard</SelectItem>
                      <SelectItem value={RoomType.DELUXE.toString()}>Deluxe</SelectItem>
                      <SelectItem value={RoomType.SUITE.toString()}>Suite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Summary */}
              {formData.startDate && formData.endDate && formData.roomIdStart && formData.roomIdEnd && (
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3 text-slate-700 font-medium">
                      <Clock className="w-4 h-4" />
                      Resumen
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Días:</span>
                        <div className="font-semibold">{calculateDays()}</div>
                      </div>
                      <div>
                        <span className="text-slate-600">Habitaciones:</span>
                        <div className="font-semibold">{calculateRooms()}</div>
                      </div>
                      <div>
                        <span className="text-slate-600">Total Tokens:</span>
                        <div className="font-semibold">{totalTokens}</div>
                      </div>
                      <div>
                        <Badge className={roomTypeColors[formData.roomType]}>
                          {roomTypeLabels[formData.roomType]}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!provider || !account || isLoading}
                className="w-full bg-gold hover:bg-goldHover text-white font-medium py-3 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Minteando..." : "Mint Room Tokens"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
