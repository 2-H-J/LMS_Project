import { createSlice } from '@reduxjs/toolkit'

export const KakaoSlice = createSlice({
  name: 'kakao',
  initialState: {
    value: {}
  },
  reducers: {
    saveToken: (state, action) => {
      state.value = {...state.value, token: action.payload}
    },
    clearToken: (state) => {
      state.value = {...state.value,token: ''}
    },
    saveState :  (state, action) => {
      state.value = {...state.value, state: action.payload}
    },
    saveRole: (state, action) => {
      state.role = action.payload;
    },
  },
});
// 각 케이스에 대한 리듀서 함수들을 생성
export const { saveToken, clearToken, saveState, saveRole } = KakaoSlice.actions;

export const selectRole = (state) => state.kakao.role;

export default KakaoSlice.reducer