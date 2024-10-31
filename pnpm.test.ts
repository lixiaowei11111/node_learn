import {add} from "03_pnpm_workspaces_demo1";
import {multiply} from "04_pnpm_workspaces_demo2";
import { div } from "monorepo_submodule";

const result = add(1,2);
console.log('[debug] result', result);

const result2 = multiply(1,2);
console.log('[debug] result2', result2);

const result3 = div(1,2);
console.log('[debug] result3', result3);

/**
 
```bash
bun run pnpm.test.ts
[debug] result 3
[debug] result 3
[debug] result2 2
[debug] result3 0.5
```
*/