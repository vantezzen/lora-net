import SecondHeaderRow from "./SecondHeaderRow";

/**
 * Router Package as used by RREQ and RREP packages
 */
export default class RoutePackage extends SecondHeaderRow {
  destinationSequenceNumber: number = 0;
  rreqId: number = 0;
  ttl: number = 10;

  constructor() {
    super();
    this.data.push({
      name: "destinationSequenceNumber",
      type: "int",
      length: 8,
    }, {
      name: "rreqId",
      type: "int",
      length: 8,
    }, {
      name: "ttl",
      type: "int",
      length: 8,
    });
  }
}