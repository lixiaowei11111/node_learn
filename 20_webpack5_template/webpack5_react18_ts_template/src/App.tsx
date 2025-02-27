// App.tsx

import React from 'react'
import { useParams } from 'react-router-dom'

import { AppContext } from './components/AppContext'
import '@/styles/theme.scss'

const App = () => {
	const params = useParams()
	console.log(params, 'useParams()')

	// const ybb: string = 131

	return (
		<div className='app'>
			<span style={{ color: '#bfa' }}>12312312331</span>
			<AppContext></AppContext>
		</div>
	)
}

export default App
