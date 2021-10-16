import React, { useState } from 'react';
import './App.css';
import IModuleConnection from './modules/IModuleConnection';
import ConnectionInfo from './sections/ConnectionInfo';
import Network from './sections/Network';

function App() {
  const [ connection, setConnection ] = useState<IModuleConnection | null>(null);
  const [ , setForceRender ] = useState({});

  const forceRender = () => {
    setForceRender({});
  }

  return (
    <div className="min-w-screen min-h-screen grid grid-rows-2 dark text-gray-100" style={{ backgroundColor: '#2a2a2a' }}>
      
      {/* Top Row */}
      <div className="p-5 grid grid-cols-2 gap-5">
        <ConnectionInfo
          connection={connection}
          setConnection={setConnection}
          forceRender={forceRender}
        />
        <Network
          connection={connection}
        />
      </div>

      {/* Bottom Row */}
      <div className="">
        Terminal
      </div>

    </div>
  );
}

export default App;
