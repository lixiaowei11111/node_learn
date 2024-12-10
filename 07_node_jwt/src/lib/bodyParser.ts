import { IncomingMessage } from "http";

interface RequestBody {
  [key: string]: any;
}

export default async function parseRequestBody(req: IncomingMessage): Promise<RequestBody> {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', (chunk: string) => {
      data += chunk;
    });

    req.on('end', () => {
      try {
        console.log('[debug] ', data)
        const parsedData: RequestBody = JSON.parse(data);
        resolve(parsedData);
      } catch (error) {
        reject(new Error('Invalid JSON data'));
      }
    });

    req.on('error', (err: Error) => {
      reject(err);
    });
  });
}