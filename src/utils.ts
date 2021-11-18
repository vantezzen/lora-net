/**
 * Let the program wait for a given amount of time.
 * 
 * @param ms Milliseconds to wait.
 * @returns Promise that resolves after the given amount of time.
 */
export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convert a binary bit-array to a byte-buffer.
 * 
 * This is the reverse function for bufferToBinaryArray (see below).
 * bufferToBinaryArray(binaryArrayToBuffer(buffer)) == buffer
 * 
 * @param binary Binary array
 * @returns Buffer with byte data
 */
export function binaryArrayToBuffer(binary: number[]): Buffer {
  let outputBuffer = Buffer.alloc(binary.length / 8);
  
  for (let i = 0; i < binary.length; i+=8) {
    let binaryItem = parseInt(binary.slice(i, i + 8).join(""), 2);
    outputBuffer[i / 8] = binaryItem;
  }
  return outputBuffer;  
}

/**
 * Convert a Byte-Buffer to a binary array.
 * 
 * E.g. bufferToBinaryArray(Buffer.from([0x01, 0x02, 0x03, 0x04]))
 *  => [
 *  0, 0, 0, 0, 0, 0, 0, 1, 0,
 *  0, 0, 0, 0, 0, 1, 0, 0, 0,
 *  0, 0, 0, 0, 1, 1, 0, 0, 0,
 *  0, 0, 1, 0, 0
 * ]
 * 
 * @param buffer Buffer to convert
 * @returns Array containing bit information
 */
export function bufferToBinaryArray(buffer: Buffer): number[] {
  let outputArray: number[] = [];
  for (let i = 0; i < buffer.length; i++) {
    let binary = buffer[i].toString(2);
    while (binary.length < 8) {
      binary = "0" + binary;
    }
    outputArray.push(...binary.split("").map(x => parseInt(x, 2)));
  }
  return outputArray;
}