export {}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			[key: string | number]: any // 任意属性
		}
	}
}
