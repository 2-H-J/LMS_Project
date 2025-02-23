import { React, useEffect, useState, useRef } from "react";
import "../css/MypageInfo.css";
import { useSelector } from "react-redux";
import axios from "axios";
import defaultImg from "../img/defaultImg.png";
import { Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

export default function MypageInfo() {
  const [profileImage, setProfileImage] = useState(""); // 현재 프로필 이미지
  const [selectedFile, setSelectedFile] = useState(null); // 선택한 파일
  const [isUploadEnabled, setIsUploadEnabled] = useState(false); // 업로드 버튼 활성화 여부
  const token = useSelector((state) => state.users.value.token);
  const [userInfo, setUserInfo] = useState({});
  const [dataRoad, setDataRoad] = useState(true);
  const [type, setType] = useState(null);
  const [originInfo, setOriginInfo] = useState({});
  const inputRefs = useRef({});
  const fieldOrder = [
    { key: "name", label: "이름" },
    { key: "nickname", label: "닉네임" },
    { key: "email", label: "이메일" },
    { key: "phone", label: "전화번호" }
  ];
  const [updateToggle, setUpdateToggle] = useState(
    {
      name: false,
      nickname: false,
      email: false,
      phone: false
    }
  );

  useEffect(() => {
    if (!token) {
      console.error("토큰이 없습니다.");
      return;
    }

    const decodedToken = jwtDecode(token);
    setType(decodedToken.type);

    // 사용자 정보 가져오기
    axios
      .post(
        "http://localhost:9999/MypageInfo",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setUserInfo(res.data);
        setOriginInfo(res.data);
      })
      .catch((err) => console.error("요청 에러:", err));

    // 프로필 이미지 가져오기 (Base64 대신 URL 반환)
    axios
      .get(
        "http://localhost:9999/GetUserProfile",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        console.log("서버 응답:", res.data);
        setProfileImage(res.data.profileImg);
      })
      .catch((err) => console.error("요청 에러:", err));
  }, [dataRoad]);

  // 파일 선택 시 미리보기 표시
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setIsUploadEnabled(true); // 업로드 버튼 활성화

      // 파일 미리보기 설정
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 파일 업로드 요청
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("업로드할 파일을 선택하세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post("http://localhost:9999/UpdateUserProfile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("업로드 성공:", res.data);

      if (res.data.profileImg && res.data.profileImg !== "non") {
        setProfileImage(res.data.profileImg);
    } else {
        setProfileImage("/default-profile.png"); // 기본 이미지 설정
    }
  
      setIsUploadEnabled(false);
      alert("프로필 사진이 변경되었습니다.");
      setDataRoad(!dataRoad);
    } catch (error) {
      console.error("파일 업로드 에러:", error);
      alert("파일 업로드에 실패했습니다.");
    }
  };

  const handleFileRemove = async () => {
    axios.post(
      "http://localhost:9999/UpdateUserProfile",
      new FormData(),
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    axios
      .get(
        "http://localhost:9999/GetUserProfile",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        console.log("서버 응답:", res.data);
      })
      .catch((err) => console.error("요청 에러:", err));

    alert("프로필 사진이 삭제되었습니다.");
  };

  const updatehandle = async () => {
    const updatedData = {};

    // 변경된 값만 저장
    Object.keys(updateToggle).forEach((key) => {
      if (updateToggle[key]) {
        updatedData[key] = inputRefs.current[key]?.value;
      }
    });

    if (Object.keys(updatedData).length === 0) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    if (updatedData.email) {
      // '@'가 포함되어 있고 '.com'으로 끝나는지 확인
      if (!updatedData.email.includes("@") || !updatedData.email.endsWith(".com")) {
        alert("이메일 형식이 정상적이지 않습니다.");
        return;
      }
    }

    if (updatedData.phone) {
      // 정규식을 이용해 숫자 11자리인지 확인
      if (!/^\d{11}$/.test(updatedData.phone)) {
        alert("전화번호는 11자리 숫자만 입력 가능합니다.");
        return;
      }
    }

    console.log("전송할 데이터:", updatedData);

    try {
      const res = await axios.patch("http://localhost:9999/Updateuserinfo", updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(res.data);
      if (res.data) {
        alert("정보 변경 완료");
        window.location.reload();
      }

      // 업데이트 완료 후 최신 데이터 불러오기
      setDataRoad((prev) => !prev);
    } catch (error) {
      console.error("업데이트 실패:", error);
    }
  };



  const toggleEditMode = (e) => {
    const buttonId = e.target.className.split("-")[0];
    // console.log("버튼 ID:", buttonId);

    if (e.target.className.includes("update")) {
      setUserInfo(prev => ({
        ...prev,
        [buttonId]: originInfo[buttonId]
      }));
    }

    setUpdateToggle(prevState => ({
      ...prevState,
      [buttonId]: !prevState[buttonId]
    }));
  };

  const changeValue = (e) => {
    const { id, value } = e.target;
    
    // phone 필드라면 입력값을 숫자 11자리로만 제한
    if (id === "phone") {
      // 숫자 이외의 문자 제거
      let onlyNumber = value.replace(/[^0-9]/g, "");
      // 길이를 11자리까지만 허용
      if (onlyNumber.length > 11) {
        onlyNumber = onlyNumber.slice(0, 11);
      }
  
      setUserInfo((prev) => ({
        ...prev,
        [id]: onlyNumber,
      }));
    } else {
      // phone이 아닌 다른 필드는 기존 로직대로
      setUserInfo((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };
  

  const tokenlenth = () => {
    const decodedToken = jwtDecode(token);
    console.log("decodedToken : ", decodedToken);
    console.log(" token length : ",token.length);
  }

  return (
    <div className="mypage-container">
      <div className="profile-section">
        <label htmlFor="fileInput">
          <img
            src={profileImage || defaultImg}
            alt="프로필 이미지"
            className="profile-image"
          />
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="fileInput"
        />
        <h1>
          {userInfo.name} <br></br>{userInfo.grade === 1 ? "강사" : "수강생"}님
        </h1>
        {/* 프로필 사진 변경 버튼 */}
        <div className="profile-buttons">
          <button
            className="profile-button"
            onClick={handleUpload}
            disabled={!isUploadEnabled}>
            {isUploadEnabled ? "프로필 사진 변경" : "프로필 사진 추가"}
          </button>
          <button className="removeprofile-button" onClick={handleFileRemove}>
            프로필 삭제하기
          </button>
        </div>
      </div>
      <div className="divider"></div>

      <div className="info-section">
        <h1>마이페이지</h1>
        {fieldOrder.map(({ key, label }) => (
          userInfo[key] !== undefined && (
            <div className={`info-${key}`} key={key}>
              {!updateToggle[key] ? (
                <div className="info-block">
                  <span>{label}</span>
                  <p>{userInfo[key]}</p>
                  <button className={`${key}-edit`} onClick={(e) => toggleEditMode(e, key)}>수정</button>
                </div>
              ) : (
                <div className="info-block">
                  <span>{label}</span>
                  <input
                    id={key}
                    ref={(el) => (inputRefs.current[key] = el)}
                    onChange={changeValue}
                    value={userInfo[key]}
                  />
                  <div className="btn-block">
                    <button className={`${key}-update`} onClick={(e) => toggleEditMode(e, key)} >취소</button>
                    <button className={`${key}-update`} onClick={updatehandle}>저장</button>
                  </div>
                </div>
              )}
            </div>
          )
        ))}
        <div className="edit-warning">
          <Link to="/checkUser" state="/deleteUser">회원 탈퇴</Link>
          {type === 0 && (
            <Link className="password-change" to="/checkUser" state="/updatePassword">비밀번호 변경하기</Link>
          )}
        </div>
      </div>
    </div>
  );
}