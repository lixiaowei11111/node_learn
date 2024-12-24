import fsPromise from 'node:fs/promises'

//删除

// rm
const rm = async () => {
  await fsPromise.rm( './test', { recursive: true } )
  await fsPromise.rmdir( './de', { recursive: true } )
}
rm()