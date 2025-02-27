import 'dotenv/config'

import { exec } from 'child_process'
//https://neon.tech/docs/import/import-from-postgres#export-data-with-pgdump
// 要迁移的db,拉取数据备份到本地
const backupDatabase = () => {
  return new Promise((resolve, reject) => {
    exec(
      `pg_dump -Fc -v -d ${process.env.BACKUP_DATABASE_URL} -f ./db/backup.bak`,
      (error, stdout, stderr) => {
        if (error) {
          console.error('Backup Error:', stderr)
          reject(error)
        } else {
          console.log('Backup STDOUT:', stdout)
          resolve('Neon database backup completed.')
        }
      }
    )
  })
}
// 要备份的新db
const importBackupToDatabase = () => {
  return new Promise((resolve, reject) => {
    exec(
      /**
       * -O 忽略owner
       * -c --clean restore之前会先清空目标db的所有数据
       */
      `pg_restore -v -O -c -d ${process.env.RESTORE_DATA_BASE_URL} ./db/backup.bak`,
      (error, stdout, stderr) => {
        if (error) {
          console.error('Restore Error:', stderr)
          reject(error)
        } else {
          console.log('Restore STDOUT:', stdout)
          resolve('Backup imported into Vercel database.')
        }
      }
    )
  })
}

// 执行备份和导入操作
const main = async () => {
  console.log('Starting database backup and import process...')
  try {
    console.log(await backupDatabase())
    console.log(await importBackupToDatabase())
  } catch (error) {
    console.error('Error:', error)
  }
  console.log('Database backup and import process completed.')
}

// 运行主函数
main()
