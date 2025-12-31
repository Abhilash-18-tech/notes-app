import {
  configureStore,
} from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {},
});

export const AppDispatch = store.dispatch;
export const RootState = store.getState;
