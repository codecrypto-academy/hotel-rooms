// SPDX-License-Identifier: UNLICENSED
// forge script script/GetTokenURI.s.sol:GetTokenURI --rpc-url <RPC> --sig "run()" --broadcast
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {HotelRooms} from "../src/HotelRooms.sol";

contract GetTokenURI is Script {
    function run() external view {
        // Replace with your deployed contract address
        // rpc.testnet: 0x4826533B4897376654Bb4d4AD88B7faFD0C98528
        HotelRooms hotel = HotelRooms(0x5FbDB2315678afecb367f032d93F642f64180aa3);

        uint256 tokenId = 20250622001; // use a minted ID
        string memory uri = hotel.tokenURI(tokenId);
        console.log("Token URI for", tokenId, "=>", uri);
    }
}
