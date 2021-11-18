import ACK from "../ACK";
import MSG from "../MSG";
import RERR from "../RERR";
import RREP from "../RREP";
import RREQ from "../RREQ";
import NetworkPackage, { NetworkPackageType } from "./NetworkPackage";
import { bufferToBinaryArray } from "../../utils";

/**
 * Get class constructor for package type
 * 
 * @param packageString Package string
 * @returns Constructor
 * @throws Error if package is invalid
 */
export function getClassForPackage(packageString: string): (new () => NetworkPackage) {
  const inputBuffer = bufferToBinaryArray(Buffer.from(packageString, "base64"));
  const binary = inputBuffer.slice(0, 5).join("");
  const type = parseInt(binary, 2);
  switch (type) {
    case NetworkPackageType.RREQ:
      return RREQ;
    case NetworkPackageType.RREP:
      return RREP;
    case NetworkPackageType.RERR:
      return RERR;
    case NetworkPackageType.MSG:
      return MSG;
    case NetworkPackageType.ACK:
      return ACK;
    default:
      throw new Error("Invalid package type");
  }
}

/**
 * Use package string to create new instance of package and set its properties
 * 
 * @param packageString Package string to parse
 * @returns Package
 * @throws Error if package is invalid
 */
export default function stringToPackage(packageString: string): NetworkPackage {
  const constructor = getClassForPackage(packageString);
  const packageObject = new constructor();
  packageObject.fromPackage(packageString);
  return packageObject;
}