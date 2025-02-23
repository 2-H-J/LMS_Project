import { useRef, useState } from "react";
import apiAxios from '../lib/apiAxios';
import '../css/FindId.css';
import { useNavigate } from "react-router-dom";

export default function FindIdPage() {
  const email = useRef(null);
  const inputCode = useRef(null);
  const [isVerified, setIsVerified] = useState(false);
  const [maskedId, setMaskedId] = useState("");
  const navigate = useNavigate();

  // 이메일 인증번호 전송
  const sendMail = () => {
    const data = { email: email.current.value };
    apiAxios.post("/mailSend/idAndPwd", data)
      .then(res => {
        alert(res.data.msg);
      })
      .catch(err => {
        console.error("이메일 전송 오류:", err);
        alert("이메일 전송 실패");
      });
  };

  // 인증번호 확인 및 아이디 찾기
  const checkAuthCode = () => {
    const data = { email: email.current.value, inputCode: inputCode.current.value };
    apiAxios.post("/mailCheck/id", data)
      .then(res => {
        if (res.data.isMatch) {
          alert(res.data.msg);
          setMaskedId(res.data.maskedId); // 서버에서 가려진 ID 반환
          setIsVerified(true);
        } else {
          alert(res.data.msg);
          setIsVerified(false);
        }
      })
      .catch(err => {
        console.error("인증번호 확인 오류:", err);
      });
  };

  return (
    <div className="emailCheck_container">
      <div className="emailCheck">
      <h2>아이디 찾기</h2>
      <input ref={email} type="email" placeholder="이메일 입력" />
      <button onClick={sendMail}>인증번호 받기</button>

      <input ref={inputCode} type="text" placeholder="인증번호 입력" />
      <button onClick={checkAuthCode}>인증하기</button>

      <h3 className="id_result">당신의 아이디: {isVerified && maskedId}</h3>
      <button onClick={() => navigate("/login")}>로그인</button><button onClick={() => navigate("/find/pwd")}>비밀번호 찾기</button>
      </div>
    </div>
  );
}
