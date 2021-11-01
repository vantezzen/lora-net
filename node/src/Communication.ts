import chalk from "chalk";
import Connection from "./Connection";
import { wait } from "./utils";

export default class Communication {
  private connection: Connection;

  private log(...args: any[]) {
    console.log(chalk.green("Communication:"), ...args);
  }

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async setup(): Promise<void> {
    this.log("Setting up");
    await this.connection.send("AT+CFG=433000000,5,6,12,4,1,0,0,0,0,3000,8,8");
    await this.waitForMessage("OK");
    await wait(100);
  }

  async sendMessage(message: string): Promise<void> {
    const length = message.length;

    await this.connection.send("AT+SEND=" + length);
    await wait(100);
    await this.connection.send(message);
    await this.waitForMessage("SENDED");
    await wait(100);
  }

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