# Hotel Room Tokenization Smart Contract

Este proyecto implementa un sistema de tokenización para habitaciones de hotel utilizando el estándar ERC-721.

## Características

- Tokenización de habitaciones de hotel por día
- Sistema de pagos en ETH por reserva
- Gestión de metadatos para cada habitación
- 100 habitaciones disponibles
- Cada token representa una habitación específica en una fecha específica
- Implementa el estándar ERC-721 para NFTs
- Sistema de reservas que previene la doble reserva

## Funciones Principales

- `mintRoomDays(uint256 roomId, uint256 startDate, uint256 endDate)`: Permite reservar y pagar por una habitación en un rango de fechas
- `getRoomDay(uint256 tokenId)`: Obtiene la información de una habitación y fecha para un token específico
- `isRoomBooked(uint256 roomId, uint256 date)`: Verifica si una habitación está reservada para una fecha específica
- `setRoomMetadata(uint256 roomId, string metadata)`: Permite al dueño establecer información sobre la habitación
- `setPricePerNight(uint256 price)`: Permite al dueño actualizar el precio por noche
- `withdrawFunds()`: Permite al dueño retirar los ETH acumulados por las reservas

## Instalación y Pruebas

1. Instalar dependencias:
```bash
forge install
```

2. Ejecutar pruebas:
```bash
forge test
```

## Seguridad

- El contrato utiliza OpenZeppelin para implementaciones seguras de ERC721
- Incluye verificaciones para prevenir reservas duplicadas
- Implementa control de acceso mediante Ownable
- Validaciones de pagos y fechas

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
