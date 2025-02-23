// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/forge-std/src/Test.sol";
import "../lib/forge-std/src/console.sol";
import "../lib/forge-std/src/console2.sol";
import "../src/HotelRooms.sol";
import "../src/UtilsDate.sol";

contract HotelRoomsTest is Test {
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);

        user1 = vm.addr(1);
        user2 = vm.addr(2);
        vm.deal(user1, 1000 ether);
        vm.deal(user2, 1000 ether);
        // Fund test users
    }

    function testDateToTimestamp() public pure {
        uint256 timestamp = UtilsDate.timestampFromDate(2024, 1, 1);
        assertEq(timestamp, 1704067200);
    }

    function testTimestampToDate() public pure {
        uint256 timestamp = 1704067200;
        (uint256 year, uint256 month, uint256 day) = UtilsDate.timestampToDate(
            timestamp
        );
        assertEq(year, 2024, "Year is not correct");
        assertEq(month, 1, "Month is not correct");
        assertEq(day, 1, "Day is not correct");
    }

    function testMintSpecificDay() public pure {
        // Convert 25/02/2025 to timestamp
        uint256 year = 2025;
        uint256 month = 12;
        uint256 day = 31;
        uint256 specificDate = UtilsDate.timestampFromDate(year, month, day);
        uint256 roomId = 99;

        console.log(uint256(keccak256(abi.encodePacked(roomId, specificDate))));
        // Verify the token was minted correctly
        console.log((year * 10000 + month * 100 + day) * 1000 + roomId);
    }

    function testGetTotal() public {
        uint256 startDate = block.timestamp + 1 days;
        uint256 endDate = block.timestamp + 2 days;
        uint256 pricePerNight = 0.1 ether;

        vm.startPrank(user1);
        HotelRooms hotelRooms = new HotelRooms();
        for (uint256 roomId = 1; roomId <= 100; roomId++) {
            hotelRooms.mintRoomDays(
                roomId,
                startDate,
                endDate,
                HotelRooms.RoomType.STANDARD,
                pricePerNight
            );
        }
        console.log("totalRoomDays", hotelRooms.totalRoomDays());
        HotelRooms.Total[] memory totals = hotelRooms.getTotals();
        console.log("totals", totals.length);
        console.logBytes(abi.encode(totals));
        vm.stopPrank();
    }

    function testMintRoomDays() public {
        uint256 startDate = block.timestamp + 1 days;
        uint256 endDate = block.timestamp + 2 days;
        uint256 pricePerNight = 0.1 ether;

        vm.startPrank(user1);
        HotelRooms hotelRooms = new HotelRooms();
        for (uint256 roomId = 1; roomId <= 100; roomId++) {
            hotelRooms.mintRoomDays(
                roomId,
                startDate,
                endDate,
                HotelRooms.RoomType.STANDARD,
                pricePerNight
            );
        }
        console.log("totalRoomDays", hotelRooms.totalRoomDays());
        vm.stopPrank();

        uint256 tokenId = hotelRooms.getRoomDayToken(1, startDate);
        (uint256 returnedRoomId, uint256 returnedDate) = hotelRooms.getRoomDay(
            tokenId
        );

        assertEq(returnedRoomId, 1);
        assertEq(returnedDate, startDate);
    }

    function testGetRoomDayFilter() public {
        uint256 startDate = block.timestamp + 1 days;
        uint256 endDate = block.timestamp + 2 days;
        uint256 pricePerNight = 0.1 ether;

        vm.startPrank(user1);
        HotelRooms hotelRooms = new HotelRooms();
        for (uint256 roomId = 1; roomId <= 10; roomId++) {
            hotelRooms.mintRoomDays(
                roomId,
                startDate,
                endDate,
                HotelRooms.RoomType.STANDARD,
                pricePerNight
            );
        }

        HotelRooms.RoomDay[] memory retorno = hotelRooms.getRoomDayFilter(
            address(user1),
            HotelRooms.RoomStatus.ALL,
            HotelRooms.RoomType.ALL,
            0,
            0,
            0
        );
        for (uint256 i = 0; i < retorno.length; i++) {
            console2.log("retorno", retorno[i].owner);
        }

        vm.stopPrank();
        assertEq(retorno.length, 20);
    }

    function testCheckin() public {
        uint256 startDate = block.timestamp + 1 days;
        uint256 endDate = block.timestamp + 2 days;
        uint256 pricePerNight = 0.1 ether;
        vm.startPrank(user1);

        HotelRooms hotelRooms = new HotelRooms();
        hotelRooms.mintRoomDays(
            1,
            startDate,
            endDate,
            HotelRooms.RoomType.STANDARD,
            pricePerNight
        );
        uint256 tokenId = hotelRooms.getRoomDayToken(1, startDate);
        vm.stopPrank();
        vm.startPrank(user2);
        hotelRooms.transferRoomDay{value: pricePerNight}(tokenId);
        hotelRooms.setToUsed(tokenId);
        vm.stopPrank();
    }

    function testPagination() public {
        uint256 offset = 0;
        uint256 limit = 200;
        uint256 startDate = block.timestamp + 1 days;
        uint256 endDate = block.timestamp + 2 days;
        uint256 pricePerNight = 0.1 ether;
        vm.startPrank(user1);
        HotelRooms hotelRooms = new HotelRooms();
        for (uint256 roomId = 1; roomId <= 100; roomId++) {
            hotelRooms.mintRoomDays(
                roomId,
                startDate,
                endDate,
                HotelRooms.RoomType.STANDARD,
                pricePerNight
            );
        }
        HotelRooms.RoomDay[] memory roomDays = hotelRooms.getAllRoomDays(
            offset,
            limit
        );
        vm.stopPrank();
        console.log("roomDays", roomDays.length);

        assertEq(roomDays.length, limit);
    }

    function testTransferRoomDay() public {
        uint256 roomId = 1;
        uint256 date = block.timestamp + 1 days;
        uint256 pricePerNight = 0.1 ether;

        // First mint
        vm.startPrank(user1);
        HotelRooms hotelRooms = new HotelRooms();
        hotelRooms.mintRoomDays(
            roomId,
            date,
            date,
            HotelRooms.RoomType.STANDARD,
            pricePerNight
        );
        vm.stopPrank();

        uint256 tokenId = hotelRooms.getRoomDayToken(roomId, date);

        // Then transfer
        vm.prank(user2);
        hotelRooms.transferRoomDay{value: pricePerNight}(tokenId);

        assertEq(hotelRooms.ownerOf(tokenId), user2);
        // assertEq(uint256(hotelRooms.isRoomBooked(roomId, date)), uint256(HotelRooms.RoomStatus.BOOKED));
    }

    // function testWithdrawFunds() public {
    //     uint256 roomId = 1;

    //     uint256 date = block.timestamp;
    //     console.log("date", date);
    //     console.log("date year", date / 365 days + 1970);
    //     console.log("date month", (date % 365 days) / 30 days + 1);
    //     console.log("date day", (date % 30 days) / 1 days + 1);
    //     uint256 pricePerNight = 0.1 ether;

    //     // Mint and transfer to generate funds
    //     vm.startPrank(user1);
    //     HotelRooms hotelRooms = new HotelRooms();
    //     hotelRooms.mintRoomDays(
    //         roomId,
    //         date,
    //         date,
    //         HotelRooms.RoomType.STANDARD,
    //         pricePerNight
    //     );

    //     vm.startPrank(user2);
    //     uint256 tokenId = hotelRooms.getRoomDayToken(roomId, date);
    //     hotelRooms.transferRoomDay{value: pricePerNight}(tokenId);

    //     vm.startPrank(user1);
    //     hotelRooms.withdrawFunds();
    //     vm.stopPrank();

    //     assertEq(
    //         address(user1).balance - pricePerNight,
    //         pricePerNight,
    //         "Withdrawal amount incorrect"
    //     );
    // }

    function testMintMultipleRoomDays() public {
        uint256 roomIdStart = 1;
        uint256 roomIdEnd = 10;
        uint256 startDate = block.timestamp + 1000000;
        uint256 endDate = block.timestamp + 1000000 + 10;
        vm.deal(owner, 1000 ether);
        vm.startPrank(owner);
        
        HotelRooms hotelRooms = new HotelRooms();
        hotelRooms.mintMultipleRoomDays(
            roomIdStart,
            roomIdEnd,
            startDate,
            endDate,
            HotelRooms.RoomType.STANDARD,
            1 ether
        );
        HotelRooms.RoomDay[] memory roomDays = hotelRooms.getRoomsBetweenDates(
            startDate,
            endDate
        );
        console.log("roomDays", roomDays.length);
        for (uint256 i = 0; i < roomDays.length; i++) {
            console.log(
                "id token",
                roomDays[i].tokenId,
                roomDays[i].pricePerNight
            );
        }

        vm.stopPrank();
        assertEq(roomDays.length, 10);
    }

    function testSetPricePerNight() public  {
        uint256 roomId = 1;
        uint256 date = block.timestamp + 1 days;
        uint256 newPrice = 0.2 ether;

        vm.startPrank(user1);
        HotelRooms hotelRooms = new HotelRooms();
        hotelRooms.mintRoomDays(
            roomId,
            date,
            date,
            HotelRooms.RoomType.STANDARD,
            0.1 ether
        );

        hotelRooms.setPricePerNight(roomId, date, newPrice);

        uint256 tokenId = hotelRooms.getRoomDayToken(roomId, date);
        (uint256 returnedRoomId, uint256 returnedDate) = hotelRooms.getRoomDay(
            tokenId
        );
        vm.stopPrank();

        assertEq(returnedRoomId, roomId);
        assertEq(returnedDate, date);
    }

    receive() external payable {}
}
