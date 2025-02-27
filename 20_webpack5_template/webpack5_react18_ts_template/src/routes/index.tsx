import React from 'react'
import { Navigate, RouteObject } from 'react-router-dom'
import ErrorBoundary from '@/components/ErrorBoundary'

import App from '../App'
import Home from '@/views/Home'
import Detail from '@/views/Detail'
import List from '@/views/List'
import TabsDetail from '@/views/TabsDetail'
import CustomerDetail from '@/views/TabsDetail/CustomerDetail'
import LeadsDetail from '@/views/TabsDetail/LeadsDetail'
import FileSystemAccessAPITest from '@/views/FileHandle'
import TimeCounter from '@/components/TimeCounter'
// 2. 使用 createBrowserRouter 创建
const router: RouteObject[] = [
	{
		// 根目录 重定向
		path: '/',
		element: <Navigate to='/home'></Navigate>,
		errorElement: <ErrorBoundary />,
	},
	{
		path: '/app',
		element: <App />,
	},
	{
		path: '/home',
		element: <Home />,
	},
	{
		path: '/list/:id',
		element: <List />,
	},
	{
		path: '/detail/:id',
		element: <Detail />,
	},
	{
		path: '/time',
		element: <TimeCounter />,
	},
	{
		path: '/object',
		element: <Navigate to='/object/customer' />, // 嵌套路由重定向 /object中的子路由
	},
	{
		path: '/object',
		element: <TabsDetail />,
		children: [
			{
				// index: true, // 也是类似于默认子路由的功能,不能包含有children属性和path属性
				path: 'customer', // 子组件中, 路由开头 加 "/" 表示绝对路径/customer 不加/ 会自动补上 /object/+"customer"
				element: <CustomerDetail />,
			},
			{
				path: 'leads',
				element: <LeadsDetail />,
			},
			// {
			// 	// 重定向内容, 但是路径还是 /object 而不是 /object/customer
			// 	path: '*', // 不加 / 相当于 /objct/* 类似于重定向默认子路由
			// 	element: <CustomerDetail />,
			// },
		],
	},
	{
		path: '/FileSystemAccessAPI',
		caseSensitive: true,
		element: <FileSystemAccessAPITest />,
	},
	{
		path: '*',
		element: <Detail />,
	},
]
// const extraRouteInfo: RouteObject = {
// 	loader: null,
// 	action: null,
// 	children: null,
// 	errorElement: <ErrorBoundary />,
// }

// const tempRouter = router.map(v => ({ ...v,  }))
// console.log(tempRouter, 'tempRouter')

export default router
