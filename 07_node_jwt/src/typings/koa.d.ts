import { DefaultContext } from 'koa';

declare module 'koa' {
  interface DefaultContext {
    request: DefaultContext['request'] & {
      body?: any;
    };
  }
}