import * as React from "react";
import * as ReactDOM from "react-dom";

import {
  Store,
  createStore,
} from "redux";
import {Provider} from "react-redux";
import {rootReducer} from "./reducers/rootReducer";

import App from "./containers/app";
// import { rootReducer } from './reducers/rootReducer';

const initialState = {};

const store: Store = createStore(rootReducer, initialState);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
