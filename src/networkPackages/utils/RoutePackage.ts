import NetworkPackage, { NetworkAddress } from "./NetworkPackage";
import SecondHeaderRow from "./SecondHeaderRow";

/**
 * Router Package as used by RREQ and RREP packages
 */
export default class RoutePackage extends NetworkPackage {
  destinationSequenceNumber: number = 0;
  rreqId: number = 0;
  ttl: number = 10;  
  destination: NetworkAddress = 0;
  hopCount: number = 0;
  sequenceNumber: number = 0;
  originatorAddress: NetworkAddress = 0;

  constructor() {
    super();
    this.data.push(
      {
        name: "rreqId",
        type: "int",
        length: 8,
      },
      {
        name: "destination",
        type: "int",
        length: 8,
      },
      {
        name: "destinationSequenceNumber",
        type: "int",
        length: 8,
      }, 
      {
        name: "hopCount",
        type: "int",
        length: 8,
      },
      {
        name: "originatorAddress",
        type: "int",
        length: 8,
      }
    );
  }
}