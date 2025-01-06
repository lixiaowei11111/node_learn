import winston from 'winston';
import dayjs from 'dayjs';

const getLogFileName = (prefix: string) => {
  const date = dayjs().format('YYYY-MM-DD');
  return `${date}-${prefix}.log`;
};

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    new winston.transports.File({
      level: 'info',
      filename: 'logs/' + getLogFileName('info'),
    }),
    new winston.transports.File({
      level: 'info',
      filename: 'logs/' + getLogFileName('error'),
    }),
  ],
});

export default logger;
/**
1. level
作用：设置日志记录的最低级别。

可选值：error、warn、info、verbose、debug、silly。

解释：只有等于或高于该级别的日志才会被记录。例如，设置为 info 时，info、warn 和 error 级别的日志会被记录，而 debug 和 silly 则不会。

2. format
作用：定义日志的输出格式。

常用格式：

winston.format.json()：将日志输出为 JSON 格式。

winston.format.simple()：输出简单的文本格式。

winston.format.combine()：组合多个格式。

winston.format.timestamp()：为日志添加时间戳。

winston.format.prettyPrint()：美化输出（适合开发环境）。

示例：

javascript
复制
format: winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
)
3. transports
作用：定义日志的输出目标。

常用传输方式：

winston.transports.Console()：将日志输出到控制台。

winston.transports.File({ filename: 'logs.log',level:"error" })：将日志输出到文件,只有level高于error的日志才会被记录到文件上面。

winston.transports.Http()：将日志发送到 HTTP 端点。

示例：

javascript
复制
transports: [
  new winston.transports.Console(),
  new winston.transports.File({ filename: 'combined.log' })
]
4. 其他常用配置
exitOnError
作用：是否在日志记录失败时退出进程。

默认值：true。

示例：

javascript
复制
exitOnError: false
handleExceptions
作用：是否捕获未处理的异常并记录。

默认值：false。

示例：

javascript
复制
exceptionHandlers: [
  new winston.transports.File({ filename: 'exceptions.log' })
]
silent
作用：是否禁用所有日志记录。

默认值：false。

示例：

javascript
复制
silent: true
 */
