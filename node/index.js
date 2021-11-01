const SerialPort = require('serialport')
const port = new SerialPort('/dev/tty.MobANet10-SPPDev')

console.log("STARTED");

port.on('error', function(err) {
  console.log('Error: ', err.message)
})

// Switches the port into "flowing mode"
port.on('data', function (data) {
  console.log('Data:', data, data.toString())
})

port.write('AT\r\n', function(err) {
  if (err) {
    return console.log('Error on write: ', err.message)
  }
  console.log('message written')
})

process.on('exit', function () {
  console.log("CLOSING");
  port.close();
});
process.once('uncaughtException', async () => {
  console.log("CLOSING");
  port.close();

  process.exit(0)
})

process.once('SIGINT', () => { throw new Error() })

