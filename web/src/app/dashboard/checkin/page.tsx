"use client";
import { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getContractAddress, getContractABI } from "@/lib/contract";
import { ethers } from "ethers";

export default function CheckinPage() {
  const [tokenId, setTokenId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { provider } = useWeb3();
  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) {
      return
    }
    try {
      setIsLoading(true);
      const signer = await provider.getSigner();
      const contractAddress = await getContractAddress();
      const abi = await getContractABI();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract?.setToUsed(tokenId);
      await tx?.wait();
      setTokenId("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Check-in de Habitación</h1>
      
      <form onSubmit={handleCheckin} className="max-w-md">
        <div className="space-y-4">
          <div>
            <label htmlFor="tokenId" className="block text-sm font-medium mb-2">
              ID del Token
            </label>
            <Input
              id="tokenId"
              type="text"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="Ingresa el ID del token"
              className="w-full"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !tokenId}
            className="w-full"
          >
            {isLoading ? "Procesando..." : "Realizar Check-in"}
          </Button>
        </div>
      </form>
    </div>
  );
} 
