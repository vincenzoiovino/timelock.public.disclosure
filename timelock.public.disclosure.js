import init, * as ecies from "../pkg/ecies_wasm.js";
import {
    Base64
} from 'https://cdn.jsdelivr.net/npm/js-base64@3.7.5/base64.mjs';

const API_TINY = 'https://tinyurl.com/api-create.php?url=';
const API_PATH = "/public.disclosure/";
//const API_URL = "https://demo.azkr.ch:8080" + API_PATH;
const API_URL = "http://localhost:81" + API_PATH;

//const CHAIN="Goerli"; 
const CHAIN = "Sepolia";
var CHAIN_ID;
if (CHAIN === "Sepolia" || CHAIN === "sepolia")
    CHAIN_ID = 11155111; // Goerli = 5, Sepolia = 11155111
else if (CHAIN === "Goerli" || CHAIN === "goerli")
    CHAIN_ID = 5;


init(); // initialize wasm modules
const encoder = new TextEncoder("ascii");
const decoder = new TextDecoder("ascii");

function toBase64(s) {
    return Base64.fromUint8Array(s);
}

function fromHexString(hexString) {
    return Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

function fromBase64(s) {
    return Base64.toUint8Array(s);
}


function setRangeDates() {
    document.getElementById('date').min = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];
    document.getElementById('date').value = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];
    var maxdate = new Date();
    var dd = maxdate.getDate();
    var mm = maxdate.getMonth();
    var yyyy = maxdate.getFullYear() + 1;

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    document.getElementById("date").max = yyyy + '-' + mm + '-' + dd;


}


setRangeDates();

const provider = await new ethers.providers.Web3Provider(window.ethereum);

const setDots = () => {
    setTimeout(() => last.innerHTML = ".", 100);
    setTimeout(() => last.innerHTML = "..", 500);
    setTimeout(() => last.innerHTML = "...", 900);

}
const setWaitSubmission = () => {
    setTimeout(() => last.innerHTML = ".", 100);
    setTimeout(() => last.innerHTML = "Pls wait for.", 500);
    setTimeout(() => last.innerHTML = "Pls wait for confirm.", 900);
    setTimeout(() => last.innerHTML = "Pls wait for confirmation..", 1300);
    setTimeout(() => last.innerHTML = "Pls wait for confirmation of submission...", 1700);
    setTimeout(() => last.innerHTML = "Pls wait for confirmation of submission and save the identifier...", 2100);

}

var waitsubmissioninterval = "";

document.getElementById("instructions").addEventListener("click", async () => {
    document.getElementById("status2").style.color = "white";
    document.getElementById("status3").style.color = "white";
    document.getElementById("status4").style.color = "white";
    document.getElementById("status5").style.color = "white";
    status2.innerText = "***Connect***\nFirst, connect the App to your wallet and choose the address from which you want to carry out the transactions.\n\n***Deposit a document***\nWrite a document, choose a date in the future and click on ``Submit document``, you will be asked to sign a transaction. Once you did wait for confirmation, you will receive an identifier (a decimal number).\n\n***Read a deposited document***\nInput the identifier, and click on ``Read deposited document``.\nIf the date specified at encryption time is past you will be able to read the document, otherwise you will be asked to wait until the given date.\n\n***Optional password***\nYou also have the option of choosing a password when you submit a document. Then don't forget to use the same password when you want to read the document.";
    status3.innerText = "";
    status4.innerText = "";
    status5.innerText = "";

});

var dotsinterval = setInterval(setDots, 1000);

// Contract Details
const contractTimelockPublicDisclosureAddress = "0x1f7d98055c0DccD06dda667136d58DCf0d9E0f50"; //  contract on Sepolia
const contractTimelockPublicDisclosureABI = [{
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [{
                "internalType": "uint256",
                "name": "A",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "ut",
                "type": "uint256"
            },
            {
                "internalType": "bytes8",
                "name": "CT",
                "type": "bytes8"
            }
        ],
        "name": "PublishDocument",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "name": "documents",
        "outputs": [{
                "internalType": "uint256",
                "name": "ut",
                "type": "uint256"
            },
            {
                "internalType": "bytes8",
                "name": "CT",
                "type": "bytes8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "uint256",
            "name": "A",
            "type": "uint256"
        }],
        "name": "get_document",
        "outputs": [{
            "components": [{
                    "internalType": "uint256",
                    "name": "ut",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes8",
                    "name": "CT",
                    "type": "bytes8"
                }
            ],
            "internalType": "struct TimelockPublicDisclosure.Document",
            "name": "",
            "type": "tuple"
        }],
        "stateMutability": "view",
        "type": "function"
    }
];



