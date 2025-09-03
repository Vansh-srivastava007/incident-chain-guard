// Client-side crypto utilities for blockchain simulation

export async function generateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateMockTxId(): string {
  const prefix = '0x';
  const randomHex = Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return prefix + randomHex;
}

export function generateBlockchainExplorerUrl(txId: string): string {
  return `https://polygonscan.com/tx/${txId}`;
}