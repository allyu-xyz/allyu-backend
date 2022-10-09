const { ethers, getNamedAccounts } = require("hardhat")

const CODE_HASHES = [0xe59a0f0df1c0a4ab0624a10fea5c1fb7495dec2bc3b288de26330b8861d30a8c,0x9dc5260589df9cbacaef550296bb005c11c0ccd593a4d44256af82cc7159ceed,0x9e159dfcfe557cc1ca6c716e87af98fdcb94cd8c832386d0429b2b7bec02754f,0x5c26f52d908dd3893cc2a917b88293344c4ccd2dc32c30123af8678009327d52,0xe246129de4a8a291c1d772650ceca0ebb56dd9996b985e6ce3e45a2e515cc577,0x99848ba970ddbba92090c2be4b2cbe1cb9a55b04158224240aedf62261c9c05c,0xb967753c19613e062485b5d3e4b4b3e7a74793da103cd3a3e40324e42da4c2b6,0xccbb54497b232adce5e531c014c310cc4b758a5d9176e773724b7d55ff0e1f73,0x3de630ced51a59a3a4b89f2b66455ef7d38fe1bf90508ea83f7226f698449724,0xeb1593ebe3e66efa0ef3a93b6dcf8f1664816058dcf034003073959c679471ff]

async function main() {
    const {deployer} = await getNamedAccounts()
    const cryptoMoney = await ethers.getContractAt("CryptoMoney", "0x1F95BA41467679d2ef30F790Ceda7871DcaC8e0F", deployer);
    const tx = await cryptoMoney.redeem("2", "ice cream", "phone", "0xeFdCAA2fa2D3Bb4Bf3b343253199B0331A2E1A14")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
