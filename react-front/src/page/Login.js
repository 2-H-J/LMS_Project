import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveInfo } from '../store/UsersSlice';
import { jwtDecode } from 'jwt-decode';
import apiAxios from '../lib/apiAxios';
import '../css/Login.css';
import KakaoLogin from '../components/KakaoLogin';

export default function Login() {
  const id = useRef(null);
  const pwd = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);


  const loginHandler = () => {
    const data = {
      id : id.current.value,
      passwd : pwd.current.value
    }
    apiAxios.post('/users/login', data)
    .then(res => {
      console.log(res.data);
      //로그인 성공하면 Home으로 이동
      //redux에 로그인 정보 저장
      if(res.data.flag){
        dispatch(saveInfo(res.data));
        const decodeToken = jwtDecode(res.data.token);
        console.log(decodeToken);
        navigate('/');
        id.current.value = "";
        pwd.current.value = "";
      }else{
        //실패하면 경고창 출력
        alert('아이디와 비밀번호를 확인하세요');
      }

    }).catch(err => {
      console.log(err);
    });
  }
  
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState); 
  };

  return (
    <div className="login_container" >
      <div className="login_logo_container" >
        <h1 className='login_title'>환영합니다!</h1>
      </div>
      <div className="login_form_container">
      <p className='login_desc'><span style={{fontWeight: 'bold'}}>로그인</span>하여<br/> 다양한 서비스를 즐겨보세요.</p>
      <div className="login-form">
        <input type="text" ref={id} placeholder="아이디를 입력해주세요" />
        <div className='password'>
        <input type={showPassword ? "text" : "password"} ref={pwd} placeholder="비밀번호를 입력해주세요" />
        <span className="password-toggle"> 
        <img
              src={showPassword ? '/img/eye-closed.png' : '/img/eye-opened.png'}
              onClick={togglePasswordVisibility}
              alt='비밀번호 숨김/보임'
            />
        </span>
        </div>
        <p><a href="/find/id" className='find_pwd'>아이디</a> 혹은 <a href="/find/pwd" className='find_pwd'>비밀번호</a>를 잊으셨나요?</p>
        <button type="button" className='login_btn' onClick={loginHandler}>로그인</button> 
        <button type="button" className='register_btn' onClick={() => navigate('/register')}>회원가입</button>
        <KakaoLogin />
        </div>
      </div>
    </div>

  );
}