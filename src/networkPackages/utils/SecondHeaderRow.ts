import NetworkPackage, { NetworkAddress } from "./NetworkPackage";

/**
 * Second Header Row as used by RREQ, RREP, MSG Packages
 */
export default class SecondHeaderRow extends NetworkPackage {
  destination: NetworkAddress = 0;
  hopCount: number = 0;
  sequenceNumber: number = 0;

  constructor() {
    super();
    this.data.push({
      name: "destination",
      type: "int",
      length: 8,
    }, {
      name: "hopCount",
      type: "int",
      length: 8,
    }, {
      name: "sequenceNumber",
      type: "int",
      length: 8,
    });
  }
}