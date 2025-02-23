import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/UpdatePassword.css";

export default function UpdatePassword() {
  const newpwRef = useRef(null);
  const checkNewpwRef = useRef(null);
  const token = useSelector((state) => state.users.value.token);
  const navigator = useNavigate();
  const [isMatch, setIsMatch] = useState(false);

  // 입력 값이 변경될 때마다 두 비밀번호의 일치 여부를 검사
  const checkMatch = () => {
    const newpw = newpwRef.current.value;
    const checkNewpw = checkNewpwRef.current.value;
    // newpw가 빈 문자열이 아니면서 일치할 경우 true
    setIsMatch(newpw !== "" && newpw === checkNewpw);
  };

  const updatepwhandle = () => {
    const newpw = newpwRef.current.value;
    const checkNewpw = checkNewpwRef.current.value;
    if (newpw === checkNewpw) {
      const data = { newpassword: newpw };
      axios
        .post("http://localhost:9999/UpdatePassword", data, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          alert(res.data.msg);
          navigator("/mypage");
        })
        .catch((err) => {
          console.error(err);
          alert("비밀번호 변경 중 오류가 발생했습니다.");
        });
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <div className="updatepw-container">
      <div className="updatepw">
        <h1>비밀번호 변경</h1>
        <ul>
          <li><span className="bold">안전한 비밀번호로 내정보를 보호</span>하세요</li>
          <li>다른 아이디/사이트에서 사용한 적 없는 비밀번호</li>
          <li>이전에 사용한 적 없는 비밀번호가 안전합니다.</li>
        </ul>
  
        <span className="pw">비밀번호 (숫자, 영문으로 이루어진 6~15자)</span>
        <input
          className="newpw"
          type="password"
          placeholder=""
          onChange={checkMatch}
          ref={newpwRef}
        />
  
        <span className="pw">비밀번호 확인</span>
        <input
          className="checkNewpw"
          type="password"
          placeholder=""
          onChange={checkMatch}
          ref={checkNewpwRef}
        />
  
        {isMatch ? (
          <span style={{ color: "#2e7d32" }} className="isMatch">비밀번호가 일치합니다.</span>
        ) : (
          <span style={{ color: "#d32f2f" }} className="nonMatch">비밀번호가 일치하지 않습니다.</span>
        )}
  
        {/* 버튼 영역을 묶어서 정렬 제어 */}
        <div className="btn-group">
          <button className="update-button" onClick={updatepwhandle}>
            변경하기
          </button>
          <button className="cancel-button">
            변경취소
          </button>
        </div>
      </div>
    </div>
  );
  
}