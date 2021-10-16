import { TerminalEntry, TerminalOutput } from "./ITerminal";

export default class TerminalEntryStore {
  private entries: TerminalOutput = [];
  private updateListeners: Function[] = [];

  constructor() {
    this.add({
      isSender: true,
      message: "Wilkommen im Terminal!",
    });
  }

  /**
   * Add a new entry to the terminal
   * 
   * @param entry Entry to add
   */
  add(entry: TerminalEntry) {
    this.entries.push({
      isSender: entry.isSender,
      message: `[${(new Date()).toLocaleTimeString()}] ${entry.message}`,
    });
    this.updateListeners.forEach(listener => listener());
  }

  /**
   * Get all saved entries
   * 
   * @returns Entry array
   */
  getAll() {
    return this.entries;
  }

  /**
   * Add a new listener to call when entries get updated
   * 
   * @param callback Callback
   */
  onUpdate(callback: Function) {
    this.updateListeners.push(callback);
  }

  /**
   * Remove an update listener
   * 
   * @param callback Callback to remove
   */
  removeUpdateListener(callback: Function) {
    this.updateListeners = this.updateListeners.filter(listener => listener !== callback);
  }
}