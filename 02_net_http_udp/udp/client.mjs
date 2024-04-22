import dgram from 'node:dgram'

import { Buffer } from 'node:buffer'

const message = Buffer.from( "udp client Buffer" )
const client = dgram.createSocket( 'udp4' )
client.send( message, 9871, "localhost", ( err ) => {
  if ( err ) {
    console.log( '[debug] udp client error', err )
  }
  client.close()
} )