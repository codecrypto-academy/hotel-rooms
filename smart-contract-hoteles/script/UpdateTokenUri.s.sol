// SPDX-License-Identifier: UNLICENSED
// forge script script/UpdateTokenUri.s.sol:UpdateTokenUri --rpc-url <RPC> --sig "run()" --broadcast
// forge script script/UpdateTokenUri.s.sol:UpdateTokenUri \
//   --rpc-url http://localhost:8545 \
//   --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {HotelRooms} from "../src/HotelRooms.sol";

contract UpdateTokenUri is Script {
    function run() external {
        vm.startBroadcast(); // uses the key passed via --private-key

        // Replace with your deployed contract address
        // rpc.testnet: 0x4826533B4897376654Bb4d4AD88B7faFD0C98528
        HotelRooms hotel = HotelRooms(0x5FbDB2315678afecb367f032d93F642f64180aa3);

        string memory metadataBaseURI = "https://pvc-harold-qld-align.trycloudflare.com/api/metadata/";
        hotel.setBaseTokenURI(metadataBaseURI);

        console.log("metadataBaseUri for HotelRooms updated:\r\n", metadataBaseURI);
        vm.stopBroadcast();
    }
}
