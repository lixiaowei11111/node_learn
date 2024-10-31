import {add} from '03_pnpm_workspaces_demo1';

const result = add(1,2);
console.log('[debug] result', result);

export const multiply = (a:number, b:number) => {
  return a*b;
}