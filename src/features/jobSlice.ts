import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Job {
  id: number
  title: string
  status: string
}

interface JobState {
  list: Job[]
  loading: boolean
}

const initialState: JobState = {
  list: [],
  loading: false,
}

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<Job[]>) => {
      state.list = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setJobs, setLoading } = jobSlice.actions
export default jobSlice.reducer
