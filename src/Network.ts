import chalk from "chalk";
import Communication from "./Communication";
import NetworkPackage from "./networkPackages/utils/NetworkPackage";
import stringToPackage from "./networkPackages/utils/utils";

/**
 * Layer 3: Network
 * Handle automatically connecting to other modules in proximity
 * to build the adhoc, multihop network
 */
export default class Network {
  private communication: Communication;
  private messageListeners: ((pack: NetworkPackage) => void)[] = [];

  constructor(communication: Communication) {
    this.communication = communication;
  }

  /**
   * Internal: Log an info message to the console
   * 
   * @param args 
   */
  private log(...args: any[]) {
    console.log(chalk.yellow("Network:"), ...args);
  }

  /**
   * Let the network setup
   */
  public async setup(): Promise<void> {
    this.communication.onMessage((sender, data) => {
      try {
        const pack = stringToPackage(data);
        this.log("Received package", pack.type.toString(), pack);
        this.messageListeners.forEach(l => l(pack));
      } catch (e) {
        this.log("Could not parse message:", data);
      }
    })
  }

  /**
   * Add a new listener to call when a package is received
   * 
   * @param listener Listener to add
   */
  public onMessage(listener: (pack: NetworkPackage) => void) {
    this.messageListeners.push(listener);
  }
  /**
   * Remove a listener
   * 
   * @param listener Listener to remove
   */
  public removeMessageListener(listener: (pack: NetworkPackage) => void) {
    this.messageListeners = this.messageListeners.filter(l => l !== listener);
  }
}