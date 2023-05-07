# CryptoMoney: Allyu

`CryptoMoney` is a decentralized, trustless paper money system developed by Allyu that communities can leverage to issue their own physical currency backed entirely by crypto deposits. The project provides a proof of concept set of bills that can be filled with a specified amount of DAI and given to a third party. The third party can then verify the physical integrity of the bill and its contents on-chain.

## Frontend

A frontend is also available for user interaction at [allyu.xyz](https://allyu.xyz).

## Repository

The backend repository can be found at [https://github.com/allyu-xyz/allyu-backend](https://github.com/allyu-xyz/allyu-backend).

## Features

- Request physical paper bills with a specified DAI value
- Issue physical paper bills with a unique secret code and word hash
- Fund physical paper bills with DAI
- Redeem physical paper bills for DAI
- Verify the secret word written on the physical bill
- Update the fee per bill for requesting bills
- Claim fees collected from requesting bills

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Smart Contract Functions](#smart-contract-functions)
- [Events](#events)
- [License](#license)

## Installation

1. Clone the repository:

git clone https://github.com/allyu-xyz/allyu-backend.git

2. Install dependencies:

npm install

3. Compile the smart contracts:

npx hardhat compile

4. Deploy the smart contracts to a local development network:

npx hardhat run --network localhost scripts/deploy.js


## Usage

1. Interact with the smart contract using a web3 library such as ethers.js or web3.js.

2. Call the `requestBills` function to request new physical paper bills.

3. Use the `issueBills` function to issue the requested physical paper bills.

4. Fund the physical paper bills with DAI using the `fund` function.

5. Redeem the physical paper bills for DAI using the `redeem` function.

6. Verify the secret word written on the physical bill using the `verifyWord` function.

7. Update the fee per bill for requesting bills with the `updateFee` function.

8. Claim fees collected from requesting bills using the `claimFees` function.

## Smart Contract Functions

- `requestBills(uint256 amountPerBill, uint256 billCount)`: Request new physical paper bills.
- `issueBills(uint256 requestId, bytes[] calldata codeHash)`: Issue the requested physical paper bills.
- `fund(uint256 billId, uint256 amount, bytes calldata wordHash)`: Fund the physical paper bills with DAI.
- `redeem(uint256 billId, string memory code, string memory word, address redeemAddress)`: Redeem the physical paper bills for DAI.
- `verifyWord(uint256 billId, string memory word)`: Verify the secret word written on the physical bill.
- `updateFee(uint256 updatedFee)`: Update the fee per bill for requesting bills.
- `claimFees()`: Claim fees collected from requesting bills.

## Events

- `NewRequest(uint256 indexed requestId, address indexed requester, uint256 amountPerBill, uint256 billCount)`: Emitted when a new request for physical paper bills is made.
- `BillIssued(uint256 indexed billId, uint256 value)`: Emitted FeeUpdated(uint256 newFee)`: Emitted when the fee per bill for requesting bills is updated.
- FeesClaimed(address indexed claimer, uint256 amount): Emitted when fees collected from requesting bills are claimed.

## License

This project is licensed under the MIT License.

