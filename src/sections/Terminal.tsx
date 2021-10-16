import React from "react";
import { Card } from '@supabase/ui'
import * as Icons from 'react-feather';
import IModuleConnection from "../modules/IModuleConnection";
import NotConnected from "../components/NotConnected";
import { TerminalEntry, TerminalOutput } from "../modules/ITerminal";

type TerminalProps = {
  connection: IModuleConnection | null,
}
type TerminalState = {
  output: TerminalOutput,
  inputVal: string
}

export default class Terminal extends React.Component<TerminalProps, TerminalState> {
  outputElement?: React.RefObject<HTMLDivElement>;

  state: TerminalState = {
    output: [],
    inputVal: ''
  };

  constructor(props: TerminalProps) {
    super(props);

    this.outputElement = React.createRef();
  }

  scrollOutput() {
    setTimeout(() => {
      if (this.outputElement && this.outputElement.current) {
        const el = this.outputElement.current;
        el.scrollTop = el.scrollHeight;
      }
    }, 0);
  }

  addOutput(message: TerminalEntry) {
    this.setState((state) => {
      const output = [...state.output];
      output.push(message);
      return {
        output
      }
    });
  }

  updateLoop: NodeJS.Timeout | false = false;
  componentDidMount() {
    this.updateLoop = setInterval(() => {
      this.addOutput({
        isSender: true,
        message: 'AT+SEND ' + (+new Date())
      });
      this.addOutput({
        isSender: false,
        message: 'AT+OK'
      });
    }, 3000);
  }
  componentWillUnmount() {
    if (this.updateLoop) {
      clearInterval(this.updateLoop);
    }
  }

  render() {
    const {connection} = this.props;

    this.scrollOutput();

    return (
      <Card 
        className="w-full h-full"
        // @ts-ignore
        title={(<div className="flex items-center gap-3"> <Icons.Terminal size={15} /> Terminal </div>)}
      >
        {(connection && connection.getIsConnected()) ? (
          <div className="flex flex-col overflow-scroll h-full">
            
            <div className="overflow-auto font-mono text-xs flex-grow pb-1" ref={this.outputElement}>
              {
                this.state.output.map((entry, i) => (
                  <span className={entry.isSender ? '' : 'text-gray-400'} key={i}>
                    {entry.message}<br />
                  </span>
                ))
              }
            </div>

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
                onKeyDown={(evt) => {
                  if (evt.code === "Enter" && !evt.shiftKey && this.state.inputVal.length > 0) {
                    evt.preventDefault();

                    // TODO: Push to terminal controller
                    this.addOutput({
                      isSender: true,
                      message: this.state.inputVal
                    });
                    this.setState({
                      inputVal: ''
                    });
                  }
                }}
              />
            </div>

          </div>
        ) : (
          <NotConnected />
        )}
      </Card>
    );
  }

}