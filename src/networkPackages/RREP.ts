import { NetworkPackageType } from "./utils/NetworkPackage";
import RoutePackage from "./utils/RoutePackage";

export default class RREP extends RoutePackage {
  type: NetworkPackageType = NetworkPackageType.RREP;

  ttl: number = 0;

  constructor() {
    super();
    this.data.push(
      {
        name: "ttl",
        type: "int",
        length: 8,
      },
    );
  }
}