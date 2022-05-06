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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapInstruction = exports.uint64 = void 0;
const createTokens_1 = require("./createTokens");
const spl_token_swap_1 = require("@solana/spl-token-swap");
const Web3 = __importStar(require("@solana/web3.js"));
//import { PoolConfig, CurveType } from "@project-serum/spl-token-swap"
const spl_token_1 = require("@solana/spl-token");
const consts_1 = require("./consts");
const BufferLayout = require('buffer-layout');
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_layout_1 = require("buffer-layout");
const RPC_ENDPOINT_URL = "https://api.devnet.solana.com";
const commitment = 'confirmed';
const connection = new Web3.Connection(RPC_ENDPOINT_URL, commitment);
// MY WALLET SETTING
const id_json_path = require('os').homedir() + "/.config/solana/test-wallet.json";
const secret = Uint8Array.from(JSON.parse(require("fs").readFileSync(id_json_path)));
const wallet = Web3.Keypair.fromSecretKey(secret);
function swap() {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = new Web3.Transaction();
        const userSource = yield (0, createTokens_1.getATA)(createTokens_1.kryptMint, wallet.publicKey);
        const userDestination = yield (0, createTokens_1.getATA)(createTokens_1.ScroogeCoinMint, wallet.publicKey);
        // const airdropIx = await airdropTokens(10, wallet.publicKey, userSource, kryptMint, airdropPDA)
        // tx.add(airdropIx)
        // const swapIx = await swapInstruction(
        //     token_swap_state_account,
        //     swap_authority,
        //     wallet.publicKey,
        //     userSource,
        //     pool_krypt_account,
        //     pool_scrooge_account,
        //     userDestination,
        //     pool_mint,
        //     fee_account,
        //     TOKEN_SWAP_PROGRAM_ID,
        //     TOKEN_PROGRAM_ID,
        //     5,
        //     0.5
        // )
        const swapIx = spl_token_swap_1.TokenSwap.swapInstruction(consts_1.token_swap_state_account, consts_1.swap_authority, wallet.publicKey, userSource, consts_1.pool_krypt_account, consts_1.pool_scrooge_account, userDestination, consts_1.pool_mint, consts_1.fee_account, null, spl_token_swap_1.TOKEN_SWAP_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, 1e9, 1);
        tx.add(swapIx);
        console.log("sending tx");
        let txid = yield Web3.sendAndConfirmTransaction(connection, tx, [wallet], {
            skipPreflight: true,
            preflightCommitment: "confirmed",
        });
        console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
    });
}
const uint64 = (property = 'uint64') => {
    return (0, buffer_layout_1.blob)(8, property);
};
exports.uint64 = uint64;
const swapInstruction = (tokenSwap, authority, transferAuthority, userSource, poolSource, poolDestination, userDestination, poolMint, feeAccount, swapProgramId, tokenProgramId, amountIn, minimumAmountOut, programOwner) => {
    const dataLayout = buffer_layout_1.Layout.struct([
        BufferLayout.u8("instruction"),
        buffer_layout_1.Layout.nu64("amountIn"),
        buffer_layout_1.Layout.nu64("minimumAmountOut")
    ]);
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode({
        instruction: 1,
        amountIn: new bn_js_1.default(amountIn),
        minimumAmountOut: new bn_js_1.default(minimumAmountOut)
    }, data);
    const keys = [
        { pubkey: tokenSwap, isSigner: false, isWritable: false },
        { pubkey: authority, isSigner: false, isWritable: false },
        { pubkey: transferAuthority, isSigner: true, isWritable: false },
        { pubkey: userSource, isSigner: false, isWritable: true },
        { pubkey: poolSource, isSigner: false, isWritable: true },
        { pubkey: poolDestination, isSigner: false, isWritable: true },
        { pubkey: userDestination, isSigner: false, isWritable: true },
        { pubkey: poolMint, isSigner: false, isWritable: true },
        { pubkey: feeAccount, isSigner: false, isWritable: true },
        { pubkey: tokenProgramId, isSigner: false, isWritable: false },
    ];
    return new Web3.TransactionInstruction({
        keys,
        programId: swapProgramId,
        data,
    });
};
exports.swapInstruction = swapInstruction;
swap();
