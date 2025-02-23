"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoomType } from "@/lib/types";
import { ethers } from "ethers";
import { getContractAddress, getContractABI } from "@/lib/contract";
import { useWeb3 } from "@/context/Web3Context";
import { useRouter } from "next/navigation";
import { RoomStatus } from "@/lib/types";
import { RoomDay } from "@/lib/types";
import { Total } from "@/lib/types";

export default function MisTokens() {
  const [roomDays, setRoomDays] = useState<RoomDay[]>([]);
  const [totals, setTotals] = useState<Total[]>([]);
  const { account, provider } = useWeb3();
  const router = useRouter();
  useEffect(() => {
    const loadRoomDays = async () => {
      if (!provider || !account) {
        return;
      }

      const contractAddress = await getContractAddress();
      const abi = await getContractABI();
      const contract = new ethers.Contract(contractAddress, abi, provider);
      try {
        const [roomDays, totals] = await contract.getAllData();
        // rooms[0] contains RoomDay[] array, rooms[1] contains Total[] array

        setRoomDays(
          roomDays.filter(
            (room: RoomDay) =>
              room.owner.toLowerCase() === account.toLowerCase()
          )
        );
        setTotals(totals);
      } catch (error) {
        console.error("Error loading room days:", error);
      }
    };

    loadRoomDays();
  }, [account, provider, router]);

  const handleSpendToken = async (tokenId: number) => {
    const contractAddress = await getContractAddress();
    const abi = await getContractABI();
    const signer = await provider?.getSigner();
    if (!signer) {
      alert("No se pudo obtener el signer");
      return;
    }
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.setToUsed(tokenId);
    await tx.wait();
    alert("Token gastado");
    router.refresh();
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Mis Tokens</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Habitación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roomDays.map((room, index) => (
            <TableRow key={index}>
              <TableCell>
                {room.tokenId.toString()}
                <Button
                  className="bg-red-500 ml-2"
                  onClick={() => {
                    handleSpendToken(Number(room.tokenId));
                  }}
                >
                  Gastar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
