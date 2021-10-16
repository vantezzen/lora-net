import React from "react";
import * as Icons from 'react-feather'
import { Button, Card, Badge } from '@supabase/ui'
import TimeAgo from 'javascript-time-ago'
import de from 'javascript-time-ago/locale/de.json'
import IModuleConnection from "../modules/IModuleConnection";
import MockConnection from "../modules/MockConnection";
import BluetoothConnection from "../modules/BluetoothConnection";
import TerminalEntryStore from "../modules/TerminalEntryStore";

TimeAgo.addDefaultLocale(de)
const timeAgo = new TimeAgo('de-DE')

export default class ConnectionInfo extends React.Component<{
  connection: IModuleConnection | null,
  setConnection: (connection: IModuleConnection | null) => any,
  forceRender: () => any,
  terminalStore: TerminalEntryStore
}> {

  state = {
    isDisconnecting: false,
  };

  updateLoop: NodeJS.Timeout | false = false;

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

    if (connection) {
      const connectionInfo = connection.getConnectionInfo();
      if (connectionInfo === false) {
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

      const Icon = Icons[connectionInfo.icon];

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
                  {connectionInfo.name}
                </span>
              </p>
              <p>
                <span className="text-gray-500 mr-3">
                  Verbindungszeit:
                </span>
                <span className="float-right font-bold">
                  seit {timeAgo.format(connectionInfo.connectionStart, 'twitter-now')}
                </span>
              </p>
              <p>
                <span className="text-gray-500 mr-3">
                  Verbindungstyp:
                </span>
                <span className="float-right font-bold">
                  {connection.getConnectionType()}
                </span>
              </p>
            </div>
          </div>

          <Button
            type="default"
            className="mt-5"
            onClick={() => {
              this.setState({ isDisconnecting: true });
              connection.disconnect().then(() => {
                this.setState({ isDisconnecting: false });
                this.props.setConnection(null);
              });
            }}
          >
            Verbindung trennen
          </Button>

        </div>
      )
    }

    return (
      <div>
        <div className="mb-5">
          <Badge color="pink" dot size="large">
            Nicht verbunden
          </Badge>
        </div>

        <Button
          onClick={() => {
            const connect = new BluetoothConnection(this.props.terminalStore);
            this.props.setConnection(connect);

            connect.connect().then((success) => {
              if (!success) {
                this.props.setConnection(null);
              }
              this.props.forceRender();
            });
          }}
          className="m-3"
        >
          Mit Bluetooth Gerät verbinden
        </Button>

        <Button
          className="m-3"
          onClick={() => {
            const connect = new MockConnection();
            this.props.setConnection(connect);

            connect.connect().then(this.props.forceRender);
          }}
        >
          Mit Mock verbinden
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