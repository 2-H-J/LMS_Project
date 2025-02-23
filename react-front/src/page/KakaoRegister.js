import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/KakaoRegister.css";
import apiAxios from "../lib/apiAxios";
import { clearInfo, saveInfo } from "../store/UsersSlice";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";

export default function Register() {
  const location = useLocation();
  const { email, kakaoId } = location.state || {}; // state에서 email과 kakaoId 가져오기
  const username = useRef(null);
  const nickname = useRef(null);
  const phone = useRef(null);
  const [role, setRole] = useState("student");
  const [nicknameDuplicate, setNicknameDuplicate] = useState(false);
  const [nicknameValid, setNicknameValid] = useState(true); // 닉네임 유효성 상태
  const navigate = useNavigate();
  const dispatch = useDispatch();
  //닉네임 정규식
  const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/;

  // 닉네임 중복 체크 (POST 방식)
  const checkNicknameDuplicate = () => {
    apiAxios.post("/check/nickname", { nickname: nickname.current.value }).then((res) => {
      if (res.data) {
        alert("중복된 닉네임 입니다. 다른 닉네임을 사용해주세요.");
        setNicknameDuplicate(true);
      } else {
        alert("사용가능한 닉네임입니다.");
        setNicknameDuplicate(false);
      }
    }).catch((err) => console.log(err));
  };
  //닉네임 유효성 검사
  const checkNickname = () => {
    if (!nicknameRegex.test(nickname.current.value)) {
      setNicknameValid(false);
      return false;
    }
    setNicknameValid(true);
    return true;
  }
  const register = () => {
    if (nicknameDuplicate) {
      alert("닉네임이 중복되었습니다. 다른 닉네임을 입력해주세요.");
      return;
    }
    apiAxios
      .post("/kakao/register", {
        name: username.current.value,
        nickname: nickname.current.value,
        email: email,
        phone: phone.current.value,
        role: role,
        kakaoId: kakaoId,
      })
      .then((res) => {
        dispatch(saveInfo(res.data));
        const decodeToken = jwtDecode(res.data.token);
        console.log(decodeToken);
        navigate('/');
      })
      .catch((err) => console.log(err));
  };

  const cancel = () => {
    navigate("/login");
    dispatch(clearInfo());
  };

  return (
    <div className="kakao-register">
      <div className="register_container">
        <h2>수강생 또는 강사로 회원가입 후 서비스를 이용하세요.</h2>
        <div className="role-switch">
          <button
            className={`role-btn ${role === "student" ? "active" : ""}`}
            onClick={() => setRole("student")}
          >
            수강생
          </button>
          <button
            className={`role-btn ${role === "teacher" ? "active" : ""}`}
            onClick={() => setRole("teacher")}
          >
            강사
          </button>
        </div>
        <div className="right_container">
          <div className="form-group">
            <label>이름 *</label>
            <input type="text" ref={username} required />
          </div>
          <div className="form-group">
            <label>닉네임 (특수문자를 제외한 2~10자를 입력해주세요.) * <button type="button" className="check-duplicate-btn" onClick={checkNicknameDuplicate}>
              닉네임 중복 확인
            </button></label>
            <input type="text" ref={nickname}
              onBlur={checkNickname}
            />
            {!nicknameValid && <p className="error-message">닉네임을 다시 입력해주세요.</p>}
            {nicknameDuplicate && <p className="error-message">닉네임이 이미 존재합니다.</p>}
          </div>
          <div className="form-group">
            <label>이메일 *</label>
            <input type="email" value={email} readOnly /> {/* 이메일 수정 불가능 */}
          </div>
          <div className="form-group">
            <label>전화번호 *</label>
            <input
              type="text"
              ref={phone}
              placeholder="'-'를 제외하고 숫자만 입력해주세요."
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 11); // 숫자만 입력 & 11자리 제한
              }}
            />
          </div>
          <input type="hidden" value={kakaoId} /> {/* 카카오 ID 숨김 처리 */}
          <p className="required-note">* 표시는 필수 입력입니다.</p>
          <button type="button" className="submit-btn" onClick={register}>
            회원가입
          </button>
          <button type="button" className="cancel-btn" onClick={cancel}>
            취소
          </button>
        </div>
        <div className="btn-container">

        </div>
      </div>
    </div>
  );
}
