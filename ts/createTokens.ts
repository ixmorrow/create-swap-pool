import * as Web3 from '@solana/web3.js'
import { TokenSwap, TOKEN_SWAP_PROGRAM_ID } from "@solana/spl-token-swap"
import { createInitializeMintInstruction, AuthorityType, setAuthority, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getMint, createMint,
  getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo, mintToChecked } from '@solana/spl-token'
import { web3 } from '@project-serum/anchor'
import { Buffer } from 'buffer';
import * as borsh from "@project-serum/borsh";

const RPC_ENDPOINT_URL = "https://api.devnet.solana.com";
const commitment = 'confirmed';
const connection = new Web3.Connection(RPC_ENDPOINT_URL, commitment);

// MY WALLET SETTING
const id_json_path = require('os').homedir() + "/.config/solana/test-wallet.json";
const secret = Uint8Array.from(JSON.parse(require("fs").readFileSync(id_json_path)));
const wallet = Web3.Keypair.fromSecretKey(secret as Uint8Array);

export const airdropProgramId = new Web3.PublicKey("CPEV4ibq2VUv7UnNpkzUGL82VRzotbv2dy8vGwRfh3H3")
export const airdropPDA = new Web3.PublicKey("99ynLfSvcRXwYMKv4kmbcAyGxhfD7KfgrsuHTx9Dvoot")

 const userInputIx = (i: Buffer, payer: Web3.PublicKey, user: Web3.PublicKey, mint: Web3.PublicKey, mintAuth: Web3.PublicKey) => {
  return new web3.TransactionInstruction({
    keys: [
      {
        pubkey: payer,
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
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      }
    ],
    data: i,
    programId: airdropProgramId,
  });
};

const IX_DATA_LAYOUT = borsh.struct([
  borsh.u8("variant"),
  borsh.u32("amount")
]);

// krypt mint pubkey here
export const kryptMint = new Web3.PublicKey("DWiD4EVUtnsgqoGbdSK5kBjHRJ7XoGx58WPHBu7t73Dh")
export const ScroogeCoinMint = new Web3.PublicKey("4AG5yRYmMcpMxcRvvkLPHHiSdnCnRQhtncs79CoQNnRQ")

const myKryptAta = new Web3.PublicKey("FPT48RU4kufR5bWjCL56tT3462oT6kY19P6R1fieHjga")
const myScroogeAta = new Web3.PublicKey("J755q58hJJvK4xcZsb4wG5432Pf1My2QhwDLtV7KdM9s")



async function createTokenMint(){

    const tx = new Web3.Transaction()

    // create mint address w pda as authority
    const tokenMint = await createMint(
        connection,
        wallet,
        airdropPDA,
        null,
        9 // We are using 9 to match the CLI decimal default exactly
      )
    console.log("scroogeCoin mint pubkey: ", tokenMint.toBase58())


    let signers = [wallet]
    
    let txid = await Web3.sendAndConfirmTransaction(connection, tx, signers, {
        skipPreflight: true,
        preflightCommitment: "confirmed",
    })

    console.log("tx signature " + txid)
    console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`)

    // sleep to allow time to update
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mintInfo = await getMint(
        connection,
        tokenMint
      )
      
      console.log(mintInfo);
}

export async function getATA(mint: Web3.PublicKey, owner: Web3.PublicKey) {
  let ata = await getAssociatedTokenAddress(
    mint, // mint
    owner, // owner
    true // allow owner off curve
  )
  return ata
}

export async function createATA(mint: Web3.PublicKey, owner: Web3.PublicKey, payer: Web3.Keypair){
    // get or create ATA
    let ata = await getAssociatedTokenAddress(
        mint, // mint
        owner, // owner
        true // allow owner off curve
      )
      //console.log(`ata: ${ata.toBase58()}`)
  
        const ix = await createAssociatedTokenAccountInstruction(
          payer.publicKey, // payer
          ata, // ata
          owner, // owner
          mint // mint
        )

    return ix
}

async function mintTokens(amount: number, user: Web3.Keypair, mint: Web3.PublicKey, mintAuth: Web3.Keypair){
    let ata = await getAssociatedTokenAddress(
        mint,
        user.publicKey,
        false
    )

    let txid = await mintToChecked(
        connection,
        user,
        mint,
        ata,
        mintAuth,
        amount/0.000000001,
        9
    )

    console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`)
}


export async function airdropLamps(user: Web3.PublicKey){
  if ((await connection.getBalance(user)) < 1.0) {
    console.log("Requesting Airdrop of 2 SOL...");
    await connection.requestAirdrop(user, 2e9);
    console.log("Airdrop received");
  }
}

export async function airdropTokens(amount: number, payer: web3.PublicKey, userTokenAcct: Web3.PublicKey, mint: Web3.PublicKey, mintAuth: Web3.PublicKey){
  //const tx = new Web3.Transaction()
  const payload = {
    variant: 0,
    amount: amount
  }
  const ixBuffer = Buffer.alloc(9);
  IX_DATA_LAYOUT.encode(payload, ixBuffer)
  
  const ix = userInputIx(ixBuffer, payer, userTokenAcct, mint, mintAuth)
  //tx.add(ix)

  if ((await connection.getBalance(wallet.publicKey)) < 1.0) {
    console.log("Requesting Airdrop of 2 SOL...");
    await connection.requestAirdrop(wallet.publicKey, 2e9);
    console.log("Airdrop received");
  }

  return ix
}

async function changeAuth(){
  let pda = (await Web3.PublicKey.findProgramAddress(
    [],
    airdropProgramId
  ))[0];
  console.log("PDA: " + pda);

  //setAuthority(connection, wallet, kryptMint, authKeypair, AuthorityType.MintTokens, pda)
}

async function fetchMintInfo(mint: Web3.PublicKey){
  const mintInfo = await getMint(
    connection,
    mint
  )
  
  console.log(mintInfo);
  console.log("authority: ", mintInfo.mintAuthority?.toBase58())
}