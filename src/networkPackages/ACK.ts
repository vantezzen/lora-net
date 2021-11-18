import NetworkPackage, { NetworkPackageType } from "./utils/NetworkPackage";

export default class ACK extends NetworkPackage {
  type: NetworkPackageType = NetworkPackageType.ACK;
}