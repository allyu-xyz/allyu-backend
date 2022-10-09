// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

error CryptoMoney__NotApproved();
error CryptoMoney__TransferFailed();
error CryptoMoney__CodeHashNotEmpty();
error CryptoMoney__FeeNotMet();
error CryptoMoney__InvalidCode();
error CryptoMoney__InvalidWord();
error CryptoMoney__NoFeesToWithdraw();

// @title A sample Crypto Money Contract
// @author Jason Chaskin, Sebastian Coronel, & Carlos Vera
// @notice This contract is for creating a sample Crypto Money Contract

contract CryptoMoney is Ownable {
    ///////////////////////
    // Storage Variables //
    ///////////////////////

    IERC20 private s_daiContract;
    uint256 private s_feeInWeiPerBill;
    uint256 private s_requestId;
    mapping(uint256 => Request) private s_requestIdToRequest;
    uint256 private s_nextBillId;
    Bill[] private s_bills;

    //////////////
    // Structs //
    //////////////

    struct Request {
        uint256 amountPerBill;
        uint256 billCount;
        bool isIssued;
        address requester;
    }

    struct Bill {
        uint256 id;
        uint256 value;
        bytes32 wordHash;
        bytes32 codeHash;
        bool isFunded;
        bool isRedeemed;
    }

    /////////////
    // Events //
    ////////////

    event NewRequest(
        uint256 indexed requestId,
        address indexed requester,
        uint256 amountPerBill,
        uint256 billCount
    );
    event BillIssued(uint256 indexed billId, uint256 value);
    event BillFunded(
        uint256 indexed billId,
        address indexed funder,
        uint256 value
    );
    event BillRedeemed(
        uint256 indexed billId,
        address indexed redeemer,
        uint256 value
    );

    constructor(uint256 feePerBill, address daiContractAddress) {
        s_feeInWeiPerBill = feePerBill;
        s_daiContract = IERC20(daiContractAddress);
        s_nextBillId = 1;
    }

    ///////////////
    // Functions //
    ///////////////

    // @notice Accepts payment for physical paper bills, creates a pending request object containing the amount per bills,
    // number of bills requested, is issued boolean set to false, and the address of the requester. Iterates request Id
    // @param amountPerBill The amount the requester requests each bill will be worth in DAI
    // @param billCount The total number of bills requested

    function requestBills(uint256 amountPerBill, uint256 billCount)
        external
        payable
    {
        if (s_feeInWeiPerBill * billCount > msg.value) {
            revert CryptoMoney__FeeNotMet();
        }
        s_requestIdToRequest[s_requestId] = Request(
            amountPerBill,
            billCount,
            false,
            msg.sender
        );
        emit NewRequest(s_requestId, msg.sender, amountPerBill, billCount);
        s_requestId++;
    }

    // @notice Issues new physical bills, bill objects are created containing the bill id, amount pulled from the request object,
    // a blank word hash (this gets updated by the funder when bill is funded), the keccak256 hash of a secret code, and
    // is funded and is redeemed are both set to false
    // @param requestId The request id is used to retrieve the request
    // @param codeHash Bills are created with the keccak256 hash of a secret code, this code is hidden on the paper money

    function issueBills(uint256 requestId, bytes[] calldata codeHash)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < codeHash.length; i++) {
            Request memory request = s_requestIdToRequest[requestId];
            s_bills.push(
                Bill(
                    s_nextBillId,
                    request.amountPerBill,
                    "",
                    bytes32(codeHash[i]),
                    false,
                    false
                )
            );
            emit BillIssued(s_nextBillId, request.amountPerBill);
            s_nextBillId++;
        }
        s_requestIdToRequest[requestId].isIssued = true;
    
    }

    // @notice The buyer of the paper bills funds them with DAI by scanning the QR code on the bill and calling this function.
    // Function makes sure that DAI is approved to be spent by the contract for the value stored in the bill object.
    // The buyer inputs a code, which is hashed on the frontend, this is the code hash that's inputted into the function.
    // In the bill object, the code hash is updated with inputted code hash and is funded is updated to true. DAI is transfered to this contract.
    // The buyer finally writes the code word on the physical bill
    // @param billId The bill Id id is used to retrieve the bill
    // @param amount The amount of DAI being funded
    // @param wodeHash bills are created with the keccak256 hash of a secret code, this code is hidden on the paper money

    function fund(
        uint256 billId,
        uint256 amount,
        bytes calldata wordHash
    ) external {
        Bill memory bill = s_bills[billId];
        IERC20 daiContract = s_daiContract;
        if (daiContract.allowance(msg.sender, address(this)) != bill.value) {
            revert CryptoMoney__NotApproved();
        }
        s_bills[billId].wordHash = bytes32(wordHash);
        s_bills[billId].isFunded = true;
        daiContract.transferFrom(
            msg.sender,
            address(this),
            bill.value
        );
        emit BillFunded(billId, msg.sender, amount);
    }

    // @notice The redeemer reveals the secret code which has been hidden on the paper bill and inputs it, the bill id, and the secret word which was pyhsically
    // written onto the bill into this function. It then checks to make sure both the hash of the word and code equal the hashes stored in the bill object
    // is redeemed is udpated on the bill object to be true and the DAI is transfered to the redeem address
    // @param billId The bill id that is attempted to be redeemed
    // @param code The secret code which was revealed on the physical bill
    // @param word the secret word which is written on the physical bill
    // @param redeem address is the address which receives the funds

    function redeem(
        uint256 billId,
        string memory code,
        string memory word,
        address redeemAddress
    ) external {
        Bill memory bill = s_bills[billId];
        if (keccak256((abi.encodePacked(bill.codeHash))) != keccak256(abi.encodePacked(keccak256((abi.encodePacked(code)))))) {
                revert CryptoMoney__InvalidCode();
        }
        if (keccak256((abi.encodePacked(bill.wordHash))) != keccak256(abi.encodePacked(keccak256((abi.encodePacked(word)))))) {
                revert CryptoMoney__InvalidWord();
        }
        uint256 redeemValue = bill.value;
        s_bills[billId].value = 0;
        s_bills[billId].isRedeemed = true;
        s_daiContract.transfer(msg.sender, redeemValue);
        emit BillRedeemed(billId, redeemAddress, redeemValue);
    }

    function verifyWord(uint256 billId, string memory word) external view returns (bool) {       
        return (keccak256((abi.encodePacked(s_bills[billId].wordHash))) == keccak256(abi.encodePacked(keccak256((abi.encodePacked(word))))));
    }

    function updateFee(uint256 updatedFee) external onlyOwner {
        s_feeInWeiPerBill = updatedFee;
    }

    function claimFees() external onlyOwner {
        if (address(this).balance == 0) {
            revert CryptoMoney__NoFeesToWithdraw();
        }
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!success) {
            revert CryptoMoney__TransferFailed();
        }
    }

    /////////////////////
    // View Functions //
    ////////////////////

    function getDaiContract() external view returns (IERC20) {
        return s_daiContract;
    }

    function getFeePerBill() external view returns (uint256) {
        return s_feeInWeiPerBill;
    }

    function getNextRequestId() external view returns (uint256) {
        return s_requestId;
    }

    function getOneRequest(uint256 requestId)
        external
        view
        returns (Request memory)
    {
        return s_requestIdToRequest[requestId];
    }

    function getNextBillId() external view returns (uint256) {
        return s_nextBillId;
    }

    function getOneBillFromBillId(uint256 billId)
        external
        view
        returns (Bill memory)
    {
        return s_bills[billId];
    }
}
