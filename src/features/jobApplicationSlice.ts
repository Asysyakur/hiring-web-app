import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "@/lib/supabase";

interface Job {
  id: string;
  name: string;
  title?: string;
  description?: string;
  min_sal?: number;
  max_sal?: number;
  created_at?: string;
  min_profile?: Record<string, "mandatory" | "optional" | "off">;
}

interface ApplicationData {
  user_id: string;
  fullName: string;
  email: string;
  linkedin: string;
  domicile: string;
  pronoun: string;
  dob: string | null;
  phone: string;
  job_id?: string;
  profile_photo?: string;
}

interface ApplicationState {
  job: Job | null;
  loading: boolean;
  error: string | null;
  applicationData: ApplicationData | null;
}

const initialState: ApplicationState = {
  job: null,
  loading: false,
  error: null,
  applicationData: null,
};

// 🔹 Fetch job detail dari Supabase
export const fetchJobById = createAsyncThunk(
  "jobApplication/fetchJobById",
  async (id: string, { rejectWithValue }) => {
    const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single();
    if (error) return rejectWithValue(error.message);
    return data;
  }
);

// 🔹 Submit application ke Supabase
export const submitApplication = createAsyncThunk(
  "jobApplication/submitApplication",
  async (payload: ApplicationData, { rejectWithValue }) => {
    const { data, error } = await supabase.from("applications").insert([payload]).select().single();
    const {data: candidateData, error: candidateError} = await supabase.from("profiles").update({
        full_name: payload.fullName,
        avatar_url: payload.profile_photo,
        email: payload.email,
    }).eq("id", data?.user_id).select().single();
    const {data: candidateAttrData, error: candidateAttrError} = await supabase.from("candidate_attributes").update({
        user_id: payload.user_id,
        domicile: payload.domicile,
        phone: payload.phone,
        pronoun: payload.pronoun,
        linkedin: payload.linkedin,
        dob: payload.dob,
    }).eq("user_id", data?.user_id).select().single();
    if (error) return rejectWithValue(error.message);
    return data;
  }
);

const jobApplicationSlice = createSlice({
  name: "jobApplication",
  initialState,
  reducers: {
    setApplicationData(state, action: PayloadAction<ApplicationData>) {
      state.applicationData = action.payload;
    },
    updateField(state, action: PayloadAction<{ key: keyof ApplicationData; value: any }>) {
      if (!state.applicationData) state.applicationData = {} as ApplicationData;
      (state.applicationData[action.payload.key] as any) = action.payload.value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.job = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch job";
      })
      .addCase(submitApplication.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitApplication.fulfilled, (state) => {
        state.loading = false;
        state.applicationData = null;
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to submit";
      });
  },
});

export const { setApplicationData, updateField } = jobApplicationSlice.actions;
export default jobApplicationSlice.reducer;
