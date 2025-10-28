import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";

export const fetchJobDetail = createAsyncThunk(
  "jobDetail/fetchJobDetail",
  async (jobId: string) => {
    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();
    if (jobError) throw jobError;

    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select("*")
      .eq("job_id", jobId);
    if (appsError) throw appsError;

    return { job: jobData, candidates: applications ?? [] };
  }
);

interface JobDetailState {
  job: any | null;
  candidates: any[];
  loading: boolean;
  error: string | null;
}

const initialState: JobDetailState = {
  job: null,
  candidates: [],
  loading: false,
  error: null,
};

const jobDetailSlice = createSlice({
  name: "jobDetail",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.job = action.payload.job;
        state.candidates = action.payload.candidates;
      })
      .addCase(fetchJobDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load job detail.";
      });
  },
});

export default jobDetailSlice.reducer;
