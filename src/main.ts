import inquirer from 'inquirer'
import glob from 'glob'
import chalk from 'chalk'
import Connection from './Connection';
import Communication from './Communication';
import { wait } from './utils';
import Network from './Network';
import Console from './Console';

(async () => {

  // 1. Choose port
  const availablePorts = glob.sync('/dev/tty.*');
  const { port } = await inquirer.prompt([{
    type: 'list',
    name: 'port',
    message: "Which port do you want to connect to?",
    choices: availablePorts
  }]);

  // 2. Open connection (layer 1)
  console.log('Connecting to ' + chalk.magenta(port));
  const connection = new Connection(port);
  await connection.connect();
  console.log(chalk.green('Connected to module'));

  // 3. Setup communication (layer 2)
  console.log('Setting up communication...');
  const communication = new Communication(connection);
  await communication.setup();
  
  connection.onData((data) => {
    console.log(">", chalk.green(data));
  });
  console.log(chalk.green('Communication established'));

  // 4. Send network (layer 3)
  console.log("Setting up network...");
  const network = new Network(communication);
  await network.setup();
  console.log(chalk.green('Network setup'));
  
  // 5. Create terminal-like to enable interaction with the module
  const consoleInstance = new Console(communication);
  consoleInstance.run().then(() => {
    console.log(chalk.green('Terminal closed'));
    connection.close();
    process.exit();
  });

})();