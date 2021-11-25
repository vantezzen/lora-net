import chalk from "chalk";
import Network from "../Network";
import MSG from "../networkPackages/MSG";
import RERR from "../networkPackages/RERR";
import RREP from "../networkPackages/RREP";
import RREQ from "../networkPackages/RREQ";
import NetworkPackage, { NetworkAddress, NetworkPackageType } from "../networkPackages/utils/NetworkPackage";
import EventListener from "../utils/EventListener";
import { handleMSG } from "./handle/MSG";
import { handleRERR } from "./handle/RERR";
import { handleRREP } from "./handle/RREP";
import { handleRREQ } from "./handle/RREQ";
import { sendRREQ } from "./send/RREQ";

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

  currentRreqId = 0;
  network: Network;

  static ROUTE_WAIT_TIME = 60000;

  /**
   * Internal: Log an info message to the console
   * 
   * @param args 
   */
  log(...args: any[]) {
    console.log(chalk.magenta("Router (" + this.network.ownAddress + "):"), ...args);
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
    return new Promise((resolve) => {
      const existingEntry = this.routingTable.find(entry => entry.destination === destination);
      if (existingEntry) {
        resolve(existingEntry);
        return;
      }
  
      sendRREQ(destination, this);

      let hasResolved = false;
      const onNewRoute = (entry: RoutingTableEntry) => {
        if (entry.destination === destination) {
          this.newRouteEvent.remove(onNewRoute);
          hasResolved = true;
          resolve(entry);
        }
      };
      this.newRouteEvent.add(onNewRoute);
  
      // Timeout automatically
      setTimeout(() => {
        if (!hasResolved) {
          this.newRouteEvent.remove(onNewRoute);
          this.log("No route to", destination, "found");
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
    }
  }
}