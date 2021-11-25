import { NetworkPackageType } from "./utils/NetworkPackage";
import RoutePackage from "./utils/RoutePackage";

export default class RREQ extends RoutePackage {
  type: NetworkPackageType = NetworkPackageType.RREQ;
  nextHop = 255;

  originatorSequence: number = 0;

  constructor() {
    super();
    this.data.push(
      {
        name: "originatorSequence",
        type: "int",
        length: 8,
      },
    );
  }
}