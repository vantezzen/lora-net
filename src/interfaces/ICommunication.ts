import chalk from "chalk";
import Connection from "../Connection";
import { wait } from "../utils";
import EventListener from "../utils/EventListener";

/**
 * Layer 2: Communication
 * Handle communication with the module and simplify the process of sending and receiving data.
 */
export default interface ICommunication {
  /**
   * Setup the module
   * 
   * @return Promise that resolves when the module is ready
   */
  setup(): Promise<void>;

  /**
   * Send a message to the network over the module
   * 
   * This method will automatically add the required "AT+SEND" instruction
   * and wait for the actions to complete.
   * 
   * @param message Message to send to the network
   * @param allowSplitting Whether to allow splitting the message into multiple packets if it is too long
   * @return Promise that resolves when the message has been sent
   */
  sendMessage(message: string, allowSplitting?: boolean): Promise<void>;

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
  waitForMessage(message?: String | null, timeout?: number): Promise<string>;

  onMessage(listener: (data: { sender: number, data: string }) => void): void;
  removeMessageListener(listener: (data: { sender: number, data: string }) => void): void;
}