import { createSlice } from '@reduxjs/toolkit';

export const UsersSlice = createSlice({
  name: 'users',
  initialState: {
    value: {}
  },
  reducers: {
    saveInfo: (state, action) => {
      state.value = { ...action.payload };
      console.log("saveInfo", state.value);
    },
    clearInfo: (state) => {
      state.value = {};
      console.log("clearInfo", state.value);
    }
  }
});
//각 케이스에 대한 리듀서 함수들을 생성
export const { saveInfo, clearInfo } = UsersSlice.actions;
export default UsersSlice.reducer;