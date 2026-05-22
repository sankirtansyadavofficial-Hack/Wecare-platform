import * as StellarSdk from "@stellar/stellar-sdk";

// ─── Configuration ───────────────────────────────────────────────
const HORIZON_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const FRIENDBOT_URL = "https://friendbot.stellar.org";

// Pre-configured NGO destination wallets (testnet demo addresses)
// In production, these would be real verified NGO Stellar accounts
export const NGO_WALLETS: Record<string, { publicKey: string; label: string }> = {
  "human-health": {
    publicKey: "GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR",
    label: "WeCare Child Health Fund"
  },
  "animal-rescue": {
    publicKey: "GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR",
    label: "WeCare Animal Rescue Fund"
  }
};

// ─── Wallet Management ───────────────────────────────────────────

const WALLET_STORAGE_KEY = "wecare_stellar_wallet";

export interface StellarWallet {
  publicKey: string;
  secretKey: string;
}

/**
 * Generate a brand-new Stellar keypair and persist it to localStorage.
 */
export function generateWallet(): StellarWallet {
  const keypair = StellarSdk.Keypair.random();
  const wallet: StellarWallet = {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
  return wallet;
}

/**
 * Load an existing wallet from localStorage, or return null.
 */
export function loadWallet(): StellarWallet | null {
  const raw = localStorage.getItem(WALLET_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StellarWallet;
  } catch {
    return null;
  }
}

/**
 * Clear the stored wallet from localStorage.
 */
export function clearWallet(): void {
  localStorage.removeItem(WALLET_STORAGE_KEY);
}

// ─── Friendbot Funding ───────────────────────────────────────────

/**
 * Fund a testnet account with 10,000 XLM via Stellar Friendbot.
 * Only works on the Stellar Testnet.
 */
export async function fundWithFriendbot(publicKey: string): Promise<boolean> {
  const response = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    // If account already exists / already funded, that's fine
    if (errData?.detail?.includes("createAccountAlreadyExist")) {
      return true;
    }
    throw new Error(errData?.detail || `Friendbot funding failed (HTTP ${response.status})`);
  }
  return true;
}

// ─── Balance ─────────────────────────────────────────────────────

/**
 * Get the native XLM balance for a Stellar public key.
 */
export async function getBalance(publicKey: string): Promise<string> {
  try {
    const server = new StellarSdk.Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (b: any) => b.asset_type === "native"
    );
    return nativeBalance ? nativeBalance.balance : "0";
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return "0"; // Account doesn't exist yet
    }
    throw err;
  }
}

// ─── Send Payment ────────────────────────────────────────────────

export interface TransactionResult {
  success: boolean;
  hash: string;
  ledger: number;
  fee: string;
  timestamp: string;
  explorerUrl: string;
}

/**
 * Build, sign, and submit a payment transaction on the Stellar testnet.
 *
 * @param senderSecret  - The sender's secret key (starts with 'S')
 * @param destination   - The destination public key (starts with 'G')
 * @param amount        - Amount of XLM to send (e.g. "100")
 * @param memo          - Optional memo text (max 28 chars)
 */
export async function sendPayment(
  senderSecret: string,
  destination: string,
  amount: string,
  memo?: string
): Promise<TransactionResult> {
  const server = new StellarSdk.Horizon.Server(HORIZON_URL);
  const sourceKeypair = StellarSdk.Keypair.fromSecret(senderSecret);

  // Load the source account to get the current sequence number
  const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

  // Build the transaction
  const txBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: (await server.fetchBaseFee()).toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  // Add payment operation
  txBuilder.addOperation(
    StellarSdk.Operation.payment({
      destination,
      asset: StellarSdk.Asset.native(),
      amount: String(amount),
    })
  );

  // Add optional memo
  if (memo) {
    txBuilder.addMemo(StellarSdk.Memo.text(memo.substring(0, 28)));
  }

  // Set timeout and build
  const transaction = txBuilder.setTimeout(30).build();

  // Sign the transaction
  transaction.sign(sourceKeypair);

  // Submit to the network
  const response = await server.submitTransaction(transaction);

  return {
    success: true,
    hash: response.hash,
    ledger: response.ledger,
    fee: response.fee_charged || "100",
    timestamp: new Date().toISOString(),
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${response.hash}`,
  };
}

/**
 * Shortens a Stellar public key for display: GABCD...WXYZ
 */
export function shortenKey(key: string, chars: number = 6): string {
  if (key.length <= chars * 2) return key;
  return `${key.substring(0, chars)}...${key.substring(key.length - chars)}`;
}
