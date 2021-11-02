import Communication from "./Communication";

/**
 * Layer 3: Network
 * Handle automatically connecting to other modules in proximity
 * to build the adhoc, multihop network
 */
export default class Network {
  private communication: Communication;

  constructor(communication: Communication) {
    this.communication = communication;
  }

  /**
   * Let the network setup
   */
  public async setup(): Promise<void> {
    await this.communication.sendMessage("setup done");
  }
}