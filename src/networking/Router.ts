import chalk from "chalk";
import Network from "../Network";
import ACK from "../networkPackages/ACK";
import MSG from "../networkPackages/MSG";
import RERR from "../networkPackages/RERR";
import RREP from "../networkPackages/RREP";
import RREQ from "../networkPackages/RREQ";
import NetworkPackage, { NetworkAddress, NetworkPackageType } from "../networkPackages/utils/NetworkPackage";
import { wait } from "../utils";
import EventListener from "../utils/EventListener";
import { handleACK } from "./handle/ACK";
import { handleMSG } from "./handle/MSG";
import { handleRERR } from "./handle/RERR";
import { handleRREP } from "./handle/RREP";
import { handleRREQ } from "./handle/RREQ";
import { sendRREQ } from "./send/RREQ";
const debug = require('debug');

export type RoutingTableEntry = {
  destination: NetworkAddress;
  nextHop: NetworkAddress;
  precursors: NetworkAddress[];
  metric: number;
  sequenceNumber: number;
  isValid: boolean;
};
export type ReverseRoutingTableEntry = {
  destination: NetworkAddress;
  source: NetworkAddress;
  rreqId: number;
  precusor: NetworkAddress;
  metric: number;
}

export default class Router {
  routingTable: RoutingTableEntry[] = [];
  reverseRoutingTable: ReverseRoutingTableEntry[] = [];
  newRouteEvent = new EventListener<RoutingTableEntry>();
  ackEvent = new EventListener<ACK>();

  currentRreqId = 0;
  network: Network;

  static ROUTE_WAIT_TIME = 60000;

  /**
   * Internal: Log an info message to the console
   * 
   * @param args 
   */
  log(...args: any[]) {
    debug('lora:Router:' + this.network.ownAddress)(...args);
  }

  constructor(network: Network) {
    this.network = network;

    this.log('Setting up routing');

    this.network.onPackage(this.handlePackage.bind(this));
    this.routingTable.push({
      destination: this.network.ownAddress,
      nextHop: this.network.ownAddress,
      precursors: [],
      metric: 0,
      sequenceNumber: 0,
      isValid: true
    });
  }

  /**
   * Returns the route table entry for a given destination.
   * 
   * @param destination Destination to reach
   * @returns Table entry for the destination or null if no route can be found
   */
  public getRouteFor(destination: NetworkAddress): Promise<RoutingTableEntry | null> {
    return new Promise(async (resolve) => {
      const existingEntry = this.routingTable.find(entry => entry.destination === destination);
      if (existingEntry) {
        resolve(existingEntry);
        return;
      }
  
      const rreq = await sendRREQ(destination, this);
      let hasResolved = false;

      // Try again after a timeout
      const retryInterval = setInterval(() => {
        if (!hasResolved) {
          this.network.sendPackage(rreq);
        }
      }, Router.ROUTE_WAIT_TIME / 3);

      // Handle incoming RREP
      const onNewRoute = (entry: RoutingTableEntry) => {
        if (entry.destination === destination) {
          this.newRouteEvent.remove(onNewRoute);
          hasResolved = true;
          clearInterval(retryInterval);
          resolve(entry);
        }
      };
      this.newRouteEvent.add(onNewRoute);
  
      // Timeout automatically
      setTimeout(() => {
        if (!hasResolved) {
          this.newRouteEvent.remove(onNewRoute);
          this.log("No route to", destination, "found");
          clearInterval(retryInterval);
          resolve(null);
        }
      }, Router.ROUTE_WAIT_TIME);
      
    })
  }

  /**
   * Send a package to the network using a route from the routing table
   * 
   * @param pack Package to send
   * @param route Route to use for sending
   */
  public sendUsingRoute(pack: NetworkPackage, route: RoutingTableEntry) {
    this.log("Sending", pack.type.toString(), "using route", route);
    pack.nextHop = route.nextHop;
    this.network.sendPackage(pack);
  }

  /**
   * Handle new incoming package and route it to the correct handler
   * 
   * @param pack Package to handle
   */
  private handlePackage(pack: NetworkPackage) {
    if (pack.type === NetworkPackageType.RREQ) {
      handleRREQ(pack as RREQ, this);
    } else if (pack.type === NetworkPackageType.RREP) {
      handleRREP(pack as RREP, this);
    } else if (pack.type === NetworkPackageType.RERR) {
      handleRERR(pack as RERR, this);
    } else if (pack.type === NetworkPackageType.MSG) {
      handleMSG(pack as MSG, this);
    } else if (pack.type === NetworkPackageType.ACK) {
      handleACK(pack as ACK, this);
    }
  }

  /**
   * Wait for an acknowledgement packet from a specific source
   * 
   * @param sender Sender to look for
   * @param timeout Timeout in milliseconds
   * @returns Resolves with "true" if a packet was received, "false" if the timeout was reached
   */
  waitForAck(sender: NetworkAddress, timeout = 5000): Promise<boolean> {
    return new Promise((resolve) => {
      const onAck = (ack: ACK) => {
        if (ack.source === sender) {
          this.ackEvent.remove(onAck);
          resolve(true);
        }
      };
      this.ackEvent.add(onAck);
      setTimeout(() => {
        this.ackEvent.remove(onAck);
        resolve(false);
      }, timeout);
    });
  }

  /**
   * Send a package with acknowledgement required
   * 
   * @param pack Package to send
   * @param retries Amount of retries to send the package
   * @returns True if the package was acknowledged, false if the retries were exceeded
   */
  public async sendWithAck(pack: NetworkPackage, retries = 3): Promise<boolean> {
    let hasAcknowledged = false;
    while(!hasAcknowledged && retries > 0) {
      await this.network.sendPackage(pack);
      hasAcknowledged = await this.waitForAck(pack.nextHop);
      retries--;

      if (!hasAcknowledged) {
        this.log("Retrying sending", pack.type.toString(), "to", pack.nextHop);
      }
    }

    if (!hasAcknowledged) {
      this.log("Failed to send", pack.type.toString(), "to", pack.nextHop, ": Retries for ACK exceeded");
      return false;
    }
    return true;
  }
}