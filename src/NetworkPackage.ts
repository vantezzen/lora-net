export default class NetworkPackage {

  sender?: string;
  receiver?: string;
  data?: string;

  constructor(sender?: string, receiver?: string, data?: string) {
    this.sender = sender;
    this.receiver = receiver;
    this.data = data;
  }

  static fromString(str: string): NetworkPackage {
    const [sender, receiver, dataLength, ...data] = str.split('/');
    return new NetworkPackage(sender, receiver, data.join('/'));
  }

  toString(): string {
    return `${this.sender}/${this.receiver}/${this.data?.length || 0}/${this.data}`;
  }
}