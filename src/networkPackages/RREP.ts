import { NetworkPackageType } from "./utils/NetworkPackage";
import RoutePackage from "./utils/RoutePackage";

export default class RREP extends RoutePackage {
  type: NetworkPackageType = NetworkPackageType.RREP;
}