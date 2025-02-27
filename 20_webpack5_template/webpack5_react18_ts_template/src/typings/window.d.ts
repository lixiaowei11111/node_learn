import { compose } from 'redux'

declare global {
	interface Window {
		__REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof compose
		showOpenFilePicker(options?: any): Promise<any>
	}
}
export {}
