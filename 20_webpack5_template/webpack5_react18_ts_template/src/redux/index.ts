import { legacy_createStore as createStore, combineReducers, Store, compose } from 'redux'
import { applyMiddleware } from 'redux'
import reduxThunk from 'redux-thunk'
const reducer = combineReducers({})

// 开启 redux-devtools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

// 使用 redux 中间件
const middleWares = applyMiddleware(reduxThunk)

const store: Store = createStore(reducer, composeEnhancers(middleWares))

export default store
