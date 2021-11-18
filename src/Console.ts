import chalk from "chalk";
import inquirer from "inquirer";
import Communication from "./Communication";
import { wait } from "./utils";

export type CommandFunc = (...args: string[]) => Promise<boolean>;
export type Command = {
  description: string;
  handler: CommandFunc;
};
type CommandTable = { [key: string]: Command };

export default class Console {
  communication: Communication;

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
      description: "Send message over the module",
      handler: async (...args: string[]) => {
        console.log(chalk.green(`Sending message: ${args.join(" ")}`));
        await this.communication.sendMessage(args.join(" "));
        await wait(this.communication.getConnection().PAUSE_LENGTH);
        return true;
      }
    }
  }

  constructor(communication: Communication) {
    this.communication = communication;
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