import chalk from "chalk";
import Connection from "./Connection";
import ICommunication from "./interfaces/ICommunication";
import { wait } from "./utils";
import EventListener from "./utils/EventListener";
const debug = require('debug')('lora:Communication');

/**
 * Layer 2: Communication
 * Handle communication with the module and simplify the process of sending and receiving data.
 */
export default class Communication implements ICommunication {
  // Connection used as the lower layer
  private connection: Connection;

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

    await this.connection.send("AT+CFG=434920000,5,6,12,4,1,0,0,0,0,3000,8,8");
    await this.waitForMessage("OK");
    await wait(this.connection.PAUSE_LENGTH);
    
    await this.connection.send("AT+RX");
    await this.waitForMessage("OK");
    await wait(this.connection.PAUSE_LENGTH);

    this.connection.onData((data: string) => {
      const [command] = data.split(",");
      if (command === "LR") {
        const [, sender, length, ...message] = data.split(",");
        const messageString = message.join(",");

        this.log("Received message from " + sender + ": " + messageString);

        if (messageString.length !== parseInt(length)) {
          this.log(`Warn: Received message does not have promised length (promised ${length}, actual: ${messageString.length})`);
        }

        this.messageListeners.fire({ sender: parseInt(sender), data: messageString });
      }
    });
  }

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
  async sendMessage(message: string, allowSplitting = true): Promise<void> {
    const length = message.length;

    if (length > this.connection.MAX_MESSAGE_LENGTH) {
      if (allowSplitting) {
        this.log("Message is over max message length - splitting up");
        for(let i = 0; i < length; i += this.connection.MAX_MESSAGE_LENGTH) {
          await this.sendMessage(message.substr(i, this.connection.MAX_MESSAGE_LENGTH));
        }
      } else {
        this.log("Message is over max message length but splitting is not allowed");
      }
      return;
    }

    this.log("Sending message with length", length);

    const sendedListener = this.waitForMessage("SENDED", this.connection.PAUSE_LENGTH * length * 4);
    this.log('sendMessage: Presend');
    await this.connection.send("AT+SEND=" + length);
    this.log('sendMessage: Wait for OK');
    const gotOk = await this.waitForMessage("OK");
    this.log('sendMessage: Got ok, sending message after pause', gotOk);
    this.sendMessageListeners.fire({ data: message });
    await wait(this.connection.PAUSE_LENGTH);

    await this.connection.send(message);
    this.log('sendMessage: Message sent, waiting for SENDED');
    
    await sendedListener;
    this.log('sendMessage: Sended done');
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
    return new Promise((resolve) => {
      let timeoutItem = setTimeout(() => {
        this.log("Timed out waiting for " + message);
        this.connection.removeListener(listener);
        resolve("Timeout");
      }, timeout);

      const listener = (data: string) => {
        this.log('Received message:', data, 'Seaching for:', message, 'Result:', data.indexOf(message as string) > -1, message === null);
        if (message === null || data.indexOf(message as string) > -1) {
          this.connection.removeListener(listener);
          clearTimeout(timeoutItem);
          resolve(data);
        }
      };

      this.log('Attaching Listener to wait for', message);
      this.connection.onData(listener);
    });
  }

  /**
   * Retuns the connection used by this layer
   * 
   * @returns Connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  onMessage(listener: (data: { sender: number, data: string }) => void) {
    this.messageListeners.add(listener);
  }
  removeMessageListener(listener: (data: { sender: number, data: string }) => void) {
    this.messageListeners.remove(listener);
  }
  sendMessageEvent() {
    return this.sendMessageListeners;
  }
}