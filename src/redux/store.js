// src/redux/store.js
import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { combineReducers } from 'redux';

import baseReducer from './reducer'; // Your root reducer

const rootReducer = combineReducers({
    // Add other reducers here if needed
    base: baseReducer, // Here, "counter" is the key for the persisted reducer
  });

const persistConfig = {
  key: 'root',
  storage,
  // Add any reducers that you want to persist to the "whitelist" array
  whitelist: ['base'], // Replace 'someReducer' with the name of the reducer you want to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(persistedReducer, applyMiddleware(/* add any middleware you need */));
const persistor = persistStore(store);

export { store, persistor };
