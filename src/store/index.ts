import { configureStore } from "@reduxjs/toolkit";
import roleReducer from "@/features/roleSlice";
import jobReducer from "@/features/jobSlice";

export const store = configureStore({
  reducer: {
    role: roleReducer,
    job: jobReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
