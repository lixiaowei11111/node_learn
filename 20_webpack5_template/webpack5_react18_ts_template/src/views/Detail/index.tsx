import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

const Detail: React.FC = () => {
	const [msg] = useState('默认')
	const params = useParams()
	const [searchParams] = useSearchParams()
	useEffect(() => {
		console.log(params, ' detail useParams')
		console.log(searchParams.get('add'), ' detail useSearchParams')
	})
	return (
		<>
			<div>{msg}</div>
		</>
	)
}

export default Detail
