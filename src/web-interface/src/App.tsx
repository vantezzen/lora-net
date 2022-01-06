import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import './App.css';
import Connection from './Connection';
import TerminalEntryStore from './modules/TerminalEntryStore';
import ConnectionInfo from './sections/ConnectionInfo';
import Network from './sections/Network';
import Terminal from './sections/Terminal';

const terminalEntryStore = new TerminalEntryStore();

const conn = new Connection(terminalEntryStore);

function App() {
  // Global classes
  const [ connection ] = useState<Connection>(conn);
  const [ terminalStore ] = useState(terminalEntryStore);
  
  // Allow forcing the complete app to rerender to reflect large state changes (e.g. connection change)
  const [ , setForceRender ] = useState({});
  const forceRender = () => {
    setForceRender({});
  }
  useEffect(() => {
    connection.onChange(forceRender);
  }, []);

  return (
    <div className="min-w-screen h-screen dark text-gray-100 bg-neutral-800">
      {!connection.isSocketConnected && (
        <div className="flex justify-center flex-col items-center h-screen">
          <AlertTriangle className="text-center" size={100} />
          <h1 className="text-center text-gray-500 text-xl">
            Keine Verbindung zum Server
          </h1>
        </div>
      )}
      
      {/* Top Row */}
      <div className="p-5 pb-0 flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        <ConnectionInfo
          connection={connection}
          forceRender={forceRender}
          terminalStore={terminalStore}
        />
        <div className="lg:col-span-2">
          <Network
            connection={connection}
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="p-5" style={{ height: 'calc(50vh - 2.5rem)' }}>
        <Terminal 
          connection={connection}
          terminalStore={terminalStore}
        />
      </div>
    </div>
  );
}

export default App;
