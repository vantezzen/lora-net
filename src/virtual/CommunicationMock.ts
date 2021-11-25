import chalk from "chalk";
import Connection from "../Connection";
import ICommunication from "../interfaces/ICommunication";
import { wait } from "../utils";
import EventListener from "../utils/EventListener";

/**
 * Layer 2: Communication Mock
 */
export default class CommunicationMock implements ICommunication {
  private messageListeners = new EventListener<{ sender: number, data: string }>();

  /**
   * Internal: Log a message to the console
   * 
   * @param args 
   */
  private log(...args: any[]) {
    console.log(chalk.green("Communication Mock:"), ...args);
  }

  /**
   * Setup the module
   * 
   * @return Promise that resolves when the module is ready
   */
  async setup(): Promise<void> {
    this.log("Setting up");
  }

  // Should be implemented by the mock class
  async sendMessage(message: string, allowSplitting = true): Promise<void> {}

  public waitForMessage(): Promise<string> {
    throw new Error("Method not implemented.");
  }

  onMessage(listener: (data: { sender: number, data: string }) => void) {
    this.messageListeners.add(listener);
  }
  removeMessageListener(listener: (data: { sender: number, data: string }) => void) {
    this.messageListeners.remove(listener);
  }

  /**
   * Mock function used to simulate receiving a message
   * 
   * @param sender Sender that sent the message
   * @param data Data that was sent
   */
  async receiveMessage(sender: number, data: string) {
    this.log("Received message from " + sender + ": " + data, "informing", this.messageListeners.getListenerAmount(), "listeners");
    this.messageListeners.fire({ sender, data });
  }

}