/**
 * Generic EventListener class to enable listening to and firing events.
 */
export default class EventListener<DataType> {
  private _listeners: ({
    handler: (data: DataType) => void,
    once: boolean,
  })[] = [];

  /**
   * Add a new listener for the event
   * 
   * @param listener Listener to add
   */
  public add(listener: ((data: DataType) => void)): void {
    this._listeners.push({
      handler: listener,
      once: false,
    });
  }

  /**
   * Add a new listener to call once when event is fired
   * 
   * @param listener 
   */
  public once(listener: ((data: DataType) => void)): void {
    this._listeners.push({
      handler: listener,
      once: true,
    });
  }

  /**
   * Remove a listener from the list
   * 
   * @param listener Listener to remove
   */
  public remove(listener: ((data: DataType) => void)): void {
    const index = this._listeners.findIndex((l) => l.handler === listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }

  /**
   * Fire all listeners for the event
   * 
   * @param data Data to pass to the listeners
   */
  public fire(data: DataType): void {
    this._listeners.forEach((listener) => {
      listener.handler(data);
      if(listener.once) {
        this.remove(listener.handler);
      }
    });
  }

  public getListenerAmount() {
    return this._listeners.length;
  }
}