import { applyMiddleware } from "redux";
import reduxThunk from "redux-thunk";
import { legacy_createStore as createStore, Store, compose } from "redux";
import rootReducer from "./reducer";

// 开启 redux-devtools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// 使用 redux 中间件
const middleWares = applyMiddleware(reduxThunk);

const store: Store = createStore(rootReducer, composeEnhancers(middleWares));

export default store;
