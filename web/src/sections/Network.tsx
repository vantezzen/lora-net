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
        {/* TODO: Implement Network Monitor once Network functionality is implemented */}
        {(connection && connection.getIsConnected()) ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex items-center flex-col text-gray-400">
              <Icons.Hexagon size={30} />
              <h3 className="text-lg mt-3">
                Noch nicht eingerichtet
              </h3>
            </div>
          </div>
        ) : (
          <NotConnected />
        )}

      </Card>
    );
  }

}