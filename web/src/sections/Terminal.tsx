import React from "react";
import { Card } from '@supabase/ui'
import * as Icons from 'react-feather';
import IModuleConnection from "../modules/IModuleConnection";
import TerminalEntryStore from "../modules/TerminalEntryStore";

type TerminalProps = {
  connection: IModuleConnection | null,
  terminalStore: TerminalEntryStore
}
type TerminalState = {
  inputVal: string
}

export default class Terminal extends React.Component<TerminalProps, TerminalState> {
  outputElement?: React.RefObject<HTMLDivElement>;

  state: TerminalState = {
    inputVal: ''
  };

  constructor(props: TerminalProps) {
    super(props);

    this.outputElement = React.createRef();
    this.doUpdate = this.doUpdate.bind(this);
  }

  /**
   * Scroll the output element to the bottom to show the latest messages
   */
  scrollOutput() {
    setTimeout(() => {
      if (this.outputElement && this.outputElement.current) {
        const el = this.outputElement.current;
        el.scrollTop = el.scrollHeight;
      }
    }, 0);
  }

  /**
   * Wrapped update method for use in the terminal store.
   * This is needed to bind `this` to the function as it will fail otherwise.
   */
  doUpdate() {
    this.forceUpdate();
  }

  componentDidMount() {
    this.props.terminalStore.onUpdate(this.doUpdate);
  }
  componentWillUnmount() {
    this.props.terminalStore.removeUpdateListener(this.doUpdate);
  }

  render() {
    this.scrollOutput();

    return (
      <Card 
        className="w-full h-full"
        // @ts-ignore
        title={(<div className="flex items-center gap-3"> <Icons.Terminal size={15} /> Terminal </div>)}
      >
        <div className="flex flex-col overflow-scroll h-full">
            
          {/* Output */}
          <div className="overflow-auto font-mono text-xs flex-grow pb-1" ref={this.outputElement}>
            {
              this.props.terminalStore.getAll().map((entry, i) => (
                <span className={entry.isSender ? '' : 'text-gray-400'} key={i}>
                  {entry.message}<br />
                </span>
              ))
            }
          </div>

          {/* Input */}
          <div className="border-t flex-shrink-0 py-1" style={{ borderColor: '#2a2a2a' }}>
            <input 
              type="text"
              className="
                bg-transparent
                w-full h-full
                outline-none
                border border-transparent
                rounded
                focus:border-gray-600
                p-2
                font-mono
                text-xs
              "
              placeholder="Kommandos hier eingeben..."
              value={this.state.inputVal}
              
              onChange={(evt) => {this.setState({ inputVal: evt.target.value })}}

              // Pressing "Enter" without Shift should send the message
              onKeyDown={(evt) => {
                if (evt.code === "Enter" && !evt.shiftKey && this.state.inputVal.length > 0) {
                  evt.preventDefault();
                  this.props.connection?.send(this.state.inputVal);
                  this.setState({
                    inputVal: ''
                  });
                }
              }}
            />
          </div>

        </div>
      </Card>
    );
  }

}