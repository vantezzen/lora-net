import React from "react";
import { Card, Typography } from '@supabase/ui'
import * as Icons from 'react-feather';
import NotConnected from "../components/NotConnected";
import Connection from "../Connection";

export default class Network extends React.Component<{
  connection: Connection,
}> {
  render() {
    const {connection} = this.props;

    return (
      <Card 
        className="w-full h-full"
        // @ts-ignore
        title={(<div className="flex items-center gap-3"> <Icons.Share2 size={15} /> Netzwerk </div>)}
      >
        {(connection.hasConnection) ? (
          <div>
            <Typography.Title level={4}>
              Routing Table
            </Typography.Title>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-neutral-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Dest
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Hop
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Pre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Metric
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    SN
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    valid
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {connection.tables.routingTable.map((entry, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.destination}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.nextHop}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{JSON.stringify(entry.precursors)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.metric}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.sequenceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.isValid ? 'Y' : 'N'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Typography.Title level={4}>
              Reverse Routing Table
            </Typography.Title>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-neutral-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Dest
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Source
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    RREQ ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Pre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    SN
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Metric
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {connection.tables.reverseRoutingTable.map((entry, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.destination}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.source}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.rreqId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.precusor}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.metric}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <NotConnected />
        )}

      </Card>
    );
  }

}