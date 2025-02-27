import React from 'react'
import { Button } from 'antd'

export default function FileSystemAccessAPITest() {
	const showOpenFilePicker = async() => {
		try {
			const [fileHandle] = await window.showOpenFilePicker()
			console.log(fileHandle)

			const file = await fileHandle.getFile()
			console.log(fileHandle, file)
		} catch (error) {
			console.log(error)
		}
	}
	return (
		<>
			<Button onClick={showOpenFilePicker}>showOpenFilePicker</Button>
		</>
	)
}
