import React, { useState } from 'react';
import './App.css';
import IModuleConnection from './modules/IModuleConnection';
import TerminalEntryStore from './modules/TerminalEntryStore';
import ConnectionInfo from './sections/ConnectionInfo';
import Network from './sections/Network';
import Terminal from './sections/Terminal';

const terminalEntryStore = new TerminalEntryStore();

function App() {
  const [ connection, setConnection ] = useState<IModuleConnection | null>(null);
  const [ terminalStore ] = useState(terminalEntryStore);
  const [ , setForceRender ] = useState({});

  const forceRender = () => {
    setForceRender({});
  }

  return (
    <div className="min-w-screen h-screen grid grid-rows-2 dark text-gray-100" style={{ backgroundColor: '#2a2a2a' }}>
      
      {/* Top Row */}
      <div className="p-5 pb-0 grid grid-cols-2 gap-5">
        <ConnectionInfo
          connection={connection}
          setConnection={setConnection}
          forceRender={forceRender}
          terminalStore={terminalStore}
        />
        <Network
          connection={connection}
        />
      </div>

      {/* Bottom Row */}
      <div className="p-5">
        <Terminal 
          connection={connection}
          terminalStore={terminalStore}
        />
      </div>

    </div>
  );
}

export default App;
