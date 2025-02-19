'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RoomType } from '@/lib/types'
import { ethers } from 'ethers'
import { getContractAddress, getContractABI } from '@/lib/contract'
import { useWeb3 } from '@/context/Web3Context'
import { useRouter } from 'next/navigation'
import { RoomStatus } from '@/lib/types'
import { RoomDay } from '@/lib/types'

export default function MisTokens() {
  const [roomDays, setRoomDays] = useState<RoomDay[]>([])
  const { account, provider } =  useWeb3();
  const router = useRouter();
  useEffect(() => {
    const loadRoomDays = async () => {
      if (!provider) {
        
        return
      }
      
      const contractAddress = await getContractAddress();
      const abi = await getContractABI();
      const contract = new ethers.Contract(contractAddress, abi, provider);
      console.log(account)
     
       try {
         const rooms = await contract.getRoomDayFilter(
           account,
           RoomStatus.ALL,
           RoomType.ALL,
           0,  
           0,  
           0   
         )
         
         setRoomDays(rooms)
       } catch (error) {
         console.error('Error loading room days:', error)
       }
    }

    loadRoomDays()
  }, [account, provider, router])


  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Mis Tokens</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Habitación</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Token</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roomDays.map((room) => (
            <TableRow key={room.tokenId.toString()}>
              <TableCell>{room.roomId.toString()}</TableCell>
              <TableCell>
                {`${room.day}/${room.month}/${room.year}`}
              </TableCell>
              <TableCell>
                {room.tokenId.toString()}
              </TableCell>
              <TableCell>
                {RoomType[room.roomType]}
              </TableCell>
              <TableCell>
                {(Number(room.pricePerNight) / 1e18).toFixed(4)} ETH
              </TableCell>
              <TableCell>
                {RoomStatus[room.status]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 