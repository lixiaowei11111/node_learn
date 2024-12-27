// generate-version.js
const { execSync } = require('child_process');
const fs = require('fs');
const dotenv = require('dotenv');

function getGitInfo() {
  return execSync('git rev-parse --short HEAD').toString().trim();
}

function getVersionFromEnv() {
  const envConfig = dotenv.parse(fs.readFileSync('../.env.prod'));
  return envConfig.VERSION || '1.0.0'; // 默认版本号，以防 .env.prod 中没有定义
}

function updateVersionFile() {
  let versionInfo;
  
  // 尝试读取现有的 version.json 文件
  try {
    versionInfo = JSON.parse(fs.readFileSync('version.json', 'utf8'));
  } catch (error) {
    // 如果文件不存在或无法解析，创建一个新的对象
    versionInfo = {};
  }

  // 从 .env.prod 文件获取版本号
  versionInfo.version = getVersionFromEnv();

  // 更新 lastCommitHash
  versionInfo.lastCommitHash = getGitInfo();

  // 写入更新后的内容
  fs.writeFileSync('version.json', JSON.stringify(versionInfo, null, 2));
  console.log('Version file updated successfully.');
}

updateVersionFile();