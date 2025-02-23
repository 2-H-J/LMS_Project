import { useRef, useState } from "react";
import apiAxios from '../lib/apiAxios';
import ChangePwd from "./ChangePwd";
import '../css/FindPwd.css';

export default function FindPwdPage() {
  const email = useRef(null);
  const inputCode = useRef(null);
  const [isVerified, setIsVerified] = useState(false);
  const [uno, setUno] = useState(null); // uno 저장

  // 이메일 인증번호 전송
  const sendMail = () => {
    apiAxios.post("/mailSend/idAndPwd", { email: email.current.value })
      .then(res => alert(res.data.msg))
      .catch(err => {
        console.error("이메일 전송 오류:", err);
        alert("이메일 전송 실패");
      });
  };

  // 인증번호 확인 및 uno 받아오기
  const checkAuthCode = () => {
    apiAxios.post("/mailCheck/pwd", { email: email.current.value, inputCode: inputCode.current.value })
      .then(res => {
        if (res.data.isMatch) {
          alert(res.data.msg);
          setUno(res.data.uno); // uno 저장
          setIsVerified(true);
        } else {
          alert(res.data.msg);
          setIsVerified(false);
        }
      })
      .catch(err => console.error("인증번호 확인 오류:", err));
  };

  return (
    <div className="emailCheck_container">
      {!isVerified ? ( // 인증 전에는 이메일 입력 화면
        <div className="emailCheck">
          <h2>비밀번호 찾기</h2>
          <div className="form_group1">
          <input ref={email} type="email" placeholder="이메일 입력" />
          <button onClick={sendMail}>인증번호 받기</button>
          </div>
          <div className="form_group2">
          <input ref={inputCode} type="text" placeholder="인증번호 입력" />
          <button onClick={checkAuthCode}>인증하기</button>
          </div>
        </div>
      ) : ( // 인증 후에는 ChangePwd 컴포넌트 렌더링
        <ChangePwd uno={uno} />
      )}
    </div>
  );
}
