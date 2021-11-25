import chalk from "chalk";
import Communication from "./Communication";
import Router from "./networking/Router";
import MSG from "./networkPackages/MSG";
import NetworkPackage, { NetworkAddress } from "./networkPackages/utils/NetworkPackage";
import { withBitOverflow } from "./networkPackages/utils/SequenceNumbers";
import stringToPackage from "./networkPackages/utils/utils";
import EventListener from "./utils/EventListener";

/**
 * Layer 3: Network
 * Handle automatically connecting to other modules in proximity
 * to build the adhoc, multihop network
 */
export default class Network {
  private communication: Communication;
  private messageListeners = new EventListener<NetworkPackage>();
  private router = new Router(this);

  static BROADCAST_ADDRESS = 255;

  ownAddress: NetworkAddress;
  sequenceNumber = 0;

  constructor(communication: Communication, ownAddress: NetworkAddress) {
    this.communication = communication;
    this.ownAddress = ownAddress;
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
    this.communication.onMessage(({ data }) => {
      try {
        const pack = stringToPackage(data);
        if (pack.nextHop === this.ownAddress || pack.nextHop === Network.BROADCAST_ADDRESS) {
          this.log("Received package", pack.type.toString(), pack);
          this.messageListeners.fire(pack);
        } else {
          this.log("Received package for someone else - ignoring", pack.type.toString(), pack);
        }
      } catch (e) {
        this.log("Could not parse message:", data);
      }
    })
  }

  /**
   * Send a package to the network
   * 
   * @param pack Package to send
   */
  public async sendPackage(pack: NetworkPackage) {
    this.log("Sending package", pack);
    await this.communication.sendMessage(pack.toPackage());
  }

  /**
   * Add a new listener to call when a package is received
   * 
   * @param listener Listener to add
   */
  public onMessage(listener: (pack: NetworkPackage) => void) {
    this.messageListeners.add(listener);
  }
  /**
   * Remove a listener
   * 
   * @param listener Listener to remove
   */
  public removeMessageListener(listener: (pack: NetworkPackage) => void) {
    this.messageListeners.remove(listener);
  }

  public async sendMessage(message: string, receiver: NetworkAddress) {
    this.log("Sending message to", receiver, message);
   
    const route = await this.router.getRouteFor(receiver);
    if (!route) {
      this.log("No route to", receiver);
      return;
    }

    const msg = new MSG();
    msg.sequenceNumber = this.sequenceNumber;
    msg.source = this.ownAddress;
    msg.destination = receiver;
    msg.nextHop = route.nextHop;
    msg.hopCount = 0;
    msg.payload = message;
    this.increaseSequenceNumber();
    this.sendPackage(msg);
  }

  /**
   * Increase own sequence number
   */
  public increaseSequenceNumber() {
    this.sequenceNumber = withBitOverflow(this.sequenceNumber + 1);
  }
}