import { NetworkPackageType } from "./utils/NetworkPackage";
import RoutePackage from "./utils/RoutePackage";

export default class RREQ extends RoutePackage {
  type: NetworkPackageType = NetworkPackageType.RREQ;
}