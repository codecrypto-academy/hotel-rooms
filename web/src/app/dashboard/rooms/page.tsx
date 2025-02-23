'use client'

import { useEffect, useState } from 'react'
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
import { getContractABI, getContractAddress } from '@/lib/contract'
import { ethers } from 'ethers'
import { useWeb3 } from '@/context/Web3Context'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

interface RoomDay {
  roomId: bigint;
  date: bigint;
  roomType: number;
  pricePerNight: bigint;
  status: number;
  tokenId: bigint;
  owner: string;
}

const roomTypeMap = {
  0: 'Standard',
  1: 'Deluxe',
  2: 'Suite'
}

const statusMap = {
  0: 'Disponible',
  1: 'Reservado',
  2: 'Mantenimiento',
  3: 'Usado'
}

export default function RoomsPage() {
  const [roomDays, setRoomDays] = useState<RoomDay[]>([])
  const { provider, account } = useWeb3()
  const router = useRouter()

  useEffect(() => {
    if (!provider || !account) {
      router.push('/')
      return
    }
    
    const fetchRoomDays = async () => {
      try {
        const signer = await provider.getSigner()
        const contractAddress = await getContractAddress()
        const abi = await getContractABI()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        
        const roomDays = await contract.getAllRoomDays(0, 50)
        setRoomDays(roomDays)
      } catch (error) {
        console.error('Error fetching room data:', error)
      }
    }

    fetchRoomDays()
  }, [provider, account, router])

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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Dueño</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomDays.map((room, index) => (
                  <TableRow key={index}>
                    <TableCell>{room.roomId.toString()}</TableCell>
                    <TableCell>{formatDate(Number(room.date))}</TableCell>
                    <TableCell>{roomTypeMap[room.roomType as keyof typeof roomTypeMap] || 'Desconocido'}</TableCell>
                    <TableCell>{ethers.formatEther(room.pricePerNight)} ETH</TableCell>
                    <TableCell>{statusMap[room.status as keyof typeof roomTypeMap] || 'Desconocido'}</TableCell>
                    <TableCell className="font-mono">{room.owner}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
};
