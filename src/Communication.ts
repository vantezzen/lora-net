import chalk from "chalk";
import Connection from "./Connection";
import { wait } from "./utils";

/**
 * Layer 2: Communication
 * Handle communication with the module and simplify the process of sending and receiving data.
 */
export default class Communication {
  // Connection used as the lower layer
  private connection: Connection;

  /**
   * Internal: Log a message to the console
   * 
   * @param args 
   */
  private log(...args: any[]) {
    console.log(chalk.green("Communication:"), ...args);
  }

  /**
   * Setup the communication layer
   * 
   * @param connection Layer 1 connection to use
   */
  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Setup the module
   * 
   * @return Promise that resolves when the module is ready
   */
  async setup(): Promise<void> {
    this.log("Setting up");
    await this.connection.send("AT+CFG=433000000,5,6,12,4,1,0,0,0,0,3000,8,8");
    await this.waitForMessage("OK");
    await wait(this.connection.PAUSE_LENGTH);
  }

  /**
   * Send a message to the network over the module
   * 
   * This method will automatically add the required "AT+SEND" instruction
   * and wait for the actions to complete.
   * 
   * @param message Message to send to the network
   * @return Promise that resolves when the message has been sent
   */
  async sendMessage(message: string): Promise<void> {
    const length = message.length;

    await this.connection.send("AT+SEND=" + length);
    await wait(this.connection.PAUSE_LENGTH);

    await this.connection.send(message);
    await this.waitForMessage("SENDED");
    await wait(this.connection.PAUSE_LENGTH);
  }

  /**
   * Get a promise that resolves once a message with specified content is received
   * 
   * This will match if the received message *contains* the specified content, i.e.
   * calling this method with "TEST" will match incomming texts with content
   * "TEST", "TESTING" and "TESTING123" etc.
   * 
   * @param message Message to test for
   * @param timeout Timeout in ms after which the promise will reject
   * @returns Promise
   */
  public waitForMessage(message: String | null = null, timeout = 10000): Promise<string> {
    return new Promise((resolve, reject) => {
      const listener = (data: string) => {
        if (message === null || data.includes(message as string)) {
          this.connection.removeListener(listener);
          clearTimeout(timeoutItem);
          resolve(data);
        }
      };

      this.connection.onData(listener);

      let timeoutItem = setTimeout(() => {
        this.log("Timed out waiting for " + message);
        this.connection.removeListener(listener);
        reject("Timeout");
      }, timeout);
    });
  }
}