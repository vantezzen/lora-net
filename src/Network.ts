import chalk from "chalk";
import Communication from "./Communication";
import ICommunication from "./interfaces/ICommunication";
import Router from "./networking/Router";
import Timeout from "./networking/Timeout";
import MSG from "./networkPackages/MSG";
import NetworkPackage, { NetworkAddress } from "./networkPackages/utils/NetworkPackage";
import { withBitOverflow } from "./networkPackages/utils/SequenceNumbers";
import stringToPackage from "./networkPackages/utils/utils";
import EventListener from "./utils/EventListener";
const debug = require('debug')('lora:Network');

/**
 * Layer 3: Network
 * Handle automatically connecting to other modules in proximity
 * to build the adhoc, multihop network
 */
export default class Network {
  private communication: ICommunication;
  private packageListeners = new EventListener<NetworkPackage>();
  private messageListeners = new EventListener<string>();

  router: Router;
  timeout: Timeout;

  static BROADCAST_ADDRESS = 255;

  ownAddress: NetworkAddress;
  sequenceNumber = 0;

  constructor(communication: ICommunication, ownAddress: NetworkAddress) {
    this.communication = communication;
    this.ownAddress = Number(ownAddress);
    
    this.timeout = new Timeout(this);
    this.router = new Router(this);

    this.log("Setting up with address", this.ownAddress);

    this.onMessage((message) => {
      console.log(chalk.bgRed.bold.black('MESSAGE:'), message);
    });
  }

  /**
   * Internal: Log an info message to the console
   * 
   * @param args 
   */
  private log(...args: any[]) {
    debug("(Addr " + this.ownAddress + "):", ...args);
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
          this.packageListeners.fire(pack);
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
  public onPackage(listener: (pack: NetworkPackage) => void) {
    this.packageListeners.add(listener);
  }
  /**
   * Remove a listener
   * 
   * @param listener Listener to remove
   */
  public removePackageListener(listener: (pack: NetworkPackage) => void) {
    this.packageListeners.remove(listener);
  }

  /**
   * Send a message to a receiver using multihop routing
   * 
   * @param message Message to send
   * @param receiver Receiver to send message to
   * @returns Promise that resolves once message has been sent
   */
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
    msg.hopCount = 0;
    msg.payload = message;
    this.increaseSequenceNumber();

    this.router.sendUsingRoute(msg, route);
  }
  /**
   * Add a new listener to call when a message (MSG) is received
   * 
   * @param listener Listener to add
   */
  public onMessage(listener: (text: string) => void) {
    this.messageListeners.add(listener);
  }
  /**
   * Remove a listener
   * 
   * @param listener Listener to remove
   */
  public removeMessageListener(listener: (text: string) => void) {
    this.messageListeners.remove(listener);
  }

  /**
   * Fire all listeners for messages.
   * Should be called by the router
   * 
   * @param text Text that got received
   */
  public fireNewMessageEvent(text: string) {
    this.messageListeners.fire(text);
  }

  /**
   * Increase own sequence number
   */
  public increaseSequenceNumber() {
    this.sequenceNumber = withBitOverflow(this.sequenceNumber + 1);
  }
}