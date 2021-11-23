/**
 * Generic EventListener class to enable listening to and firing events.
 */
export default class EventListener<DataType> {
  private _listeners: ((data: DataType) => void)[] = [];

  /**
   * Add a new listener for the event
   * 
   * @param listener Listener to add
   */
  public add(listener: ((data: DataType) => void)): void {
    this._listeners.push(listener);
  }

  /**
   * Remove a listener from the list
   * 
   * @param listener Listener to remove
   */
  public remove(listener: ((data: DataType) => void)): void {
    const index = this._listeners.indexOf(listener);
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
      listener(data);
    });
  }
}