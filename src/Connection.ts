import SerialPort from 'serialport';
import chalk from 'chalk';

/**
 * Layer 1: Connection
 * Handle managing the serial port connection to the device
 * and other low-level mangement.
 */
export default class Connection {
  // State
  portName: string;
  port?: SerialPort;
  isOpen: boolean = false;

  // Internal
  private connectionListeners: ((data: string) => any)[] = [];
  private inputBuffer = '';

  // Constants
  NEWLINE = "\r\n"; // Character(s) to indicate the end of an instruction
  PAUSE_LENGTH = 500; // Time in ms to wait after sending a command before sending another
  MAX_MESSAGE_LENGTH = 250; // Module only allows messages up to 250 bytes

  /**
   * Internal: Log an info message to the console
   * 
   * @param args 
   */
  private log(...args: any[]) {
    console.log(chalk.blue("Connection:"), ...args);
  }

  constructor(portName: string) {
    this.portName = portName;
  }

  /**
   * Open a connection to the device under the set port name
   * 
   * @returns Promise that resolves when the port is open or rejects
   */
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

  /**
   * Internal: Setup the port to listen for data
   */
  private setupPort() {
    if (!this.port) {
      throw new Error("Port is not created");
    }

    this.log("Setting up port");

    // Log any errors to the console
    this.port.on('error', (err) => {
      this.log('Error: ', err.message)
    })

    // Buffer data coming in and notify listeners about complete lines
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

    // Automatically close port when the program has an uncaught exception
    process.once('uncaughtException', async () => {
      this.log("Uncaught Exception - closing port");
      this.close();
    
      process.exit(0)
    })

    // Automatically close port when the program is killed
    process.on('exit', () => {
      this.log("Script is exiting, closing port");
      this.close();
    });
  }

  /**
   * Send a message to the device
   * This will automatically append a newline character to the end
   * to end the command
   * 
   * @param data Data to send
   * @returns Promoise that resolves when the data is sent or rejects
   */
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

  /**
   * Close the port
   * 
   * @returns void
   */
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

  /**
   * Add a new listener to notify about data from the module
   * 
   * @param callback Callback to inform about data
   */
  onData(callback: (data: string) => any) {
    this.connectionListeners.push(callback);
  }

  /**
   * Remove a listener from the list of listeners
   * 
   * @param callback Callback to remove
   */
  removeListener(callback: (data: string) => any) {
    this.connectionListeners = this.connectionListeners.filter((listener) => listener !== callback);
  }

}