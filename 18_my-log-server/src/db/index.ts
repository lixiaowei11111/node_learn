/* 数据库密码不能直接写在代码里面,需要根据环境的不同来读取不同的配置文件, 比如有些项目会使用使用nacos来读取配置文件 */
import dotenv from 'dotenv'
import path from 'path'

export const config = dotenv.config({ path: path.resolve(__dirname, '/env/.env.' + process.env.NODE_ENV) })
