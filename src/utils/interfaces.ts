export type TRandomWalletKeyType = "secp256k1" | "ed25519";

export interface IRandomWallet {
  privateKey: string;
  publicKey: string;
  address: string;
  keyType: TRandomWalletKeyType; 
}
