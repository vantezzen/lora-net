import Network from "../Network";
const debug = require('debug')('lora:Timeout');

/**
 * Timeout class
 * Handles timeouts between network requests
 */
export default class Timeout {
  private network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  /**
   * Get next of the next timeout in milliseconds
   * 
   * @returns Timeout length
   */
  public getNextTimeout(): number {
    const length = Math.round(Math.random() * 1000 * 60);
    debug('Timing out for', length, 'ms');
    return length;
  }

  /**
   * Get a promise that resolves after the timeout
   * 
   * @returns Promise that should be awaited
   */
  public wait() {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, this.getNextTimeout());
    });
  }
}