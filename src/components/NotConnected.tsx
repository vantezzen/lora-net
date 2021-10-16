import React from "react"
import { Link } from "react-feather";

const NotConnected = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="flex items-center flex-col text-gray-400">
      <Link size={30} />
      <h3 className="text-lg mt-3">
        Nicht verbunden
      </h3>
    </div>
  </div>
)
export default NotConnected;