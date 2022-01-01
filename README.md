# LoRa Net

This project provides a Command Line App and WebApp for building an adhoc, multihop network using LoRa wireless modules.

It provides a simple React dashboard showing the current status of the connection and allowing manual input of AT commands using a terminal.

This code is paired with a separate, detailed documentation about its functionality, thus this repository only contains minimal info on running the code locally.

## Setting up

1. Clone this repository
1. Install dependencies using `npm install`

## Available scripts

After setting up, these scripts can be used:

- `npm run build`
  Build the Command Line App using tsc
- `npm start`
  Start the command line app. This does not include the webinterface
- `npm run watch`
  Run the command line app in watch mode to auto-reload on changes. This is not recommended as there may be problems with the input
- `npm run package-test`
  Run the package encode/decode test script
- `npm run virtual-net`
  Run the virtual net test network
- `npm run tcp-net`
  Run a node that connects to a TCP server for testing
- `npm run tcp-server`
  Serves a simple TCP server for testing the `tcp-net` feature. This is not a full implementation of the TCP Server needed but rather simply a TCP that accepts conenctions without further logic
- `npm run web:dev`
  Start the webinterface frontend and backend in watch mode to automatically reload when changes are saved.
  This will internally start `npm run web:start` and `npm run web:dev:server` concurrently
- `npm run web:start`
  Start the webinterface. This will not start the required backend - it is recommended to use `npm run web:dev` instead
- `npm run web:build`
  Build the webinterface to static HTML/JS files
- `npm run web:server`
  Run the backend for the webinterface. This will not start the frontend - it is recommended to use `npm run web:dev` instead
- `npm run web:dev:server`
  Run the backend in "watch mode" to automatically restart when files are changed. It is recommended to use `npm run web:dev` instead

## License

This project is licensed under the MIT License.