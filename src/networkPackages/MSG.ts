import { NetworkPackageType } from "./utils/NetworkPackage";
import SecondHeaderRow from "./utils/SecondHeaderRow";

export default class MSG extends SecondHeaderRow {
  type: NetworkPackageType = NetworkPackageType.MSG;

  payload: string = "";


  constructor() {
    super();
    this.data.push({
      name: "payload",
      type: "string",
      length: 80,
    });
  }
}