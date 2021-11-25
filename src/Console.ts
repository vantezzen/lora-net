import chalk from "chalk";
import inquirer from "inquirer";
import Communication from "./Communication";
import Network from "./Network";
import { NetworkAddress } from "./networkPackages/utils/NetworkPackage";
import { wait } from "./utils";
import { getReverseRoutingTable, getRoutingTableString } from "./utils/Logging";

export type CommandFunc = (...args: string[]) => Promise<boolean>;
export type Command = {
  description: string;
  handler: CommandFunc;
};
type CommandTable = { [key: string]: Command };

export default class Console {
  communication: Communication;
  network: Network;

  commands: CommandTable = {
    exit: {
      description: "Exit the Terminal",
      handler: async () => {
        console.log(chalk.red("Exit"));
        return false;
      }
    },
    "?": {
      description: "List this help",
      handler: async () => {
        console.log(chalk.green("Commands:"));
        for (const command in this.commands) {
          console.log(chalk.green(`  ${command} - ${this.commands[command].description}`));
        }
        return true;
      }
    },
    raw: {
      description: "Send raw AT command to module",
      handler: async (...args: string[]) => {
        console.log(chalk.green(`Sending raw command: ${args.join(" ")}`));
        await this.communication.getConnection().send(args.join(" "));
        await wait(this.communication.getConnection().PAUSE_LENGTH);
        return true;
      }
    },
    send: {
      description: "Send raw message over the module",
      handler: async (...args: string[]) => {
        console.log(chalk.green(`Sending message: ${args.join(" ")}`));
        await this.communication.sendMessage(args.join(" "));
        await wait(this.communication.getConnection().PAUSE_LENGTH);
        return true;
      }
    },
    msg: {
      description: "Send a message to a node in the network using multihop routing",
      handler: async (dest: string, ...args: string[]) => {
        console.log(chalk.green(`Sending msg: ${args.join(" ")}`));
        
        this.network.sendMessage(args.join(" "), Number(dest) as NetworkAddress);
        
        await wait(this.communication.getConnection().PAUSE_LENGTH);
        return true;
      }
    },
    routes: {
      description: "Print this node's routing table",
      handler: async () => {
        console.log(chalk.green(`Routing table:`));
        console.log(getRoutingTableString(this.network.router.routingTable));
        return true;
      }
    },
    revroutes: {
      description: "Print this node's reverse routing table",
      handler: async () => {
        console.log(chalk.green(`Reverse routing table:`));
        console.log(getReverseRoutingTable(this.network.router.reverseRoutingTable));
        return true;
      }
    },
    status: {
      description: "Print this node's status",
      handler: async () => {
        console.log(chalk.green(`Status:`));
        console.log(`
Address: ${this.network.ownAddress}
Sequence Number: ${this.network.sequenceNumber}
Routing Table Size: ${this.network.router.routingTable.length}
Reverse Routing Table Size: ${this.network.router.reverseRoutingTable.length}
`);
        return true;
      }
    }
  }

  constructor(communication: Communication, network: Network) {
    this.communication = communication;
    this.network = network;
  }

  async run() {
    console.log(chalk.green("Opening Terminal - type \"exit\" to exit, \"?\" for help"));

    while(true) {
      const { Terminal: input } = await inquirer.prompt([{ type: 'input', name: 'Terminal' }]);

      let [command, ...args] = input.trim().split(" ");
      command = command.toLowerCase();
      if (this.commands[command]) {
        if (!await this.commands[command].handler(...args)) {
          break;
        }
      } else {
        console.log(chalk.red(`Unknown command: ${command}`));
      }

    }
  }
}