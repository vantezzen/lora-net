import IModuleConnection, { ConnectionInfo } from "./IModuleConnection";

export default class MockConnection implements IModuleConnection {
  private isConnected = false;
  private connectionStart = new Date();
  
  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        this.connectionStart = new Date();
    
        resolve(true);
      }, 1500);
    })
  }
  
  disconnect(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = false;
        this.connectionStart = new Date();
    
        resolve(true);
      }, 1500);
    })
  }

  getConnectionInfo(): false | ConnectionInfo {
    if (!this.isConnected) return false;
    return {
      name: 'Mock Device',
      icon: 'Code',
      connectionStart: this.connectionStart
    }
  }
  
  getIsConnected(): boolean {
    return this.isConnected;
  }

  send(data: string): Promise<string | false> {
    return Promise.resolve("AT+OK");
  }

  onData(callback: (data: string) => any): void {
    // TODO
  }
  
}