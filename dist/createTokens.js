"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.airdropTokens = exports.airdropLamps = exports.createATA = exports.getATA = exports.ScroogeCoinMint = exports.kryptMint = exports.airdropPDA = exports.airdropProgramId = void 0;
const Web3 = __importStar(require("@solana/web3.js"));
const spl_token_1 = require("@solana/spl-token");
const anchor_1 = require("@project-serum/anchor");
const buffer_1 = require("buffer");
const borsh = __importStar(require("@project-serum/borsh"));
const RPC_ENDPOINT_URL = "https://api.devnet.solana.com";
const commitment = 'confirmed';
const connection = new Web3.Connection(RPC_ENDPOINT_URL, commitment);
// MY WALLET SETTING
const id_json_path = require('os').homedir() + "/.config/solana/test-wallet.json";
const secret = Uint8Array.from(JSON.parse(require("fs").readFileSync(id_json_path)));
const wallet = Web3.Keypair.fromSecretKey(secret);
exports.airdropProgramId = new Web3.PublicKey("CPEV4ibq2VUv7UnNpkzUGL82VRzotbv2dy8vGwRfh3H3");
exports.airdropPDA = new Web3.PublicKey("99ynLfSvcRXwYMKv4kmbcAyGxhfD7KfgrsuHTx9Dvoot");
const userInputIx = (i, payer, user, mint, mintAuth) => {
    return new anchor_1.web3.TransactionInstruction({
        keys: [
            {
                pubkey: payer.publicKey,
                isSigner: true,
                isWritable: true,
            },
            {
                pubkey: user,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: mint,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: mintAuth,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: spl_token_1.TOKEN_PROGRAM_ID,
                isSigner: false,
                isWritable: false,
            }
        ],
        data: i,
        programId: exports.airdropProgramId,
    });
};
const IX_DATA_LAYOUT = borsh.struct([
    borsh.u8("variant"),
    borsh.u32("amount")
]);
// krypt mint pubkey here
exports.kryptMint = new Web3.PublicKey("DWiD4EVUtnsgqoGbdSK5kBjHRJ7XoGx58WPHBu7t73Dh");
exports.ScroogeCoinMint = new Web3.PublicKey("4AG5yRYmMcpMxcRvvkLPHHiSdnCnRQhtncs79CoQNnRQ");
const myKryptAta = new Web3.PublicKey("FPT48RU4kufR5bWjCL56tT3462oT6kY19P6R1fieHjga");
const myScroogeAta = new Web3.PublicKey("J755q58hJJvK4xcZsb4wG5432Pf1My2QhwDLtV7KdM9s");
function createTokenMint() {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = new Web3.Transaction();
        // create mint address w pda as authority
        const tokenMint = yield (0, spl_token_1.createMint)(connection, wallet, exports.airdropPDA, null, 9 // We are using 9 to match the CLI decimal default exactly
        );
        console.log("scroogeCoin mint pubkey: ", tokenMint.toBase58());
        let signers = [wallet];
        let txid = yield Web3.sendAndConfirmTransaction(connection, tx, signers, {
            skipPreflight: true,
            preflightCommitment: "confirmed",
        });
        console.log("tx signature " + txid);
        console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
        // sleep to allow time to update
        yield new Promise((resolve) => setTimeout(resolve, 1000));
        const mintInfo = yield (0, spl_token_1.getMint)(connection, tokenMint);
        console.log(mintInfo);
    });
}
function getATA(mint, owner) {
    return __awaiter(this, void 0, void 0, function* () {
        let ata = yield (0, spl_token_1.getAssociatedTokenAddress)(mint, // mint
        owner, // owner
        true // allow owner off curve
        );
        return ata;
    });
}
exports.getATA = getATA;
function createATA(mint, owner, payer) {
    return __awaiter(this, void 0, void 0, function* () {
        // get or create ATA
        let ata = yield (0, spl_token_1.getAssociatedTokenAddress)(mint, // mint
        owner, // owner
        true // allow owner off curve
        );
        //console.log(`ata: ${ata.toBase58()}`)
        const ix = yield (0, spl_token_1.createAssociatedTokenAccountInstruction)(payer.publicKey, // payer
        ata, // ata
        owner, // owner
        mint // mint
        );
        return ix;
    });
}
exports.createATA = createATA;
function mintTokens(amount, user, mint, mintAuth) {
    return __awaiter(this, void 0, void 0, function* () {
        let ata = yield (0, spl_token_1.getAssociatedTokenAddress)(mint, user.publicKey, false);
        let txid = yield (0, spl_token_1.mintToChecked)(connection, user, mint, ata, mintAuth, amount / 0.000000001, 9);
        console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
    });
}
function airdropLamps(user) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield connection.getBalance(user)) < 1.0) {
            console.log("Requesting Airdrop of 2 SOL...");
            yield connection.requestAirdrop(user, 2e9);
            console.log("Airdrop received");
        }
    });
}
exports.airdropLamps = airdropLamps;
function airdropTokens(amount, payer, userTokenAcct, mint, mintAuth) {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = new Web3.Transaction();
        const payload = {
            variant: 0,
            amount: amount
        };
        const ixBuffer = buffer_1.Buffer.alloc(9);
        IX_DATA_LAYOUT.encode(payload, ixBuffer);
        //console.log(ixBuffer)
        const ix = userInputIx(ixBuffer, payer, userTokenAcct, mint, mintAuth);
        tx.add(ix);
        if ((yield connection.getBalance(wallet.publicKey)) < 1.0) {
            console.log("Requesting Airdrop of 2 SOL...");
            yield connection.requestAirdrop(wallet.publicKey, 2e9);
            console.log("Airdrop received");
        }
        return tx;
    });
}
exports.airdropTokens = airdropTokens;
function changeAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        let pda = (yield Web3.PublicKey.findProgramAddress([], exports.airdropProgramId))[0];
        console.log("PDA: " + pda);
        //setAuthority(connection, wallet, kryptMint, authKeypair, AuthorityType.MintTokens, pda)
    });
}
function fetchMintInfo(mint) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const mintInfo = yield (0, spl_token_1.getMint)(connection, mint);
        console.log(mintInfo);
        console.log("authority: ", (_a = mintInfo.mintAuthority) === null || _a === void 0 ? void 0 : _a.toBase58());
    });
}
