import chalk from "chalk";
import inquirer from "inquirer";
import Communication from "./Communication";
import ICommunication from "./interfaces/ICommunication";
import Network from "./Network";
import { NetworkAddress } from "./networkPackages/utils/NetworkPackage";
import { wait } from "./utils";
import { getReverseRoutingTable, getRoutingTableDiagram, getRoutingTableString } from "./utils/Logging";

export type LoggerFunc = (...args: any[]) => void;
export type CommandFunc = (log: LoggerFunc, ...args: string[]) => Promise<boolean>;
export type Command = {
  description: string;
  handler: CommandFunc;
};
type CommandTable = { [key: string]: Command };

export default class Console {
  communication: ICommunication | Communication;
  network: Network;

  commands: CommandTable = {
    exit: {
      description: "Exit the Terminal",
      handler: async (log) => {
        log(chalk.red("Exit"));
        return false;
      }
    },
    "?": {
      description: "List this help",
      handler: async (log) => {
        log(chalk.green("Commands:"));
        for (const command in this.commands) {
          log(chalk.green(`  ${command} - ${this.commands[command].description}`));
        }
        return true;
      }
    },
    raw: {
      description: "Send raw AT command to module",
      handler: async (log, ...args: string[]) => {
        log(chalk.green(`Sending raw command: ${args.join(" ")}`));

        if ("getConnection" in this.communication) {
          await this.communication.getConnection().send(args.join(" "));
          await wait(this.communication.getConnection().PAUSE_LENGTH);
        } else {
          log(chalk.red("Not supported. The current communication mode does not support sending raw commands."));
        }
        return true;
      }
    },
    send: {
      description: "Send raw message over the module",
      handler: async (log, ...args: string[]) => {
        log(chalk.green(`Sending message: ${args.join(" ")}`));

        await this.communication.sendMessage(args.join(" "));

        if ("getConnection" in this.communication) {
          await wait(this.communication.getConnection().PAUSE_LENGTH);
        } else {
          log(chalk.gray("Not waiting as current connection does not have pause length."));
        }
        return true;
      }
    },
    msg: {
      description: "Send a message to a node in the network using multihop routing",
      handler: async (log, dest: string, ...args: string[]) => {
        log(chalk.green(`Sending msg: ${args.join(" ")}`));
        
        this.network.sendMessage(args.join(" ").replace("\r\n", ""), Number(dest) as NetworkAddress);
        
        if ("getConnection" in this.communication) {
          await wait(this.communication.getConnection().PAUSE_LENGTH);
        } else {
          log(chalk.gray("Not waiting as current connection does not have pause length."));
        }
        return true;
      }
    },
    routes: {
      description: "Print this node's routing table",
      handler: async (log) => {
        log(chalk.green(`Routing table:`));
        log(getRoutingTableString(this.network.router.routingTable));
        return true;
      }
    },
    drawroutes: {
      description: "Print a diagram of the routing table",
      handler: async (log) => {
        log(chalk.green(`Routing table:`));
        log(getRoutingTableDiagram(this.network.router.routingTable, this.network.ownAddress));
        return true;
      }
    },
    revroutes: {
      description: "Print this node's reverse routing table",
      handler: async (log) => {
        log(chalk.green(`Reverse routing table:`));
        log(getReverseRoutingTable(this.network.router.reverseRoutingTable));
        return true;
      }
    },
    status: {
      description: "Print this node's status",
      handler: async (log) => {
        log(chalk.green(`Status:`));
        log(`
Address: ${this.network.ownAddress}
Sequence Number: ${this.network.sequenceNumber}
Routing Table Size: ${this.network.router.routingTable.length}
Reverse Routing Table Size: ${this.network.router.reverseRoutingTable.length}
`);
        return true;
      }
    }
  }

  constructor(communication: ICommunication, network: Network) {
    this.communication = communication;
    this.network = network;
  }

  async interpretCommand(input: string, log = console.log) {
    let [command, ...args] = input.trim().split(" ");
    command = command.toLowerCase();
    if (this.commands[command]) {
      if (!await this.commands[command].handler(log, ...args)) {
        return false;
      }
    } else {
      console.log(chalk.red(`Unknown command: ${command}`));
    }
    return true;
  }

  async run() {
    console.log(chalk.green("Opening Terminal - type \"exit\" to exit, \"?\" for help"));

    while(true) {
      const { Terminal: input } = await inquirer.prompt([{ type: 'input', name: 'Terminal' }]);
      if (!await this.interpretCommand(input)) {
        break;
      }
    }
  }
}