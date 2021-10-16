import React from "react";
import { Card } from '@supabase/ui'
import * as Icons from 'react-feather';
import IModuleConnection from "../modules/IModuleConnection";
import NotConnected from "../components/NotConnected";

export default class Network extends React.Component<{
  connection: IModuleConnection | null,
}> {
  render() {
    const {connection} = this.props;

    return (
      <Card 
        className="w-full h-full"
        // @ts-ignore
        title={(<div className="flex items-center gap-3"> <Icons.Share2 size={15} /> Netzwerk </div>)}
      >
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