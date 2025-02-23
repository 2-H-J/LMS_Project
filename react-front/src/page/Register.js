import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Register.css";
import apiAxios from "../lib/apiAxios";

export default function Register() {
  const id = useRef(null);
  const password = useRef(null);
  const checkPwd = useRef(null);
  const username = useRef(null);
  const nickname = useRef(null);
  const email = useRef(null);
  const phone = useRef(null);
  const inputCode = useRef(null);

  const [role, setRole] = useState("student");
  const [idValid, setIdValid] = useState(true); // 아이디 유효성 상태
  const [passwordValid, setPasswordValid] = useState(true); // 비밀번호 유효성 상태
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(true); // 비밀번호 확인 유효성 상태
  const [idDuplicate, setIdDuplicate] = useState(false); // 아이디 중복 여부
  const [nicknameDuplicate, setNicknameDuplicate] = useState(false); // 닉네임 중복 여부
  const [nicknameValid, setNicknameValid] = useState(true); // 닉네임 유효성 상태
  const [emailValid, setEmailValid] = useState(false); // 이메일 인증 상태
  const [checkEmailValid, setCheckEmailValid] = useState(true); // 이메일 유효성 상태
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 아이디 정규식 (영문, 숫자만 허용, 길이 6~15)
  const idRegex = /^[a-zA-Z0-9]{6,15}$/;
  // 비밀번호 정규식 (영문, 숫자, 특수문자 허용, 길이 6~15)
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/-]).{6,15}$/;
  //닉네임 정규식
  const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/;
  //이메일 정규식
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // 아이디 유효성 검사
  const checkId = () => {
    if (!idRegex.test(id.current.value)) {
      setIdValid(false);
      return false;
    }
    setIdValid(true);
    return true;
  };

  // 비밀번호 유효성 검사
  const checkPassword = () => {
    if (!passwordRegex.test(password.current.value)) {
      setPasswordValid(false);
      return false;
    }
    setPasswordValid(true);
    return true;
  };

  // 비밀번호 확인 검사
  const checkConfirmPassword = () => {
    if (password.current.value !== checkPwd.current.value) {
      setConfirmPasswordValid(false);
      return false;
    }
    setConfirmPasswordValid(true);
    return true;
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

  //이메일 유효성 검사
  const checkEmail = () => {
    if (!emailRegex.test(email.current.value)) {
      setCheckEmailValid(false);
      return false;
    }
    setCheckEmailValid(true);
    return true;
  }

  // 아이디 중복 체크
  const checkIdDuplicate = () => {
    if (!checkId()) { alert("아이디를 다시 입력해주세요"); return; }
    apiAxios.post("/check/id", { id: id.current.value })
      .then((res) => {
        if (res.data) {
          alert("중복된 아이디입니다. 다른 아이디를 사용해주세요.");
          setIdDuplicate(true);
        } else {
          alert("사용가능한 아이디입니다.");
          setIdDuplicate(false);
        }
      })
      .catch((err) => {
        console.error("아이디 중복 체크 오류:", err);
        alert("아이디 중복 체크에 실패했습니다.");
      });
  };

  // 닉네임 중복 체크
  const checkNicknameDuplicate = () => {
    if (!checkNickname()) { return; }
    apiAxios.post("/check/nickname", { nickname: nickname.current.value })
      .then((res) => {
        if (res.data) {
          alert("중복된 닉네임입니다. 다른 닉네임을 사용해주세요.");
          setNicknameDuplicate(true);
        } else {
          alert("사용가능한 닉네임입니다.");
          setNicknameDuplicate(false);
        }
      })
      .catch((err) => {
        console.error("닉네임 중복 체크 오류:", err);
        alert("닉네임 중복 체크에 실패했습니다.");
      });
  };

  // 이메일 인증번호 전송
  const sendMail = () => {
    if (!checkEmail()) { return; }
    const data = { email: email.current.value };
    apiAxios.post('/mailSend', data)
      .then(res => {
        alert(res.data.msg);
      })
      .catch(err => {
        console.error("이메일 전송 오류:", err);
        alert("이메일 전송 실패");
      });
  };

  // 인증번호 확인
  const checkAuthCode = () => {
    const data = { email: email.current.value, inputCode: inputCode.current.value };
    apiAxios.post('/mailCheck', data)
      .then(res => {
        if (res.data) {
          alert(res.data.msg);
          setEmailValid(true); // 인증 성공 시 이메일 인증 상태 업데이트
        } else {
          alert(res.data.msg);
          setEmailValid(false);
        }
      })
      .catch(err => {
        console.error("인증번호 확인 오류:", err);
        alert("인증번호 확인 실패");
      });
  };

  // 유효성 검사 후 폼 제출 가능 여부 판단
  const validateForm = () => {
    const isValidId = checkId();
    const isValidPassword = checkPassword();
    const isValidConfirmPassword = checkConfirmPassword();

    return isValidId && isValidPassword && isValidConfirmPassword && !idDuplicate && !nicknameDuplicate && emailValid;
  };
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState); // 비밀번호 보이기/숨기기 토글
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prevState) => !prevState); // 확인 비밀번호 보이기/숨기기 토글
  };
  // 회원가입
  const register = () => {
    if (!validateForm()) {
      alert("입력한 정보를 확인해주세요.");
      return;
    }
    apiAxios.post("/register", {
      id: id.current.value,
      password: password.current.value,
      username: username.current.value,
      nickname: nickname.current.value,
      email: email.current.value,
      phone: phone.current.value,
      role: role,
    })
      .then((res) => {
        if (res.data.count !== 0) {
          alert(res.data.msg);
          navigate("/login");
        }
      })
      .catch((err) => {
        console.error("회원가입 오류:", err);
        alert("회원가입에 실패했습니다.");
      });
  };

  // 취소 버튼
  const cancel = () => {
    navigate(-1);
  };

  return (
    <div className="register">
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
        <form id="signupForm">
          <div className="left_container">
            <div className="form-group">
              <label>아이디 (숫자, 영문으로 이루어진 6~15자) * <button type="button" className="check-duplicate-btn" onClick={checkIdDuplicate}>
                아이디 중복 확인
              </button></label>
              <input
                type="text"
                ref={id}
                required
                onBlur={checkId}
              />
              {!idValid && <p className="error-message">아이디는 영문과 숫자로 이루어진 6~15자여야 합니다.</p>}
              {idDuplicate && <p className="error-message">아이디가 이미 존재합니다.</p>}
            </div>
            <div className="form-group">
              <label>닉네임 (특수문자를 제외한 2~10자를 입력해주세요.)* <button type="button" className="check-duplicate-btn" onClick={checkNicknameDuplicate}>
                닉네임 중복 확인
              </button></label>
              <input type="text" ref={nickname}
                onBlur={checkNickname}
              />
              {!nicknameValid && <p className="error-message">닉네임을 다시 입력해주세요.</p>}
              {nicknameDuplicate && <p className="error-message">닉네임이 이미 존재합니다.</p>}
            </div>
            <div className="form-group">
              <label>비밀번호 (영문, 숫자, 특수문자 포함 6~15자) *</label>
              <div className='password'>
              <input
                type={showPassword ? "text" : "password"}
                ref={password}
                required
                onBlur={checkPassword}
              />
              <span className="password-toggle" onClick={togglePasswordVisibility}>
                <img
                  src={showPassword ? '/img/eye-opened.png' : '/img/eye-closed.png'}
                  alt="비밀번호 보이기/숨기기"
                />
              </span>
              </div>
              {!passwordValid && <p className="error-message">비밀번호는 영문, 숫자, 특수문자 포함 6~15자여야 합니다.</p>}
            </div>
            <div className="form-group">
              <label>비밀번호 확인 *</label>
              <div className='password'>
              <input
                type={showConfirmPassword ? "text" : "password"}
                ref={checkPwd}
                required
                onBlur={checkConfirmPassword}
              />
              <span className="password-toggle" onClick={toggleConfirmPasswordVisibility}>
                <img
                  src={showConfirmPassword ? '/img/eye-opened.png' : '/img/eye-closed.png'}
                  alt="비밀번호 확인 보이기/숨기기"
                />
              </span>
            </div>
              {!confirmPasswordValid && <p className="error-message">비밀번호가 일치하지 않습니다.</p>}
            </div>
          </div>
          <div className="right_container">
            <div className="form-group">
              <label>이름 *</label>
              <input type="text" ref={username} required />
            </div>

            <div className="form-group">
              <label>이메일 * <button type="button" className="check-duplicate-btn" onClick={sendMail}>
                인증번호 전송
              </button></label>
              <input
                type="email"
                ref={email}
                placeholder="이메일을 입력해주세요."
                required
                onBlur={checkEmail}
              />
              {!checkEmailValid && <p className="error-message">잘못된 형식입니다.</p>}
            </div>
            <div className="form-group">
              <label>인증번호 * <button type="button" className="check-duplicate-btn" onClick={checkAuthCode}>
                인증번호 확인
              </button></label>
              <input
                type="text"
                ref={inputCode}
                placeholder="인증번호를 입력해주세요."
                required
              />
            </div>
            <div className="form-group">
              <label>전화번호 </label>
              <input
                type="text"
                ref={phone}
                placeholder="'-'를 제외하고 숫자만 입력해주세요."
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 11); // 숫자만 입력 & 11자리 제한
                }}
              />
            </div>
          </div>
          <p className="required-note">* 표시는 필수 입력입니다.</p>
          <div className="register-btn-container">
            <button type="button" className="submit-btn" onClick={register}>
              회원가입
            </button>
            <button type="button" className="cancel-btn" onClick={cancel}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}