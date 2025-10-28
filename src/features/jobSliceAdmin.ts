import { createSlice, createAsyncThunk  } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";


export const fetchJobsAdmin = createAsyncThunk("jobs/fetchAdminJobs", async () => {
  const { data, error } = await supabase.from("jobs").select("*");
  if (error) throw error;
  return data;
});

const jobSliceAdmin = createSlice({
  name: "jobs",
  initialState: {
    jobs: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobsAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch jobs";
      });
  },
});

export default jobSliceAdmin.reducer;
