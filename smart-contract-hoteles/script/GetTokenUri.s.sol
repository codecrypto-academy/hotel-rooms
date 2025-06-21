// SPDX-License-Identifier: UNLICENSED
// forge script scripts/GetTokenURI.s.sol:GetTokenURI --rpc-url <RPC> --sig "run()" --broadcast
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {HotelRooms} from "../src/HotelRooms.sol";

contract GetTokenURI is Script {
    function run() external view {
        // Replace with your deployed contract address
        HotelRooms hotel = HotelRooms(0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9);

        uint256 tokenId = 20250623003; // use a minted ID
        string memory uri = hotel.tokenURI(tokenId);
        console.log("Token URI for", tokenId, "=>", uri);
    }
}
