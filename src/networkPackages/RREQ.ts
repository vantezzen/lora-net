import { NetworkPackageType } from "./utils/NetworkPackage";
import RoutePackage from "./utils/RoutePackage";

export default class RREQ extends RoutePackage {
  type: NetworkPackageType = NetworkPackageType.RREQ;

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