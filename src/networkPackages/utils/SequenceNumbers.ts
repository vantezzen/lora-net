function twosComplementSubtract(a: number, b: number): number {
    return a + (~b + 1);
}

export function withBitOverflow(number: number) {
  // Int8Array to achieve overflow
  return new Int8Array([ number ])[0]
}

export function isSeqNumNewer(incomming: number, current: number): boolean {
  return withBitOverflow(twosComplementSubtract(incomming, current)) > 0;
}
export function isSeqNumNewerOrEqual(incomming: number, current: number): boolean {
  return isSeqNumNewer(incomming, current) || incomming === current;
}