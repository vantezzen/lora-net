# LoRa Net

> Work In Progress

This project provides a WebApp for building an adhoc, multihop network using LoRa wireless modules.

The webapp will connect to the LoRa module using the experimental [WebSerial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) to communicate using the build-in UART serial AT interface.

It provides a simple React dashboard showing the current status of the connection and allowing manual input of AT commands using a terminal.

## Installation and development

Dependencies should be installed using `yarn`.

### `yarn start`

Start a local dev server

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## License

This project is licensed under the MIT License.