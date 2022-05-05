import { airdropTokens, createATA, kryptMint, ScroogeCoinMint, airdropLamps, airdropPDA, airdropProgramId, getATA } from "./createTokens";
import { Numberu64, TokenSwap, TOKEN_SWAP_PROGRAM_ID, TokenSwapLayout } from "@solana/spl-token-swap"
import * as Web3 from '@solana/web3.js'
import { PoolConfig, CurveType } from "@project-serum/spl-token-swap"
import { createMint, getAccount, ACCOUNT_SIZE, getMint, getMinimumBalanceForRentExemptAccount, createInitializeAccountInstruction, TOKEN_PROGRAM_ID, MintLayout, createInitializeMintInstruction } from "@solana/spl-token";
import * as BufferLayout from '@solana/buffer-layout';
import { createInitSwapInstruction, UTILS_TOKEN_PROGRAM_ID } from "./utils";

const RPC_ENDPOINT_URL = "https://api.devnet.solana.com";
const commitment = 'confirmed';
const connection = new Web3.Connection(RPC_ENDPOINT_URL, commitment);

// MY WALLET SETTING
const id_json_path = require('os').homedir() + "/.config/solana/test-wallet.json";
const secret = Uint8Array.from(JSON.parse(require("fs").readFileSync(id_json_path)));
const wallet = Web3.Keypair.fromSecretKey(secret as Uint8Array);

const FEE_OWNER = new Web3.PublicKey("HfoTxFR1Tm6kGmWgYWD6J7YHVy1UwqSULUGVLXkJqaKN")

async function createTokenSwap(
) {

    const tx = new Web3.Transaction()

    // token swap state account
    console.log('creating swap state account')
    let tokenSwapStateAccount = Web3.Keypair.generate()
    console.log("Swap State account: ", tokenSwapStateAccount.publicKey.toBase58())

    const swapAcctIx = await Web3.SystemProgram.createAccount({
        newAccountPubkey: tokenSwapStateAccount.publicKey,
        fromPubkey: wallet.publicKey,
        lamports: await TokenSwap.getMinBalanceRentForExemptTokenSwap(connection),
        space: TokenSwapLayout.span,
        programId: TOKEN_SWAP_PROGRAM_ID
    })
    tx.add(swapAcctIx)

    // derive pda from Token swap program for swap authority
    const [swapAuthority, bump] = await Web3.PublicKey.findProgramAddress(
        [tokenSwapStateAccount.publicKey.toBuffer()],
        TOKEN_SWAP_PROGRAM_ID,
    )
    console.log("Swap authority PDA: ", swapAuthority.toBase58())
    
    // create Associated Token Accounts owned by the swap auth PDA that will be used as pool accounts and airdrop tokens
    const tokenAPoolATAIX = await createATA(kryptMint, swapAuthority, wallet)
    tx.add(tokenAPoolATAIX)
    const tokenBPoolATAIX = await createATA(ScroogeCoinMint, swapAuthority, wallet)
    tx.add(tokenBPoolATAIX)
    // airdrop tokens to these new ATA's
    const tokenAPoolATA = await getATA(kryptMint, swapAuthority)
    console.log("Krypt token account: ", tokenAPoolATA.toBase58())
    const tokenBPoolATA = await getATA(ScroogeCoinMint, swapAuthority)
    console.log("ScroogeCoing token account: ",tokenBPoolATA.toBase58())
    // airdropping tokens
    const airdropAIx = await airdropTokens(10000, wallet, tokenAPoolATA, kryptMint, airdropPDA)
    tx.add(airdropAIx)
    const airdropBIx = await airdropTokens(10000, wallet, tokenBPoolATA, ScroogeCoinMint, airdropPDA)
    tx.add(airdropBIx)

    // create pool token mint and pool token accounts
    console.log('creating pool mint')
    const poolTokenMint = await createMint(
        connection,
        wallet,
        swapAuthority,
        null,
        2
    )
    console.log("Pool mint: ", poolTokenMint.toBase58())
   
    console.log('creating pool account')
    const tokenAccountPool = Web3.Keypair.generate()
    tx.add(
      // create account
      Web3.SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: tokenAccountPool.publicKey,
        space: ACCOUNT_SIZE,
        lamports: await getMinimumBalanceForRentExemptAccount(connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      // init token account
      createInitializeAccountInstruction(tokenAccountPool.publicKey, poolTokenMint, wallet.publicKey)
    )
    console.log("Token Account Pool: ", tokenAccountPool.publicKey.toBase58())

    // create fee account, this is where all swap fees will be paid
    // must be owned by the FEE_OWNER, requirement of token swap program
    const feeAccountATAIX = await createATA(poolTokenMint, FEE_OWNER, wallet)
    tx.add(feeAccountATAIX)
    const feeAccountAta = await getATA(poolTokenMint, FEE_OWNER)
    console.log("Fee acount: ", feeAccountAta.toBase58())

    // Pool fees
    const poolConfig: PoolConfig = {
      curveType: CurveType.ConstantProduct,
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
    }

    const createSwapIx = await createInitSwapInstruction(
      tokenSwapStateAccount.publicKey,
      swapAuthority,
      tokenAPoolATA,
      tokenBPoolATA,
      poolTokenMint,
      feeAccountAta,
      tokenAccountPool.publicKey,
      TOKEN_PROGRAM_ID,
      TOKEN_SWAP_PROGRAM_ID,
      bump,
      poolConfig
    )
    
    tx.add(createSwapIx)

    console.log("sending tx");
    let txid = await Web3.sendAndConfirmTransaction(connection, tx, [wallet, tokenSwapStateAccount, tokenAccountPool], {
      skipPreflight: true,
      preflightCommitment: "confirmed",
    });
    
    console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
    
}

createTokenSwap()