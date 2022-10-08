const { network, ethers } = require("hardhat")

const NAME = "DAI_STABLE_COIN"
const SYMBOL = "DAI"
const ADDRESS = "0xB076bB11b8E3126994091Bd35ff28F7D60bd3B2a"
const INITIAL_AMOUNT = ethers.utils.parseEther("1000000")

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (chainId == 31337) {
        log("Deploying Mock ERC20!")
        args = [NAME, SYMBOL, ADDRESS, INITIAL_AMOUNT]
        await deploy("ERC20Mock", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: 1,
        })
        log("Mocks! Deployed!")
        log("-----------------------------------------------------------------")
    }
}

module.exports.tags = ["all", "mock"]
