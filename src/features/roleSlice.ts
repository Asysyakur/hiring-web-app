import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "admin" | "candidate" | null;

interface RoleState {
  role: UserRole;
}

const initialState: RoleState = {
  role: null,
};

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<UserRole>) => {
      state.role = action.payload;
    },
  },
});

export const { setRole } = roleSlice.actions;
export default roleSlice.reducer;
