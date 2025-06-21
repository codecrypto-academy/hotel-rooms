
# Instalar rust y foundry

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

```bash
curl -L https://foundry.paradigm.xyz | bash
```

# Instalar las dependencias
```bash
forge install OpenZeppelin/openzeppelin-contracts
```
```bash
forge install OpenZeppelin/openzeppelin-contracts-upgradeable
```

# Compilar el contrato
```bash
forge build

```

# Ejecutar los tests
```bash
forge test
```

# Limpiar el proyecto
```bash
forge clean
```

# LANZA EL ANVIL en otro terminal
## con el nemonic 
Mnemonic:          test test test test test test test test test test test junk
Derivation path:   m/44'/60'/0'/0/
lista de claves: ver la consola de anvil

```bash
anvil
```

# Deploy contract
## se usa la primera clavep rivada de la lista de anvil

### Foundry Deploy
```bash
forge script script/HotelRooms.s.sol:DeployHotelRooms \
      --rpc-url http://localhost:8545 \
      --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
      --broadcast
```

```bash
forge create --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 src/HotelRooms.sol:HotelRooms > contrato.txt  && \
cp ./out/HotelRooms.sol/HotelRooms.json ../web/src/lib/abi.json && \
cat contrato.txt | grep  "Deployed to:" | \
sed 's/Deployed to: //' > ../web/src/lib/contrato.json
```

# Folder web. Aplicacion nextjs

# Instalar las dependencias
```bash
npm install
npm run dev
```
