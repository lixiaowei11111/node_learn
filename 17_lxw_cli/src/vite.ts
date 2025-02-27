import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import spawn from "cross-spawn";
import minimist from "minimist";
import prompts from "prompts";
import {
  blue,
  cyan,
  green,
  lightBlue,
  lightGreen,
  lightRed,
  magenta,
  red,
  reset,
  yellow,
} from "kolorist";

// Avoids autoconversion to number of the project name by defining that the args
// non associated with an option ( _ ) needs to be parsed as a string. See #4606

/** 1. 获取命令行参数,process.argv 第一第二个参数分别为nodejs 和 script文件启动目录,其余参数为自定义参数,通过 --会被一个特殊选项*/
const argv = minimist<{
  t?: string;
  template?: string;
}>(process.argv.slice(2), { string: ["_"] });
const cwd = process.cwd();
console.log(argv, "arguments vector");

type ColorFunc = (str: string | number) => string;
type Framework = {
  name: string;
  display: string;
  color: ColorFunc;
  variants: FrameworkVariant[];
};
type FrameworkVariant = {
  name: string;
  display: string;
  color: ColorFunc;
  customCommand?: string;
};

const FRAMEWORKS: Framework[] = [
  {
    name: "vanilla",
    display: "Vanilla",
    color: yellow,
    variants: [
      {
        name: "vanilla-ts",
        display: "TypeScript",
        color: blue,
      },
      {
        name: "vanilla",
        display: "JavaScript",
        color: yellow,
      },
    ],
  },
  {
    name: "vue",
    display: "Vue",
    color: green,
    variants: [
      {
        name: "vue-ts",
        display: "TypeScript",
        color: blue,
      },
      {
        name: "vue",
        display: "JavaScript",
        color: yellow,
      },
      {
        name: "custom-create-vue",
        display: "Customize with create-vue ↗",
        color: green,
        customCommand: "npm create vue@latest TARGET_DIR",
      },
      {
        name: "custom-nuxt",
        display: "Nuxt ↗",
        color: lightGreen,
        customCommand: "npm exec nuxi init TARGET_DIR",
      },
    ],
  },
  {
    name: "react",
    display: "React",
    color: cyan,
    variants: [
      {
        name: "react-ts",
        display: "TypeScript",
        color: blue,
      },
      {
        name: "react-swc-ts",
        display: "TypeScript + SWC",
        color: blue,
      },
      {
        name: "react",
        display: "JavaScript",
        color: yellow,
      },
      {
        name: "react-swc",
        display: "JavaScript + SWC",
        color: yellow,
      },
    ],
  },
  {
    name: "preact",
    display: "Preact",
    color: magenta,
    variants: [
      {
        name: "preact-ts",
        display: "TypeScript",
        color: blue,
      },
      {
        name: "preact",
        display: "JavaScript",
        color: yellow,
      },
    ],
  },
  {
    name: "lit",
    display: "Lit",
    color: lightRed,
    variants: [
      {
        name: "lit-ts",
        display: "TypeScript",
        color: blue,
      },
      {
        name: "lit",
        display: "JavaScript",
        color: yellow,
      },
    ],
  },
  {
    name: "svelte",
    display: "Svelte",
    color: red,
    variants: [
      {
        name: "svelte-ts",
        display: "TypeScript",
        color: blue,
      },
      {
        name: "svelte",
        display: "JavaScript",
        color: yellow,
      },
      {
        name: "custom-svelte-kit",
        display: "SvelteKit ↗",
        color: red,
        customCommand: "npm create svelte@latest TARGET_DIR",
      },
    ],
  },
  {
    name: "solid",
    display: "Solid",
    color: blue,
    variants: [
      {
        name: "solid-ts",
        display: "TypeScript",
        color: blue,
      },
      {
        name: "solid",
        display: "JavaScript",
        color: yellow,
      },
    ],
  },
  {
    name: "qwik",
    display: "Qwik",
    color: lightBlue,
    variants: [
      {
        name: "qwik-ts",
        display: "TypeScript",
        color: lightBlue,
      },
      {
        name: "qwik",
        display: "JavaScript",
        color: yellow,
      },
      {
        name: "custom-qwik-city",
        display: "QwikCity ↗",
        color: lightBlue,
        customCommand: "npm create qwik@latest basic TARGET_DIR",
      },
    ],
  },
  {
    name: "others",
    display: "Others",
    color: reset,
    variants: [
      {
        name: "create-vite-extra",
        display: "create-vite-extra ↗",
        color: reset,
        customCommand: "npm create vite-extra@latest TARGET_DIR",
      },
      {
        name: "create-electron-vite",
        display: "create-electron-vite ↗",
        color: reset,
        customCommand: "npm create electron-vite@latest TARGET_DIR",
      },
    ],
  },
];

