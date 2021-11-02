import SerialPort from 'serialport';
import chalk from 'chalk';

export default class Connection {
  // State
  portName: string;
  port?: SerialPort;
  isOpen: boolean = false;

  // Internal
  private connectionListeners: ((data: string) => any)[] = [];
  private inputBuffer = '';

  // Constants
  NEWLINE = "\r\n";

  private log(...args: any[]) {
    console.log(chalk.blue("Connection:"), ...args);
  }

  constructor(portName: string) {
    this.portName = portName;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.port = new SerialPort(this.portName, (err) => {
        this.isOpen = true;
        if (err) {
          this.log(`Error opening port: ${err}`);
          reject(err);
        } else {
          this.log(`Port ${this.portName} opened`);
          resolve();
        }
      });
      this.setupPort();
    });
  }

  private setupPort() {
    if (!this.port) {
      throw new Error("Port is not created");
    }

    this.log("Setting up port");

    this.port.on('error', (err) => {
      this.log('Error: ', err.message)
    })
    this.port.on('data', (data) => {
      this.inputBuffer += data.toString();
      this.log("Received data:", JSON.stringify(data.toString()));
      this.log("Complete data:", JSON.stringify(this.inputBuffer), JSON.stringify(this.inputBuffer.indexOf("\r\n")));
      
      if (this.inputBuffer.indexOf(this.NEWLINE) >= 0) {
        const parts = this.inputBuffer.split(this.NEWLINE);
        this.inputBuffer = parts.pop() || "";

        for(let i = 0; i < parts.length; i++) {
          this.log("Received message:", JSON.stringify(parts[i]));
          this.connectionListeners.forEach((listener) => listener(parts[i]));
        }
      }
    })

    process.once('uncaughtException', async () => {
      this.log("Uncaught Exception - closing port");
      this.close();
    
      process.exit(0)
    })
    process.on('exit', () => {
      this.log("Script is exiting, closing port");
      this.close();
    });
  }

  send(data: string): Promise<void> {
    if (!this.port || !this.isOpen) {
      throw new Error("Port is not open");
    }

    this.log("Sending:", data);
    return new Promise((resolve, reject) => {
      this.port?.write(data + this.NEWLINE, (err) => {
        if (err) {
          this.log(`Error sending data: ${err}`);
          reject(err);
        } else {
          this.log(`Data sent: ${data}`);
          resolve();
        }
      });
    });
  }

  close() {
    if (!this.port || !this.isOpen) {
      this.log("Tried to close port that is already closed");
      return;
    }

    this.log("Closing port");
    this.port.close((err) => {
      if (err) {
        this.log(`Error closing port: ${err}`);
      } else {
        this.log("Port closed");
      }
    });
    this.isOpen = false;
  }

  onData(callback: (data: string) => any) {
    this.connectionListeners.push(callback);
  }

  removeListener(callback: (data: string) => any) {
    this.connectionListeners = this.connectionListeners.filter((listener) => listener !== callback);
  }

}