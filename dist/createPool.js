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
const createTokens_1 = require("./createTokens");
const spl_token_swap_1 = require("@solana/spl-token-swap");
const Web3 = __importStar(require("@solana/web3.js"));
const spl_token_swap_2 = require("@project-serum/spl-token-swap");
const spl_token_1 = require("@solana/spl-token");
const utils_1 = require("./utils");
const RPC_ENDPOINT_URL = "https://api.devnet.solana.com";
const commitment = 'confirmed';
const connection = new Web3.Connection(RPC_ENDPOINT_URL, commitment);
// MY WALLET SETTING
const id_json_path = require('os').homedir() + "/.config/solana/test-wallet.json";
const secret = Uint8Array.from(JSON.parse(require("fs").readFileSync(id_json_path)));
const wallet = Web3.Keypair.fromSecretKey(secret);
const FEE_OWNER = new Web3.PublicKey("HfoTxFR1Tm6kGmWgYWD6J7YHVy1UwqSULUGVLXkJqaKN");
function createTokenSwap() {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = new Web3.Transaction();
        // token swap state account
        console.log('creating swap state account');
        let tokenSwapStateAccount = Web3.Keypair.generate();
        console.log("Swap State account: ", tokenSwapStateAccount.publicKey.toBase58());
        const swapAcctIx = yield Web3.SystemProgram.createAccount({
            newAccountPubkey: tokenSwapStateAccount.publicKey,
            fromPubkey: wallet.publicKey,
            lamports: yield spl_token_swap_1.TokenSwap.getMinBalanceRentForExemptTokenSwap(connection),
            space: spl_token_swap_1.TokenSwapLayout.span,
            programId: spl_token_swap_1.TOKEN_SWAP_PROGRAM_ID
        });
        tx.add(swapAcctIx);
        // derive pda from Token swap program for swap authority
        const [swapAuthority, bump] = yield Web3.PublicKey.findProgramAddress([tokenSwapStateAccount.publicKey.toBuffer()], spl_token_swap_1.TOKEN_SWAP_PROGRAM_ID);
        console.log("Swap authority PDA: ", swapAuthority.toBase58());
        // create Associated Token Accounts owned by the swap auth PDA that will be used as pool accounts and airdrop tokens
        const tokenAPoolATAIX = yield (0, createTokens_1.createATA)(createTokens_1.kryptMint, swapAuthority, wallet);
        tx.add(tokenAPoolATAIX);
        const tokenBPoolATAIX = yield (0, createTokens_1.createATA)(createTokens_1.ScroogeCoinMint, swapAuthority, wallet);
        tx.add(tokenBPoolATAIX);
        // airdrop tokens to these new ATA's
        const tokenAPoolATA = yield (0, createTokens_1.getATA)(createTokens_1.kryptMint, swapAuthority);
        console.log("Krypt token account: ", tokenAPoolATA.toBase58());
        const tokenBPoolATA = yield (0, createTokens_1.getATA)(createTokens_1.ScroogeCoinMint, swapAuthority);
        console.log("ScroogeCoing token account: ", tokenBPoolATA.toBase58());
        // airdropping tokens
        const airdropAIx = yield (0, createTokens_1.airdropTokens)(10000, wallet.publicKey, tokenAPoolATA, createTokens_1.kryptMint, createTokens_1.airdropPDA);
        tx.add(airdropAIx);
        const airdropBIx = yield (0, createTokens_1.airdropTokens)(10000, wallet.publicKey, tokenBPoolATA, createTokens_1.ScroogeCoinMint, createTokens_1.airdropPDA);
        tx.add(airdropBIx);
        // create pool token mint and pool token accounts
        console.log('creating pool mint');
        const poolTokenMint = yield (0, spl_token_1.createMint)(connection, wallet, swapAuthority, null, 2);
        console.log("Pool mint: ", poolTokenMint.toBase58());
        console.log('creating pool account');
        const tokenAccountPool = Web3.Keypair.generate();
        tx.add(
        // create account
        Web3.SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: tokenAccountPool.publicKey,
            space: spl_token_1.ACCOUNT_SIZE,
            lamports: yield (0, spl_token_1.getMinimumBalanceForRentExemptAccount)(connection),
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        }), 
        // init token account
        (0, spl_token_1.createInitializeAccountInstruction)(tokenAccountPool.publicKey, poolTokenMint, wallet.publicKey));
        console.log("Token Account Pool: ", tokenAccountPool.publicKey.toBase58());
        // create fee account, this is where all swap fees will be paid
        // must be owned by the FEE_OWNER, requirement of token swap program
        const feeAccountATAIX = yield (0, createTokens_1.createATA)(poolTokenMint, FEE_OWNER, wallet);
        tx.add(feeAccountATAIX);
        const feeAccountAta = yield (0, createTokens_1.getATA)(poolTokenMint, FEE_OWNER);
        console.log("Fee acount: ", feeAccountAta.toBase58());
        // Pool fees
        const poolConfig = {
            curveType: spl_token_swap_2.CurveType.ConstantProduct,
            fees: {
                tradeFeeNumerator: 0,
                tradeFeeDenominator: 10000,
                ownerTradeFeeNumerator: 5,
                ownerTradeFeeDenominator: 10000,
                ownerWithdrawFeeNumerator: 0,
                ownerWithdrawFeeDenominator: 0,
                hostFeeNumerator: 20,
                hostFeeDenominator: 100
            }
        };
        const createSwapIx = yield (0, utils_1.createInitSwapInstruction)(tokenSwapStateAccount.publicKey, swapAuthority, tokenAPoolATA, tokenBPoolATA, poolTokenMint, feeAccountAta, tokenAccountPool.publicKey, spl_token_1.TOKEN_PROGRAM_ID, spl_token_swap_1.TOKEN_SWAP_PROGRAM_ID, bump, poolConfig);
        tx.add(createSwapIx);
        console.log("sending tx");
        let txid = yield Web3.sendAndConfirmTransaction(connection, tx, [wallet, tokenSwapStateAccount, tokenAccountPool], {
            skipPreflight: true,
            preflightCommitment: "confirmed",
        });
        console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
    });
}
createTokenSwap();
