import React from 'react'
import { Link, NavLink } from 'react-router-dom'
const Home: React.FC = () => {
	return (
		<>
			<h3>home</h3>
			<NavLink to='/object'>tabs</NavLink>
			<Link to='/list/1'>detail1</Link>
			<Link to='/list/2'>detail2</Link>
			<Link to='/detail/3'>detail3</Link>
			<Link to='/detail/4?add=2333'>detail4</Link>
		</>
	)
}

export default Home
