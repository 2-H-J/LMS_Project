import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectRole } from '../store/KakaoSlice';
import { jwtDecode } from 'jwt-decode';
import { saveInfo } from '../store/UsersSlice';
import apiAxios from '../lib/apiAxios';
export default function KaKaoRedirect() {
  const [params] = useSearchParams();
  const role = useSelector(selectRole);
  console.log("code:", params.get("code"));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  console.log(role);
  useEffect(() => {
    apiAxios.get("/kakao/token", {
      params: {
        code: params.get("code"),
        role: role
      }
    }).then(res => {
      if (res.data.flag) {  // flag 값이 true인지 확인
        dispatch(saveInfo(res.data));
        const decodeToken = jwtDecode(res.data.token);
        console.log(decodeToken);
        navigate('/');
      } else {
        alert(res.data.msg);
        navigate('/kakaoRegister', { state: { email: res.data.email, kakaoId: res.data.kakaoId } });
      }
    }).catch(error => {
      console.error("에러 발생:", error);
      navigate('/login');
    });
  }, []);

  return <div>현재 카카오 로그인 중입니다....</div>;
}