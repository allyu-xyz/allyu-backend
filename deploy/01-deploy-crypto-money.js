const { ethers, network } = require("hardhat")
const verify = require("../utils/verify")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const feeInWeiPerBill = ethers.utils.parseEther("0.0001", "ether")

    let DaiAddress, waitConfirmations
    if (chainId == 31337) {
        const mock = await ethers.getContract("ERC20Mock")
        DaiAddress = mock.address
        waitConfirmations = 1
    } else if (chainId == 5) {
        DaiAddress = "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844"
        waitConfirmations = 1
    } else if (chainId == 80001) {
        DaiAddress = "0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F"
        waitConfirmations = 1
    } else {
        DaiAddress = "0x544F2B88d6bD73Eca6A929DfF981A23349740186"
        waitConfirmations = 1
    }

    log("Deploying Crypto Money!")

    args = [feeInWeiPerBill, DaiAddress]
    const cryptoMoney = await deploy("CryptoMoney", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitConfirmations,
    })
    log("Crypto Money Deployed!")
    log("-----------------------------------------------------------------")

    if (chainId != 31337) {
        await verify(cryptoMoney.address, args)
    }
}

module.exports.tags = ["all", "main"]
