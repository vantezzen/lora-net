import React from "react";
import * as Icons from 'react-feather'
import { Button, Card, Badge } from '@supabase/ui'
import IModuleConnection from "../modules/IModuleConnection";
import NotConnected from "../components/NotConnected";

export default class Network extends React.Component<{
  connection: IModuleConnection | null,
}> {
  render() {
    const {connection} = this.props;

    return (
      <Card className="w-full h-full" title="Netzwerk">
        {(connection && connection.getIsConnected()) ? (
          <div>
            Noch nicht eingerichtet
          </div>
        ) : (
          <NotConnected />
        )}
      </Card>
    );
  }

}