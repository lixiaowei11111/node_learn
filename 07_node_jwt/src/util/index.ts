import path from "path";

export const resolve = (dir: string) => path.resolve(process.cwd(), dir);