const web3 = new Web3(window.ethereum);
// Function to check if MetaMask is available
async function checkMetaMaskAvailability() {
    if (window.ethereum) {
        try {
            // Request access to MetaMask accounts
            await window.ethereum.request({
                method: "eth_requestAccounts"
            });
            return true;
        } catch (err) {
            console.error("Failed to connect to MetaMask:", err);
            return false;
        }
    } else {
        console.error("MetaMask not found");
        return false;
    }
}

function XOR(CT, hashedPwd) {
    var s = new Uint8Array(8),
        i;
    var CTencoded = stringToBytes(CT);
    var hashedPwdencoded = stringToBytes(hashedPwd.substr(2, hashedPwd.length)); // skip the initial 0x in hashedPwd
    for (i = 0; i < CTencoded.length; i++) s[i] = CTencoded[i] ^ hashedPwdencoded[i];
    const decoder = new TextDecoder();
    const str = decoder.decode(s);
    return str;
}

document.getElementById("metamask").addEventListener("click", async () => {
    const metaMaskAvailable = await checkMetaMaskAvailability();
    if (metaMaskAvailable) {
        await ConnectWallet();
        await AccountInformation();
        await ContractInformation();
    } else {
        console.error("MetaMask not found");
        // Update status
        document.getElementById("status1").innerText = "MetaMask not found";
        document.getElementById("status1").style.color = "red";
    }
});
document.getElementById("plus").addEventListener("click", async () => {
    const metaMaskAvailable = await checkMetaMaskAvailability();
    if (metaMaskAvailable) {
        await ConnectWallet();
        await AccountInformation();
        await ContractInformation();
    } else {
        console.error("MetaMask not found");
        // Update status
        document.getElementById("status1").innerText = "MetaMask not found";
        document.getElementById("status1").style.color = "red";
    }
});
document.getElementById("minus").addEventListener("click", async () => {

    document.getElementById("status2").innerText = "";
    document.getElementById("status3").innerText = "";
    document.getElementById("status4").innerText = "";
    document.getElementById("status5").innerText = "";
    clearInterval(waitsubmissioninterval);
    clearInterval(dotsinterval);
    dotsinterval = setInterval(setDots, 1000);
});

async function ConnectWallet() {
    try {
        await window.ethereum.request({
            method: "eth_requestAccounts"
        });
        var chainId = "";
        await web3.eth.net.getId().then(netId => {
            chainId = netId;
        })
        if (chainId == CHAIN_ID) {
            document.getElementById("status1").innerText = "Connected to MetaMask (" + CHAIN + " Testnet)";
            document.getElementById("status1").style.color = "green";
        } else {
            document.getElementById("status1").style.color = "red";
            document.getElementById("status1").innerText = "Connected to MetaMask but not on " + CHAIN + " Testnet. Switch to " + CHAIN + " to use the dAPP. It can be necessary to restart the browser";
        }
    } catch (err) {
        console.error("Failed to connect to MetaMask:", err);
        // Update status
        document.getElementById("status1").innerText =
            "Failed to connect to MetaMask";
        document.getElementById("status1").style.color = "red";
    }
}

async function AccountInformation() {
    const account = await web3.eth.getAccounts();
    const from = account[0];
    const balanceInWei = await web3.eth.getBalance(from);
    const balanceInEth = web3.utils.fromWei(balanceInWei, "ether");
    const gasPrice = await web3.eth.getGasPrice();
    const gasPriceInEth = web3.utils.fromWei(gasPrice, "ether");

    document.getElementById("status4").innerText = "";
    document.getElementById("status5").innerText = "";
    // Display the account information
    document.getElementById("status2").innerText =
        "Your account address: " +
        from +
        "\nYour Balance: " +
        balanceInEth +
        " ETH" +
        "\nGas Price: " +
        gasPriceInEth;
    document.getElementById("status2").style.color = "white";
}
async function ContractInformation() {
    const from = contractTimelockPublicDisclosureAddress;

    // Display the account information
    document.getElementById("status3").innerText =
        "Timelock.Public.Disclosure address: " +
        from;
    document.getElementById("status3").style.color = "yellow";
}

