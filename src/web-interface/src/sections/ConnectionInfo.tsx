import React from "react";
import * as Icons from 'react-feather'
import { Button, Card, Badge, Select, InputNumber } from '@supabase/ui'
import TimeAgo from 'javascript-time-ago'
import de from 'javascript-time-ago/locale/de.json'
import TerminalEntryStore from "../modules/TerminalEntryStore";
import Connection from "../Connection";

type ConnectionInfoProps = {
  connection: Connection,
  forceRender: () => any,
  terminalStore: TerminalEntryStore
};

export default class ConnectionInfo extends React.Component<ConnectionInfoProps> {

  state = {
    isDisconnecting: false,
    interfaceToConnect: "",
    addressToUse: 0,
  };

  updateLoop: NodeJS.Timeout | false = false;
  timeAgo: TimeAgo;

  constructor(props: ConnectionInfoProps) {
    super(props);

    TimeAgo.addDefaultLocale(de)
    this.timeAgo = new TimeAgo('de-DE')
  }

  // Component is forcing an update every second to keep the "Time since connection" clock up-to-date
  componentDidMount() {
    this.updateLoop = setInterval(() => {
      this.forceUpdate();
    }, 1000);
  }
  componentWillUnmount() {
    if (this.updateLoop) {
      clearInterval(this.updateLoop);
    }
  }

  /**
   * Setup a connection using any Module Connection Class
   * 
   * @param Connection IModuleConnection Class to use
   */
  setupConnection() {
    
  }

  renderContent() {
    const {connection} = this.props;
    
    if (this.state.isDisconnecting) {
      return (
        <div>
          <div className="mb-5">
            <Badge color="indigo" dot size="large">
              Trenne Verbindung...
            </Badge>
          </div>
        </div>
      )
    }

    if (connection.isConnecting) {
      // Connection Class has been added but no connection has been established yet
      // E.g clicked on "Connect" button but didn't choose a device yet
      return (
        <div>
          <div className="mb-5">
            <Badge color="indigo" dot size="large">
              Verbinde...
            </Badge>
          </div>
        </div>
      )
    }

    if (connection.hasConnection) {
      const connectionInfo = false;

      // const Icon = Icons[connectionInfo.icon];
      const Icon = Icons.Link;

      // Connection established and active
      return (
        <div>
          <div className="mb-5">
            <Badge color="green" dot size="large">
              Verbunden mit Gerät
            </Badge>
          </div>

          <div className="flex gap-5">
            <div>
              <Icon
                size={40}
              />
            </div>
            <div className="w-full">
              <p>
                <span className="text-gray-500 mr-3">
                  Name:
                </span>
                <span className="float-right font-bold">
                  {connection.connectionName}
                </span>
              </p>
              <p>
                <span className="text-gray-500 mr-3">
                  Verbindungszeit:
                </span>
                <span className="float-right font-bold">
                  seit {this.timeAgo.format(connection.connectionTime, 'twitter-now')}
                </span>
              </p>
              <p>
                <span className="text-gray-500 mr-3">
                  Verbindungstyp:
                </span>
                <span className="float-right font-bold">
                  {connection.connectionType}
                </span>
              </p>
            </div>
          </div>

          <Button
            type="default"
            className="mt-5"
            onClick={() => {
              this.setState({
                isDisconnecting: true
              })
              connection.disconnect().then(() => {
                this.setState({
                  isDisconnecting: false
                });
              })
            }}
          >
            Verbindung trennen
          </Button>

        </div>
      )
    }

    // No active connection
    return (
      <div>
        <div className="mb-5">
          <Badge color="pink" dot size="large">
            Nicht verbunden
          </Badge>
        </div>

        <InputNumber
          label="Netzwerkadresse"
          value={this.state.addressToUse}
          onChange={(e) => {
            this.setState({
              addressToUse: +e.target.value
            })
          }}
          min={0}
          max={255}
        />

        <Select label="Verfügbare Schnittstellen" value={this.state.interfaceToConnect} onChange={(e) => {
          this.setState({
            interfaceToConnect: e.target.value
          });
        }}>
          <option value="" disabled>
            Wähle eine Schnittstelle
          </option>
          {connection.availableBluetoothDevices.map(device => (
            <option
              key={device}
              value={device}
            >
              {device}
            </option>
          ))}
        </Select>

        <Button
          onClick={() => {
            connection.connectTo("bluetooth", this.state.addressToUse, this.state.interfaceToConnect);
          }}
          className="m-3"
        >
          Mit Schnitstelle verbinden
        </Button>

        <Button
          className="m-3"
          onClick={() => {
            connection.connectTo("mock", this.state.addressToUse);
          }}
        >
          Mock erzeugen
        </Button>

        <Button
          className="m-3"
          onClick={() => {
            const address = prompt('TCP Adresse (z.B. 123.456.789)');
            const port = prompt('TCP Port (z.B. 80)');
            connection.connectTo("tcp", this.state.addressToUse, '', {
              tcpAddr: address,
              tcpPort: port
            });
          }}
        >
          Mit TCP Netzwerk verbinden
        </Button>
      </div>
    );
  }

  render() {
    return (
      <Card 
        className="w-full h-full"
        // @ts-ignore
        title={(<div className="flex items-center gap-3"> <Icons.Link size={15} /> Verbindung </div>)}
      >
        {this.renderContent()}
      </Card>
    );
  }

}