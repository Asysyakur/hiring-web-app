import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";

export const fetchJobsAdmin = createAsyncThunk(
  "jobs/fetchAdminJobs",
  async (userId: string) => {
    // Ambil company yang dimiliki user
    const { data: company, error: companyError } = await supabase
      .from("company_attributes")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (companyError) throw companyError;
    if (!company) throw new Error("Company not found for this user");

    // Ambil jobs yang punya company_id itu
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .eq("company_id", company.id);

    if (jobsError) throw jobsError;

    return jobs;
  }
);

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
