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
  appliedJobs: string[]; // array of job IDs the candidate has applied to
  loading: boolean;
  error: string | null;
}

const initialState: JobState = {
  jobs: [],
  appliedJobs: [],
  loading: false,
  error: null,
};

// 🔥 1️⃣ Fetch all jobs (with company join)
export const fetchCandidateJobs = createAsyncThunk("jobs/fetchCandidateJobs", async () => {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, company: company_attributes(id, name, location, logo)");
  if (error) throw error;
  return data || [];
});

// 🔥 2️⃣ Fetch jobs that user already applied to
export const fetchAppliedJobs = createAsyncThunk("jobs/fetchAppliedJobs", async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return [];

  const { data, error } = await supabase
    .from("applications")
    .select("job_id")
    .eq("user_id", user.id);

  if (error) throw error;
  return data.map((d) => d.job_id);
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
      // Fetch jobs
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
      })

      // Fetch applied jobs
      .addCase(fetchAppliedJobs.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.appliedJobs = action.payload;
      });

  },
});

export const { clearJobs } = candidateJobSlice.actions;
export default candidateJobSlice.reducer;
