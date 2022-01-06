import chalk from "chalk";
import Connection from "../Connection";
import ICommunication from "../interfaces/ICommunication";
import { wait } from "../utils";
import EventListener from "../utils/EventListener";
const debug = require('debug')('lora:CommunicationMock');

/**
 * Layer 2: Communication Mock
 */
export default class CommunicationMock implements ICommunication {
  isMock = true;
  
  private messageListeners = new EventListener<{ sender: number, data: string }>();
  private sendMessageListeners = new EventListener<{ data: string }>();

  /**
   * Internal: Log a message to the console
   * 
   * @param args 
   */
  private log(...args: any[]) {
    debug(...args);
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

  public async waitForMessage(message?: string | null): Promise<string> {
    return message ?? "Yes";
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

  
  sendMessageEvent() {
    return this.sendMessageListeners;
  }

}