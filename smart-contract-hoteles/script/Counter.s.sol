// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "../lib/forge-std/src/Script.sol";

contract CounterScript is Script {
    function setUp() public {

    }

    function run() public {
        vm.startBroadcast(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
        payable(0x70997970C51812dc3A010C7d01b50e0d17dc79C8)
            .transfer(1 ether);
        uint256 balance = address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8).balance;
        vm.stopBroadcast();
    }
}