/** 2. 定义框架和模板,生成模板数组,可用于直接匹配命令行 --template参数后面的值 */
const TEMPLATES = FRAMEWORKS.map(
  (f) => (f.variants && f.variants.map((v) => v.name)) || [f.name]
).reduce((a, b) => a.concat(b), []);

console.log(TEMPLATES, "TEMPLATES");

const renameFiles: Record<string, string | undefined> = {
  _gitignore: ".gitignore",
};

// 3. 设置默认值
const defaultTargetDir = "vite-project";

/* 4.进入主函数 */
async function init() {
  /* 5. 判断命令行是否直接携带了参数 */
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.template || argv.t;
  console.log(argTargetDir, "argTargetDir");
  console.log(argTemplate, "argTemplate");

  let targetDir = argTargetDir || defaultTargetDir;
  const getProjectName = () =>
    targetDir === "." ? path.basename(path.resolve()) : targetDir;

  let result: prompts.Answers<
    "projectName" | "overwrite" | "packageName" | "framework" | "variant"
  >;
  // 输入选择进程
  try {
    result = await prompts(
      [
        {
           /* 6. 输入项目名称,如果命令行携带了项目名称则跳过 */
          type: argTargetDir ? null : "text",
          name: "projectName",
          message: reset("Project name:"),
          initial: defaultTargetDir,
          onState: (state) => {
            // 格式化项目名称,trim,并替换\/ 结尾的
            targetDir = formatTargetDir(state.value) || defaultTargetDir;
          },
        },
        {
          /* 7. 判断要建立的文件夹是否存在(isEmpty函数兼容.git情况),不存在则跳过,存在则询问是否删除并继续新建 */
          type: () =>
            !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : "confirm",
          name: "overwrite",
          message: () =>
            (targetDir === "."
              ? "Current directory"
              : `Target directory "${targetDir}"`) +
            ` is not empty. Remove existing files and continue?`,
        },
        {
          /* 8. 判断是否进行了第七步操作,没有则跳过,或者进行了但选了否则throw error停止进程 */
          type: (_, { overwrite }: { overwrite?: boolean }) => {
            if (overwrite === false) {
              throw new Error(red("✖") + " Operation cancelled");
            }
            return null;
          },
          name: "overwriteChecker",
        },
        {
          /* 9. 判断项目名是否符合package.json的包名要求.不符合则要求输入包名,并输入时进行验证 */
          type: () => (isValidPackageName(getProjectName()) ? null : "text"),
          name: "packageName",
          message: reset("Package name:"),
          initial: () => toValidPackageName(getProjectName()),
          validate: (dir) =>
            isValidPackageName(dir) || "Invalid package.json name",
        },
        {
          /* 10. 框架选择,一级菜单 */
          type:
            argTemplate && TEMPLATES.includes(argTemplate) ? null : "select",
          name: "framework",
          message:
            typeof argTemplate === "string" && !TEMPLATES.includes(argTemplate)
              ? reset(
                  `"${argTemplate}" isn't a valid template. Please choose from below: `
                )
              : reset("Select a framework:"),
          initial: 0,
          choices: FRAMEWORKS.map((framework) => {
            const frameworkColor = framework.color;
            return {
              title: frameworkColor(framework.display || framework.name),
              value: framework,
            };
          }),
        },
        {
          /* 11. 判断是否有二级框架,如果有则进行二级选择 */
          type: (framework: Framework) =>
            framework && framework.variants ? "select" : null,
          name: "variant",
          message: reset("Select a variant:"),
          choices: (framework: Framework) =>
            framework.variants.map((variant) => {
              const variantColor = variant.color;
              return {
                title: variantColor(variant.display || variant.name),
                value: variant.name,
              };
            }),
        },
      ],
      {
        /* 12. 退出操作提醒 */
        onCancel: () => {
          throw new Error(red("✖") + " Operation cancelled");
        },
      }
    );
  } catch (cancelled: any) {
    /* 13. 捕获报错和内部的 throw error,并返回 */
    console.log(cancelled.message);
    return;
  }

  // user choice associated with prompts
  /* 14. 获取输入结果和目标目录路径 */
  const { framework, overwrite, packageName, variant } = result;

  const root = path.join(cwd, targetDir);

  /* 15. 如果选择了复写操作,则清空目标目录路径,未选择,则自动递归的创建目标文件夹 */
  if (overwrite) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  /* 16. 确定模板 */
  // determine template
  let template: string = variant || framework?.name || argTemplate;
  let isReactSwc = false;
  if (template.includes("-swc")) {
    isReactSwc = true;
    template = template.replace("-swc", "");
  }

  /**
   * 17.确定使用的包管理器,如果获取不到,默认使用的是npm,
   * npx create-vite(bin command) myapp 
   * npm exec create-vite(bin command) myapp
   * npm init vite myapp { name: 'npm', version: '9.5.1' } pkgInfo
   * yarn create vite myapp { name: 'yarn', version: '1.22.19' } pkgInfo
   * * * * *
   * npm init和yarn create利用包名规则 create-*，先全局下载到本地再执行
   * npx xxx没有包名约束，临时下载执行后删除
   * npm init react-app my-app 等同于 yarn create react-app my-app
   *  */
  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";
  const isYarn1 = pkgManager === "yarn" && pkgInfo?.version.startsWith("1.");

  console.log(pkgInfo,"pkgInfo");
  

  /** 
   * 18.
   * 看看选择的模板中是否有 customCommand 属性(如custom-create-vue,
   * 有customCommand属性,则会根据包管理器等处理后,最后通过spawn来同步执行命令)
   * 参考: https://blog.csdn.net/Cyj1414589221/article/details/128191826
   *  */
  const { customCommand } =
    FRAMEWORKS.flatMap((f) => f.variants).find((v) => v.name === template) ??
    {};

  if (customCommand) {
    //执行命令: npm init vite myapp,然后选择vue下的variants的 custom-nuxt
    //此时customComamnd ==> npm exec nuxi init TARGET_DIR
    const fullCustomCommand = customCommand
      .replace(/^npm create /, () => {
        // `bun create` uses it's own set of templates,
        // the closest alternative is using `bun x` directly on the package
        if (pkgManager === "bun") {
          return "bun x create-";
        }
        return `${pkgManager} create `;
      })
      // Only Yarn 1.x doesn't support `@version` in the `create` command
      .replace("@latest", () => (isYarn1 ? "" : "@latest"))
      .replace(/^npm exec/, () => {
        // Prefer `pnpm dlx`, `yarn dlx`, or `bun x`
        if (pkgManager === "pnpm") {
          return "pnpm dlx";
        }
        if (pkgManager === "yarn" && !isYarn1) {
          return "yarn dlx";
        }
        if (pkgManager === "bun") {
          return "bun x";
        }
        // Use `npm exec` in all other cases,
        // including Yarn 1.x and other custom npm clients.
        return "npm exec";
      });

    const [command, ...args] = fullCustomCommand.split(" ");
    //执行命令: npm init vite myapp,然后选择vue下的variants的 custom-nuxt
    //fullCustomCommand ==> npm exec nuxi init TARGET_DIR

    // we replace TARGET_DIR here because targetDir may include a space
    const replacedArgs = args.map((arg) =>
      arg.replace("TARGET_DIR", targetDir)
    );
    const { status } = spawn.sync(command, replacedArgs, {
      stdio: "inherit",
    });
    process.exit(status ?? 0);
  }

  console.log(`\nScaffolding project in ${root}...`);

  /* 19. 获取模板文件夹 */
  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    // nodejs 10.4.0开始支持,浏览器端支持IE11
    "../..",
    `template-${template}`
  );
  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };
  
  /* 20. 读取模板文件夹,并写入非package.json的文件 */
  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => f !== "package.json")) {
    write(file);
  }

  /* 21. 读取对应模板目录下的package.json信息,同时修改package的name信息 */
  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), "utf-8")
  );

  pkg.name = packageName || getProjectName();

  write("package.json", JSON.stringify(pkg, null, 2) + "\n");
  
  /* 22.对react 的swc(babel平替项目,速度快)模板,进行文件依赖替换,以及config文件修改  */
  if (isReactSwc) {
    setupReactSwc(root, template.endsWith("-ts"));
  }

  /* 23.模板已经创建完毕了,下面就是进行一系列提示了  */
  const cdProjectName = path.relative(cwd, root);
  console.log(`\nDone. Now run:\n`);
  if (root !== cwd) {
    console.log(
      `  cd ${
        cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
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

function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, "");
}

function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName
  );
}

function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src);// 获取文件信息
  if (stat.isDirectory()) {//判断是否为文件夹
    copyDir(src, dest);// 执行文件夹复制方法
  } else {
    fs.copyFileSync(src, dest);//文件则执行文件赋值方法
  }
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true });// 则创建文件夹
  for (const file of fs.readdirSync(srcDir)) {// 遍历目录信息,递归操作
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

function isEmpty(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === ".git") {
      continue;
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

function pkgFromUserAgent(userAgent: string | undefined) {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/");
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}

function setupReactSwc(root: string, isTs: boolean) {
  editFile(path.resolve(root, "package.json"), (content) => {
    return content.replace(
      /"@vitejs\/plugin-react": ".+?"/,
      `"@vitejs/plugin-react-swc": "^3.3.2"`
    );
  });
  editFile(
    path.resolve(root, `vite.config.${isTs ? "ts" : "js"}`),
    (content) => {
      return content.replace(
        "@vitejs/plugin-react",
        "@vitejs/plugin-react-swc"
      );
    }
  );
}

function editFile(file: string, callback: (content: string) => string) {
  const content = fs.readFileSync(file, "utf-8");
  fs.writeFileSync(file, callback(content), "utf-8");
}

init().catch((e) => {
  console.error(e);
});
