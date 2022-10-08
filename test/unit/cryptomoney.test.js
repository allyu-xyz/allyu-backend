const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

describe("FundMe", function () {
    let cryptoMoney, mockDai, deployer
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        cryptoMoney = await ethers.getContract("CryptoMoney")
        mockDai = await ethers.getContract("IERC20")
    })

    describe("constructor", function () {
        it("")
    })
})
