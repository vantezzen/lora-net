import ACK from "../ACK";
import MSG from "../MSG";
import RERR from "../RERR";
import RREP from "../RREP";
import RREQ from "../RREQ";
import NetworkPackage, { NetworkPackageType } from "./NetworkPackage";
import { bufferToBinaryArray } from "../../utils";
const debug = require('debug')('lora:urils');

/**
 * Get specific value from a raw package string.
 * This can be used to "peek" specific values without having to parse the whole package.
 * 
 * @param packageString Package string to get the value from.
 * @param start Start bit position
 * @param end End bit position
 * @returns Value as number
 */
export function getPackageValueFromRawString(packageString: string, start: number, end: number): number {
  const inputBuffer = bufferToBinaryArray(Buffer.from(packageString, "base64"));
  const binary = inputBuffer.slice(start, end).join("");
  return parseInt(binary, 2);
}

/**
 * Get class constructor for package type
 * 
 * @param packageString Package string
 * @returns Constructor
 * @throws Error if package is invalid
 */
export function getClassForPackage(packageString: string): (new () => NetworkPackage) {
  const type = getPackageValueFromRawString(packageString, 0, 4);
  debug("Parse type is", type);
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