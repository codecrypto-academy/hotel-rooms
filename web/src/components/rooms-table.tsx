"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { getContractAddress, getContractABI } from "@/lib/contract";
import { formatDate } from "@/lib/utils";
import { useWeb3 } from "@/context/Web3Context";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
interface RoomDay {
  roomId: bigint;
  date: bigint;
  roomType: number;
  pricePerNight: bigint;
  status: number;
  tokenId: bigint;
  owner: string;
}

const ITEMS_PER_PAGE = 20;

export function RoomsTable() {
  const [roomDays, setRoomDays] = useState<RoomDay[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { provider, account } = useWeb3();
  const router = useRouter();
  const getRoomTypeString = (type: number) => {
    const types = [ "STANDARD", "DELUXE", "SUITE"];
    return types[type];
  };

  const getRoomStatusString = (status: number) => {
    const statuses = [ "AVAILABLE", "BOOKED", "MAINTENANCE", "USED", "ALL"];
    return statuses[status];
  };

  useEffect(() => {
    const fetchRoomDays = async () => {
      if (!provider || !account) {
        router.push('/')
        return
      }

      try {
        setLoading(true);
        const contractAddress = await getContractAddress();
        const abi = await getContractABI();

        const contract = new ethers.Contract(contractAddress, abi, provider);

        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const roomDays = await contract.getAllRoomDays(offset, ITEMS_PER_PAGE);

        setRoomDays(roomDays);
      } catch (error) {
        console.error("Error fetching room days:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDays();
  }, [currentPage, provider, account]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Room Type</TableHead>
            <TableHead>Price Per Night</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Token ID</TableHead>
            <TableHead>Owner</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roomDays.map((room) => (
            <TableRow key={room.tokenId.toString()}>
              <TableCell>{room.roomId.toString()}</TableCell>
              <TableCell>{formatDate(Number(room.date))}</TableCell>
              <TableCell>{getRoomTypeString(room.roomType)}{room.roomType}</TableCell>
              <TableCell>{room.pricePerNight.toString()} ETH</TableCell>
              <TableCell>{getRoomStatusString(room.status)}</TableCell>
              <TableCell>{room.tokenId.toString()}</TableCell>
              <TableCell className="font-mono">{room.owner}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>{currentPage}</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={roomDays.length < ITEMS_PER_PAGE}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
