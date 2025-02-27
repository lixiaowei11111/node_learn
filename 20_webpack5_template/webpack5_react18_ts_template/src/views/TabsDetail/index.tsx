// data router nesting

import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'

const TabsDetail: React.FC = () => {
	return (
		<>
			<div>
				<div>tabs</div>
				<NavLink to='leads'>Leads</NavLink>
				<NavLink to='customer'>Customer</NavLink>
			</div>
			<Outlet></Outlet>
		</>
	)
}

export default TabsDetail
