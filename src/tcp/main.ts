/**
 * TCP Network
 */
import chalk from "chalk";
import inquirer from "inquirer";
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import Net from "net";
import Console from "../Console";
import Network from "../Network";
import CommunicationMock from "../virtual/CommunicationMock";
const debug = require('debug')('lora:TcpNetwork');

const argv = yargs(hideBin(process.argv)).options({
  host: { type: 'string' },
  port: { type: 'number' },
  addr: { type: 'number' },
}).parseSync();

(async () => {
  debug('Starting TCP Network');
  const net = new Net.Socket();

  // Set up Mock
  const communication = new CommunicationMock();
  // Sending data
  communication.sendMessage = async (message: string) => {
    debug(`Sending message: ${message}`);
    net.write("P\r\n");
  
    // Pretend sending takes some time
    let totalTimeout = 1000 + message.length * 200;
    await new Promise(r => setTimeout(r, totalTimeout));
    
    debug(`Message sent done: ${message}`);
    net.write(`M${message}\r\n`);
  }
  // Receiving data
  net.on('data', function(data) {
      debug('Got data:', data);
      const message = data.toString();
      const messageType = message[0];

      if (messageType === 'M') {
        const [, sender,, ...msg] = message.split(",");
        const messageString = msg.join(",");
        communication.receiveMessage(parseInt(sender), messageString);
      } else if (messageType === 'E') {
        console.log(chalk.red(`Fehler bei der Adressvergabe`));
      }

  });
  net.on('close', function() {
    console.log(chalk.red(`Verbindung zum Server wurde getrennt`));
  });
  
  // Set up Network instance
  const host = argv.host || await inquirer.prompt([
    {
      type: 'input',
      name: 'host',
      message: 'What host should the TCP Client connect to (e.g. 127.0.0.1)?'
    }
  ]);
  const port = argv.port || await inquirer.prompt([
    {
      type: 'input',
      name: 'port',
      message: 'What port should the TCP Client connect to (e.g. 3000)?'
    }
  ]);
  const ownAdress = argv.addr || await inquirer.prompt([
    {
      type: 'input',
      name: 'ownAdress',
      message: 'What the address of this module (1-255)?'
    }
  ]);

  net.connect(port, host, async () => {

    net.write(`A${ownAdress}\r\n`);

    debug("Setting up network...");
    const network = new Network(communication, ownAdress);
    await network.setup();
    debug('Network setup');
    
    debug("Instances created");

    // Open console
    const consoleInstance = new Console(communication, network);
    consoleInstance.run().then(() => {
      console.log(chalk.green('Terminal closed'));
      net.end();
      process.exit();
    });

  });
})();

