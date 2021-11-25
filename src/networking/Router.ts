import chalk from "chalk";
import { resolve } from "path/posix";
import Network from "../Network";
import RERR from "../networkPackages/RERR";
import RREP from "../networkPackages/RREP";
import RREQ from "../networkPackages/RREQ";
import NetworkPackage, { NetworkAddress, NetworkPackageType } from "../networkPackages/utils/NetworkPackage";
import { isSeqNumNewer, isSeqNumNewerOrEqual } from "../networkPackages/utils/SequenceNumbers";
import EventListener from "../utils/EventListener";

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
  private newRouteEvent = new EventListener<RoutingTableEntry>();

  private currentRreqId = 0;

  static ROUTE_WAIT_TIME = 60000;

  /**
   * Internal: Log an info message to the console
   * 
   * @param args 
   */
   private log(...args: any[]) {
    console.log(chalk.magenta("Router:"), ...args);
  }

  constructor(private network: Network) {
    network.onMessage(this.handlePackage.bind(this));
    this.routingTable.push({
      destination: network.ownAddress,
      nextHop: network.ownAddress,
      precursors: [],
      metric: 0,
      sequenceNumber: 0,
      isValid: true
    });
  }

  private async sendRREQ(destination: NetworkAddress) {
    const request = new RREQ();

    request.nextHop = Network.BROADCAST_ADDRESS;
    request.source = this.network.ownAddress;
    request.rreqId = this.currentRreqId++;

    request.destination = destination;
    const lastKnownDestinationSeqNum = this.routingTable.reduce<number>((lastKnown, entry) => {
      if (entry.destination === destination) {
        return entry.sequenceNumber;
      }
      return lastKnown;
    }, 0);
    request.destinationSequenceNumber = lastKnownDestinationSeqNum;
    
    request.hopCount = 0;

    request.originatorAddress = this.network.ownAddress;
    request.originatorSequence = this.network.sequenceNumber;
    this.network.increaseSequenceNumber();

    this.log("Sending RREQ for", destination, "with sequence number", request.sequenceNumber);

    this.network.sendPackage(request);
  }

  private async sendRREP(entry: RoutingTableEntry, pack: RREQ) {
    const rrep = new RREP();

    rrep.nextHop = pack.source;
    rrep.source = this.network.ownAddress;
    rrep.rreqId = pack.rreqId;
    
    rrep.destination = pack.originatorAddress;
    rrep.destinationSequenceNumber = pack.originatorSequence;
    rrep.hopCount = entry.metric;

    rrep.originatorAddress = pack.destination;
    rrep.ttl = pack.hopCount + 1;

    this.log("Sending RREP for", pack.destination, "with sequence number", rrep.destinationSequenceNumber);

    this.network.sendPackage(rrep);
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
  
      this.sendRREQ(destination);

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

  /// HANDLERS FOR INCOMMING MESSAGES ///

  private handlePackage(pack: NetworkPackage) {
    if (pack.type === NetworkPackageType.RREQ) {
      this.handleRREQ(pack as RREQ);
    } else if (pack.type === NetworkPackageType.RREP) {
      this.handleRREP(pack as RREP);
    } else if (pack.type === NetworkPackageType.RERR) {
      this.handleRERR(pack as RERR);
    }
  }
  
  private handleRREQ(pack: RREQ) {
    this.log("Received RREQ from", pack.source, "for", pack.destination);
    pack.hopCount++;
    pack.ttl--;

    // Check if we have an existing route to the destination
    const entry = this.routingTable.find(entry => {
      return (
        entry.destination === pack.destination &&
        entry.isValid &&
        isSeqNumNewerOrEqual(entry.sequenceNumber, pack.destinationSequenceNumber)
      );
    });
    if (entry) {
      this.sendRREP(entry, pack);
      return;
    }

    // Create reverse route entry
    const reverseEntry: ReverseRoutingTableEntry = {
      destination: pack.destination,
      source: pack.source,
      precusor: pack.source,
      rreqId: pack.rreqId,
      metric: pack.hopCount
    };
    this.reverseRoutingTable.push(reverseEntry);

    // Broadcast RREP further
    if (pack.ttl > 0) {
      pack.source = this.network.ownAddress;

      this.network.sendPackage(pack);
    }
  }

  private handleRREP(pack: RREP) {
    this.log("Received RREP from", pack.source, "for", pack.destination);
    pack.hopCount++;
    pack.ttl--;

    // Get reverse table entry
    const reverseEntry = this.reverseRoutingTable.reduce<ReverseRoutingTableEntry | null>((last, entry) => {
      if (
        entry.destination === pack.destination &&
        entry.rreqId === pack.rreqId &&
        (
          !last ||
          entry.metric < last.metric
        )
      ) {
        return entry;
      }
      return last;
    }, null);

    // Check if we should use this route for ourself
    const tableEntry = this.routingTable.reduce<RoutingTableEntry | null>((entry, current) => {
      if (
        current.destination === pack.destination && (
        isSeqNumNewer(current.sequenceNumber, pack.sequenceNumber) ||
        (
          current.sequenceNumber === pack.sequenceNumber &&
          current.metric > pack.hopCount
        )
      )) {
        return current;
      }
      return entry;
    }, null);
    if (
      (
        tableEntry &&
        (
          // Must be Newer
          isSeqNumNewer(pack.sequenceNumber, tableEntry.sequenceNumber) ||
          (
            // Or same age with lower metric
            tableEntry.sequenceNumber === pack.sequenceNumber &&
            tableEntry.metric > pack.hopCount
          )
        )
      ) || !tableEntry
    ) {
      if (tableEntry) {
        // Invalidate old route so we don't use it anymore
        tableEntry.isValid = false;
      }

      const newEntry: RoutingTableEntry = {
        destination: pack.destination,
        nextHop: pack.source,
        precursors: reverseEntry ? [reverseEntry.precusor] : [],
        metric: pack.hopCount,
        sequenceNumber: pack.sequenceNumber,
        isValid: true
      };
      this.routingTable.push(newEntry);
      this.newRouteEvent.fire(newEntry);
    }

    // Check if we have an existing reverse route so we need to send RREP further
    if (reverseEntry) {
      pack.nextHop = reverseEntry.precusor;
      this.network.sendPackage(pack);
    }
  }

  private handleRERR(pack: RERR) {
    this.log("Received RERR from", pack.source, "for", pack.destinations.reduce((str, addr) => str + " " + addr, ""));
    
    let errMessages: { [nextHop: NetworkAddress]: {
      destination: NetworkAddress,
      sequenceNumber: number
    }[]} = {};
    
    this.routingTable.forEach(entry => {
      const routeEntry = pack.destinations.find(destination => destination.destination === entry.destination);
      
      if (
        // Check if this route is invalidated by the RERR
        routeEntry &&
        entry.nextHop === pack.source &&
        entry.isValid
      ) {
        entry.isValid = false;

        entry.precursors.forEach(precursor => {

          if (!errMessages[precursor]) {
            errMessages[precursor] = [];
          }

          errMessages[precursor].push({
            destination: entry.destination,
            sequenceNumber: entry.sequenceNumber
          });
        });
      }
    });

    this.log("Relaying RERR to", Object.keys(errMessages).length, "nodes");

    for (const nextHop in errMessages) {
      const rerr = new RERR();

      rerr.nextHop = Number(nextHop);
      rerr.source = this.network.ownAddress;
      rerr.destinations = errMessages[nextHop];

      this.network.sendPackage(rerr);
    }
  }
}