// Event Listener for Submitting a Document
document.getElementById("submitButton").addEventListener("click", async () => {
    const metaMaskAvailable = await checkMetaMaskAvailability();
    if (metaMaskAvailable) {
        await SendFunction();
    }
});


async function getTinyURL(CT) {
    var request = API_TINY + API_URL + CT;

    return fetch(request).then(function(response) {
        return response.text();
    });
}

async function getLongURL(CT) {
    var request = "https://tinyurl.com/" + CT;
    //return fetch(request,{redirect:"follow",mode:"no-cors"}).then(function (response){
    return fetch(request).then(function(response) {
        return response.url;
    }).catch(function(err) {

        swal("Unable to decrypt. The problem can be due to an invalid password or to an invalid ciphertext submitted on-chain.", {
            icon: "error",
        });
        console.log(err);
        return null;
    });
}

//Function to call the Submission Document Function
async function SendFunction() {
    const accounts = await web3.eth.getAccounts();
    const From = accounts[0];
    const Document = document.getElementById("documentinput").value;
    const password = document.getElementById("idpassword").value;
    const confirmedpassword = document.getElementById("idconfirmedpassword").value;
    const dateobj = new Date(document.getElementById('date').value);

    if (password !== "") {
        if (!await swal('You chose a non-empty password. The document will be encrypted with the chosen password.  Are you sure you want to continue?', {
                buttons: [true, true],
                icon: "warning",
            })) return;
        if (password !== confirmedpassword) {

            swal("Passwords do not match.", {
                icon: "error",
            });
            return;
        }

    }
    // Check if Document is provided
    if (!Document) {

        swal("Document is empty", {
            icon: "error",
        });
        console.error("Document is empty");
        return;
    }
    const ut = dateobj.getTime();
    const Round = UnixTimeToRound(ut);
    getPublicKeyfromUrl(Round, "secp256k1").then(function(PK) {
        const pk = fromHexString(PK.substr(2));
        const data = encoder.encode(Document);
        const encrypted = toBase64(ecies.encrypt(pk, data));
        console.log(encrypted);
        getTinyURL(encrypted).then(function(tinyURL) {
            const url = new URL(tinyURL);
            console.log(url);

            var CT = url.pathname.substr(1);
            console.log("CT before pwd:" + CT);
            if (password !== "") CT = XOR(CT, web3.utils.sha3(password));
            console.log("CT after pwd:" + CT);

            const A = new Date().getTime();
            const encodedA = web3.eth.abi.encodeParameter('uint256', A);
            const encodedut = web3.eth.abi.encodeParameter('uint256', ut);
            const encodedCT = web3.eth.abi.encodeParameter('bytes8', "0x" + toHex(CT)).slice(0, 18);
            console.log("encodedA:" + encodedA);
            console.log("encodedut:" + encodedut);
            console.log("encodedCT:" + encodedCT);
            clearInterval(dotsinterval);
            clearInterval(waitsubmissioninterval);
            waitsubmissioninterval = setInterval(setWaitSubmission, 2700);

            const contract = new web3.eth.Contract(contractTimelockPublicDisclosureABI, contractTimelockPublicDisclosureAddress);
            document.getElementById("status2").innerText = "";
            document.getElementById("status3").innerText = "";
            document.getElementById("status4").style.color = "yellow";
            document.getElementById("status5").innerText = "";
            document.getElementById("status4").innerText = "Document associated to identifier: " + A + " is going to be submitted...";
            try {
                contract.methods.PublishDocument(encodedA, encodedut, encodedCT).send({
                    from: From,
                    value: 0
                }).on("confirmation", function(confirmationNumber, receipt) {
                    console.log("transaction confirmed");

                    clearInterval(waitsubmissioninterval);
                    clearInterval(dotsinterval);
                    dotsinterval = setInterval(setDots, 1000);
                    // Update status
                    const txn = confirmationNumber.receipt.transactionHash;
                    const gasUsed = confirmationNumber.receipt.gasUsed;

                    document.getElementById("status4").innerHTML = "Document has been uploaded on-chain and is associated to identifier " + A + " in transaction <a href=\"https://" + CHAIN + ".etherscan.io/tx/" + txn + "\"target=\"_blank\">" + txn + "</a>";
                    document.getElementById("status4").style.color = "yellow";
                    document.getElementById("status5").innerText = "Gas Consumed: " + gasUsed;
                    document.getElementById("status5").style.color = "yellow";



                }).catch(err => {
                    clearInterval(waitsubmissioninterval);
                    clearInterval(dotsinterval);
                    dotsinterval = setInterval(setDots, 1000);
                    console.error("Failed to submit document on-chain. Error:", err);
                    document.getElementById("status4").innerText = "";
                    document.getElementById("status5").innerText = "Failed to submit document on-chain";
                    document.getElementById("status5").style.color = "red";

                });

            } catch (err) {
                clearInterval(waitsubmissioninterval);
                clearInterval(dotsinterval);
                dotsinterval = setInterval(setDots, 1000);
                console.error("Failed to submit document on-chain. Error:", err);
                document.getElementById("status4").innerText = "";
                document.getElementById("status5").innerText = "Failed to submit document on-chain";
                document.getElementById("status5").style.color = "red";

            }

        });
    }).catch(err => {

        swal("Timelock.zone service unavailable now. Try later.", {
            icon: "error",
        });
    });
}

