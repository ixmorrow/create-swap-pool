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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fee_account = exports.token_account_pool = exports.pool_mint = exports.pool_scrooge_account = exports.pool_krypt_account = exports.swap_authority = exports.token_swap_state_account = void 0;
const Web3 = __importStar(require("@solana/web3.js"));
exports.token_swap_state_account = new Web3.PublicKey("EV7FEEq2EyTFtKx4ukp2QfW9mWLGcJckGGBNp5cjcHUe");
exports.swap_authority = new Web3.PublicKey("24zqZMTYLVk4gm62seqU7KhBwvi3uBGtyDbnsC4rkbuR");
exports.pool_krypt_account = new Web3.PublicKey("BVPUZrv5nk3jMyTWkZdxvp2LuyPF1DmGTyR8AzKvgZgN");
exports.pool_scrooge_account = new Web3.PublicKey("5ttkBtMndCbHdSib22K4wRUE5ifprPXkMSckzBRSQv3K");
exports.pool_mint = new Web3.PublicKey("CXQYDT9ShDYG1JMMwjNiR6TcL4u4uJNnguAbLKw6jVv4");
exports.token_account_pool = new Web3.PublicKey("Fp1W1KHuakombQATnToDCSpTnqLicFEfxWgtCAWbuvCM");
exports.fee_account = new Web3.PublicKey("EY4hgx73saq9xuLr85HNaxGMAK6R5TkvuSDchKbpt291");
