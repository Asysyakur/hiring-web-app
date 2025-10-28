import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";

interface Job {
  id: string;
  name: string;
  desc?: string;
  type?: string;
  min_sal?: number;
  max_sal?: number;
  company?: {
    id: string;
    name: string;
    location: string;
    logo: string;
  };
}

interface JobState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
}

const initialState: JobState = {
  jobs: [],
  loading: false,
  error: null,
};

// 🔥 Candidate Fetch Jobs with company join
export const fetchCandidateJobs = createAsyncThunk("jobs/fetchCandidateJobs", async () => {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, company: company_attributes(id, name, location, logo)");
  if (error) throw error;
  return data || [];
});

const candidateJobSlice = createSlice({
  name: "candidateJobs",
  initialState,
  reducers: {
    clearJobs: (state) => {
      state.jobs = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidateJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidateJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchCandidateJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch candidate jobs";
      });
  },
});

export const { clearJobs } = candidateJobSlice.actions;
export default candidateJobSlice.reducer;
