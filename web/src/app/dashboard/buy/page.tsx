"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@/context/Web3Context";
import { getContractABI } from "@/lib/contract";
import { getContractAddress } from "@/lib/contract";
import { RoomDay, RoomStatus } from "@/lib/types";
export default function BuyPage() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const { account, provider } = useWeb3();

  const totalPrice = rooms.reduce((acc, room) => acc + Number(room.pricePerNight), 0);
  const searchRooms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !provider) return;
    try {
      setLoading(true);
      const contractAddress = await getContractAddress();
      const abi = await getContractABI();
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const rooms = await contract.getAllRoomDays(0, 100);
      
      const selectedRooms = rooms.filter((room: RoomDay) => 
        Number(room.status) === 0 &&
        Number(room.date) >= startDate.getTime()/1000 &&
        Number(room.date) <= endDate.getTime()/1000
      );
      setRooms(selectedRooms);
     


    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  

  const buySelectedRooms = async () => {
    if (!provider) return;
    const signer = await provider.getSigner();
    const contractAddress = await getContractAddress();
    const abi = await getContractABI();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      setLoading(true);

      
      // Execute transaction
      const tokenIds = rooms.map((room) => Number(room.tokenId));
      
      const tx = await contract.transferRoomDayMultiple(tokenIds, {
        
        value: ethers.parseEther((totalPrice / (10 ** 18)).toString()),
      });
      await tx.wait();
      alert("Rooms bought successfully");
    } catch (error) {
      alert("Error buying rooms: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Book Hotel Rooms</h1>

      <form onSubmit={searchRooms} className="mb-8">
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block mb-2">Start Date</label>
            <input
              type="date"
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-2">End Date</label>
            <input
              type="date"
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="border p-2 rounded"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 self-end"
          >
            Search
          </button>
        </div>
      </form>

      {rooms.length > 0 && (
        <div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Token</th>
                <th className="border p-2">Price (ETH)</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.tokenId.toString()} className="hover:bg-gray-50">
                  <td className="border p-2">{room.tokenId}</td>
                  <td className="border p-2">
                    {ethers.formatEther(room.pricePerNight)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <button
              onClick={buySelectedRooms}
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Buy Selected Rooms {totalPrice}
            </button>
          </div>
        </div>
      )}

      {loading && <div className="text-center py-4">Loading...</div>}
    </div>
  );
}
