import Net from 'net';

const server = new Net.Server();

server.on('connection', (socket: Net.Socket) => {
  console.log('client connected');

  socket.on('data', (data: Buffer) => {
      console.log("Got data", data.toString());
  });
  socket.on('end', function() {
    console.log('Closing connection with the client');
  });
  socket.on('error', function(err) {
      console.log(`Error: ${err}`);
  });
});

server.listen(64387);