// Load document function
async function Load() {
    // Get input values
    const A = document.getElementById("idinput").value;
    const password = document.getElementById("idpassword").value;
    const confirmedpassword = document.getElementById("idconfirmedpassword").value;
    if (!A) {

        swal("Identifier is required", {
            icon: "error",
        });
        console.error("identifier is required");
        return;
    }
    if (password !== "") {
        if (!await swal('You chose a non-empty password. The document will be decrypted with the chosen password.  Are you sure you want to continue?', {
                buttons: [true, true],
                icon: "warning",
            })) return;
        if (password !== confirmedpassword) {

            swal("Passwords do not match.", {
                icon: "error",
            });
            return;
        }

    }

    const accounts = await web3.eth.getAccounts();
    const myaddr = accounts[0];
    const contract = new web3.eth.Contract(contractTimelockPublicDisclosureABI, contractTimelockPublicDisclosureAddress);
    document.getElementById("status2").innerText = "";
    document.getElementById("status3").innerText = "";
    document.getElementById("status4").innerText = "";
    document.getElementById("status5").innerText = "";
    const encodedA = web3.eth.abi.encodeParameter('uint256', A);
    try {
        contract.methods.get_document(encodedA).call().then(function(contractData) {

            var CTdata = contractData.CT;
            if (CTdata === "error" || CTdata === "0x0000000000000000000000000000000000000000000000000000000000000000") {

                document.getElementById("status5").style.color = "red";
                document.getElementById("status4").style.color = "red";
                document.getElementById("status4").innerText = "";
                document.getElementById("status4").innerText = "No document with such identifier exists on-chain";
                return;
            }
            const ut = contractData.ut;
            if (password !== "") CTdata = XOR(web3.utils.toAscii(CTdata), web3.utils.sha3(password));
            else CTdata = web3.utils.toAscii(CTdata);
            getLongURL(CTdata).then(function(ct) {
                var CT = new URL(ct).pathname.substr(API_PATH.length);
                const localdate = new Date(ut * 1);
                if (new Date().getTime() < ut) {
                    swal("You must wait until " + localdate + " to decrypt.", {
                        icon: "error",
                    });
                    return;
                }

                const Round = UnixTimeToRound(ut);
                getSecretKeyfromUrl(Round, "secp256k1").then(function(SK) {
                    const sk = fromHexString(SK.substr(2));

                    CT = fromBase64(CT);
                    const decrypted = ecies.decrypt(sk, CT);
                    document.getElementById("documentinput").value = decoder.decode(decrypted);




                }).catch(err => {

                    swal("Timelock.zone service unavailable now. Try later.", {
                        icon: "error",
                    });
                });

            });
        });
    } catch (err) {
        document.getElementById("status5").style.color = "red";
        document.getElementById("status4").style.color = "red";
        document.getElementById("status4").innerText = "";
        document.getElementById("status4").innerText = "Failed to retrieve document";
    }

}




// Event Listener for Load Button
document.getElementById("loadButton").addEventListener("click", async () => {
    const metaMaskAvailable = await checkMetaMaskAvailability();
    if (metaMaskAvailable) {
        await Load();
    }
});







function toHex(txt) {
    const encoder = new TextEncoder();
    return Array
        .from(encoder.encode(txt))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}

function hexToBytes(hex) {
    let bytes = [];
    for (let c = 0; c < hex.length - 1; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function stringToBytes(s) {
    const utf8Encode = new TextEncoder();
    return utf8Encode.encode(s);
}