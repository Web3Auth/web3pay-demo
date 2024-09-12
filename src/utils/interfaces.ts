export type TRandomWalletKeyType = "secp256k1" | "ed25519";

export interface IRandomWallet {
  privateKey: string;
  publicKey: string;
  address: string;
  keyType: TRandomWalletKeyType;
}

export type SelectedEnv = "local" | "testing" | "staging" | "production";

export type ImportFlowStep =
  | "start"
  | "create"
  | "fundToken"
  | "import"
  | "mintNft"
  | "completed";

export type NonImportFlowStep = "start" | "fundToken" | "mintNft" | "completed";

export type ConnectWeb3PayStep = "start" | "connect" | "completed";

export interface ISdkErorr {
  code: number;
  message: string;
}
