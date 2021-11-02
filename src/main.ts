import inquirer from 'inquirer'
import glob from 'glob'
import chalk from 'chalk'
import Connection from './Connection';
import Communication from './Communication';
import { wait } from './utils';

(async () => {

  const availablePorts = glob.sync('/dev/tty.*');

  const { port } = await inquirer.prompt([{
    type: 'list',
    name: 'port',
    message: "Which port do you want to connect to?",
    choices: availablePorts
  }]);

  console.log('Connecting to ' + chalk.magenta(port));

  const connection = new Connection(port);

  await connection.connect();
  const communication = new Communication(connection);
  await communication.setup();

  connection.onData((data) => {
    console.log(">", chalk.green(data));
  });

  await connection.send("AT");
  await communication.waitForMessage("OK");
  await wait(100);

  await communication.sendMessage("oel");

  console.log(chalk.green("Terminal - type \"exit\" to exit"));

  while(true) {
    const { Terminal: input } = await inquirer.prompt([{ type: 'input', name: 'Terminal' }]);

    if (input === 'exit') {
      console.log(chalk.red("Exit"));
      break;
    }

    await connection.send(input);
    await communication.waitForMessage();
    await wait(100);
  }

  connection.close();
})();