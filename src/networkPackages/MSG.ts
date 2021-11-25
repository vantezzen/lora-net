import { NetworkPackageType } from "./utils/NetworkPackage";
import SecondHeaderRow from "./utils/SecondHeaderRow";

export default class MSG extends SecondHeaderRow {
  type: NetworkPackageType = NetworkPackageType.MSG;

  payload: string = "";

  toPackage(): string {
    // toPackage method needs to be wrapped because the payload should be
    // added raw to the package instead of base64 encoded

    const pack = super.toPackage();
    return pack + this.payload;
  }

  fromPackage(packageString: string): void {
    super.fromPackage(packageString);

    // Header has a fixed length of 8 chars, everything else is the payload
    this.payload = packageString.substr(8);
  }
}