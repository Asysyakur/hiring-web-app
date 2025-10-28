import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import jobsReducerAdmin from "@/features/jobSliceAdmin";
import jobDetailReducer from "@/features/jobDetailSlice";
import jobsReducerCandidate from "@/features/jobSliceCandidate";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    adminJobs: jobsReducerAdmin,
    jobDetails: jobDetailReducer,
    candidateJobs: jobsReducerCandidate,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
