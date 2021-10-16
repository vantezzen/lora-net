import IModuleConnection, { ConnectionInfo } from "./IModuleConnection";
import TerminalEntryStore from "./TerminalEntryStore";

export default class MockConnection implements IModuleConnection {
  private isConnected = false;
  private connectionStart = new Date();
  private terminal: TerminalEntryStore;

  constructor(terminal: TerminalEntryStore) {
    this.terminal = terminal;
    this.log('Mock Interface wurde erstellt');
  }
  private log(message: string): void {
    this.terminal.add({
      isSender: false,
      message: `| Mock: ${message}`,
    });
  }
  
  getConnectionType(): string {
    return "Mock";
  }

  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      this.log('Verbinde in 1,5s');
      setTimeout(() => {
        this.log('Verbindung hergestellt');
        this.isConnected = true;
        this.connectionStart = new Date();
    
        resolve(true);
      }, 1500);
    })
  }
  
  disconnect(): Promise<boolean> {
    return new Promise((resolve) => {
      this.log('Trenne Verbindung in 1,5s');
      setTimeout(() => {
        this.log('Verbindung getrennt');
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
    this.log('INFO: Data Callback nicht unterstützt');
    // TODO
  }
  
}