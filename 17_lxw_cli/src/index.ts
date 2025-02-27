import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import minimist from "minimist";
import prompts from "prompts";
import {
  blue,
  cyan,
  green,
  red,
  reset,
} from "kolorist";



const cwd = process.cwd()

/* 1. 获取命令行参数,支持直接选择模板 */
const argv = minimist<{
  template?: string;
}>(process.argv.slice(2), { string: ["_"] })

type ColorFunc = (str: string | number) => string;
type Framework = {
  name: string;
  display: string;
  directory: string;
  color: ColorFunc;
}

const FRAMEWORKS: Framework[] = [
  {
    name: "react",
    display: "React",
    directory: "react-ts-webpack",
    color: blue,
  },
  {
    name: "react+h5",
    display: "H5+React",
    directory: "react-ts-webpack",
    color: cyan,
  },
  {
    name: "react+chrome-extension",
    display: "Chrome-extension",
    directory: "chrome-extension",
    color: green,
  },
]

/* 2. 生成模板数组 */
const TEMPLATES = FRAMEWORKS.map(f => f.name)

const defaultTargetDir = "default-project"


/* 3. main函数定义 */
const main = async () => {
  const argTemplate = argv.template;// 获取命令行中的模板参数名称
  const argTargetDir = formatTargetDir(argv._[0])// 获取并去除项目名称的/和trim()操作
  let targetDir = argTargetDir || defaultTargetDir

  const getProjectName = () => targetDir === "." ? path.basename(path.resolve()) : targetDir// .的话获取当前文件夹名称

  let result: prompts.Answers<"projectName" | "overwrite" | "packageName" | "framework">;

  // 命令行交互
  try {
    result = await prompts([
      {
        /* 4. 输入项目名称,如果命令行携带了则跳过 */
        type: argTargetDir ? null : "text",
        name: "projectName",
        message: reset("Project name:"),
        initial: defaultTargetDir,
        onState: (state) => {
          targetDir = formatTargetDir(state.value) || defaultTargetDir
        }
      },
      {
        /* 5. 获取上一步输入的值,判断在项目中是否存在,存在则询问是否删除原有的文件夹并继续 */
        type: () => !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : "confirm",
        name: "overwrite",
        message: () => (
          targetDir === "." ? "Current directory" : `Target directory "${targetDir}"` + "is not empty. Remove existing files and continue?`"
        )
      }, {
        /* 6. 判断是否进行了上一步操作,confrim类型返回 boolean */
        type: (_, { overwrite }: { overwrite?: boolean }) => {
          if (overwrite === false) {
            throw new Error(red("✖") + " Operation cancelled")
          }
          return null
        },
        name: "overwriteChecker"
      }, {
        /* 7. 验证项目名称是否符合npm的要求,不符合则要求手动输入,并进行验证 */
        type: () => (isValidPackageName(getProjectName()) ? null : "text"),
        name: "packageName",
        message: reset("Package name:"),
        initial: () => toValidPackageName(getProjectName()),
        validate: (dir) => isValidPackageName(dir) || "Invalid package.json name"
      }, {
        /* 8. 模板选择,如果命令行中有输入模板参数,并且模板列表中包含该参数,则跳过这一步 ,不包含则提示这不是一个有效的模板参数*/
        type: argTemplate && TEMPLATES.includes(argTemplate) ? null : "select",
        name: "framework",
        message: typeof argTemplate === "string" && !TEMPLATES.includes(argTemplate)
          ? reset(
            `"${argTemplate}" 不是一个有效的模板. 请从下面选择: `
          )
          : reset("Select a framework:"),
        initial: 0,
        choices: FRAMEWORKS.map((f) => {
          const frameworkColor = f.color;
          return {
            title: frameworkColor(f.display),
            value: f,
          }
        })
      }

    ], {
      onCancel: () => {
        throw new Error(red("✖") + " Operation cancelled");
      }
    })
  } catch (cancelled: any) {
    console.log(cancelled.message);
    return
  }
  /* 9. 获取输出结果 */
  const { framework, overwrite, packageName } = result
  const root = path.join(cwd, targetDir)

  /* 10. 判断是否选择了overwrite,是则删除文件夹下的文件,否则自动递归创建(兼容 aa/bb 这种情况) */
  if (overwrite) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true })
  }

  /* 11. 确定模板和包管理器 */
  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);

  const pkgManager = pkgInfo ? pkgInfo.name : "npm";

  console.log(`\nScaffolding project in ${root}...`);

  const templateDir = path.resolve(fileURLToPath(import.meta.url), "../..", `template/${framework.directory}`,)

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath)
    }
  }

  /* 12. 读取模板文件夹,更改package.json的名称写入目标文件夹 */
  console.log(templateDir, "templateDir")
  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => f !== "package.json")) {
    write(file)
  }
  const pkg = JSON.parse(fs.readFileSync(path.join(templateDir, "package.json"), "utf-8"))
  pkg.name = packageName || getProjectName();
  write("package.json", JSON.stringify(pkg, null, 2) + "\n")

  const cdProjectName = path.resolve(cwd, root);
  console.log(`\nDone. Now run:\n`);
  if (root !== cwd) {
    console.log(
      `  cd ${cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
      }`
    );
  }
  switch (pkgManager) {
    case "yarn":
      console.log("  yarn");
      console.log("  yarn dev");
      break;
    default:
      console.log(`  ${pkgManager} install`);
      console.log(`  ${pkgManager} run dev`);
      break;
  }
  console.log();// 输出空行

}


/* 格式化projectName */
const formatTargetDir = (targetDir: string | undefined) => targetDir?.trim().replace(/\/+$/g, "");// 去除前后空格,同时移除末尾的 /


/* 判断文件夹是否为空,兼容有.git的情况 */
const isEmpty = (path: string) => {
  const files = fs.readdirSync(path)
  return files.length === 0 || (files.length === 1 && files[0] === ".git")
}

/* 验证projectName */
const isValidPackageName = (projectName: string) => {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName
  );
}

/* format packageName */
const toValidPackageName = (projectName: string) => projectName
  .trim()// 去除前后空格
  .toLowerCase()// 转为小写
  .replace(/\s+/g, "_")// 空格转为 _
  .replace(/^[._]/g, "")// 去除开头.和 _
  .replace(/[^a-z\d\-~]+/g, "-");// 将特殊字符转为 -

/* 清空文件夹 */
const emptyDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === ".git") {
      continue;
      // 不能删除原来文件夹下的.git文件夹
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
  }
}

/* 格式化输出包管理器信息 */
const pkgFromUserAgent = (userAgent: string | undefined) => {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/")
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  }
}

/** 复制文件夹以及文件 */
const copy = (src: string, dest: string) => {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest)
  }
}

/* 复制文件夹,创建文件夹,遍历文件夹下面的文件,递归 */
const copyDir = (srcDir: string, destDir: string) => {
  fs.mkdirSync(destDir, { recursive: true })

  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}

main().catch(e => {
  console.error(e)
})