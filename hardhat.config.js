require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("solidity-coverage")
require("hardhat-deploy")

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
//const POLYGON_MUMBAI_RPC_URL = process.env.POLYGON_MUMBAI_RPC_URL
//const OPTIMISM_GOERLI_RPC_URL = process.env.OPTIMISM_GOERLI_RPC_URL
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.13",
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6,
            chainId: 5,
        },/*
        polygon_mumbai: {
            url: POLYGON_MUMBAI_RPC_URL,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6,
            chainId: 80001,
        },
        optimism_goerli: {
            url: OPTIMISM_GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            blockConfirmations: 6,
            chainId: 420,
        },*/
    },
    localhost: {
        url: "http://127.0.0.1:8545/",
        chainId: 31337,
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
}
