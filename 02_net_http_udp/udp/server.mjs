import dgram from 'node:dgram'
const server = dgram.createSocket( 'udp4' );

server.on( 'error', ( err ) => {
  console.log( err, 'udp server error' );
  server.close();
} )

server.on( 'message', ( msg, rinfo ) => {
  console.log( `[debug] udp server received message: ${ msg } from ${ rinfo.address }:${ rinfo.port }`, );
} )

server.on( 'listening', () => {
  const address = server.address();
  console.log( `[debug] udp server listening ${ address.address }:${ address.port }` );
} )

server.bind( 9871 );