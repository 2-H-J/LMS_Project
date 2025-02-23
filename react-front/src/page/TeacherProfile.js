import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiAxios from "../lib/apiAxios";
import '../css/TeacherProfile.css';
import { useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

export default function TeacherProfile() {
  const { uno } = useParams();
  const [teacherData, setTeacherData] = useState({});
  const [profileImage, setProfileImage] = useState(""); 
  const navigate = useNavigate();

  const user = useSelector((state) => state.users.value);
  const decodeToken = user?.token ? jwtDecode(user.token) : null;
  const userUno = decodeToken?.sub;
  const isOwner = userUno === uno;
  const editor = useRef(null);

  useEffect(() => {
    apiAxios.get(`/teacherProfile/${uno}`)
      .then(res => {
        setTeacherData(res.data.dto);
        setProfileImage(res.data.profileImg || ""); 

        // 📌 데이터 도착 후 에디터 값 업데이트
        if (editor.current) {
          editor.current.getInstance().setHTML(res.data.dto.teacherContent || "소개가 없습니다.");
        }
      })
      .catch(err => {
        console.error('강사 정보를 불러오는 데 실패했습니다.', err);
      });
  }, [uno, user?.token]);

  const handleSave = () => {
    if (editor.current) {
      const content = editor.current.getInstance().getHTML();
      
      setTeacherData(prev => ({
        ...prev,
        teacherContent: content
      }));

      apiAxios.post(`/updateTeacherProfile`, { ...teacherData, teacherContent: content })
        .then((res) => {
          console.log('저장 완료');
          alert(res.data.msg);
        })
        .catch(err => {
          console.error('저장 실패:', err);
        });
    }
  };

 

  return (
    <div className="teacher-background">
      <div className="teacher-profile-container">
        <div className="teacher-info-left">
          <div className="profile-pic">
          {profileImage && (
                  <img src={profileImage} alt="Profile" className="profile-image" />
                )}
          </div>
          <h2 className="teacher-name">{teacherData?.name}</h2>
          <div className="teacher-email">
            <img src="/img/email.png" className="email-icon" />
            {isOwner ? (
              <input
                className="teacher-input"
                type="text"
                value={teacherData.teacherEmail || ""}
                onChange={(e) => setTeacherData(prev => ({ ...prev, teacherEmail: e.target.value }))}
              />
            ) : (
              <p>{teacherData?.teacherEmail || "-"}</p>
            )}
          </div>

          <div className="phone">
            <img src="/img/phone.png" className="phone-icon" />
            {isOwner ? (
              <input
                className="teacher-input"
                type="text"
                value={teacherData.teacherPhone || ""}
                onChange={(e) => setTeacherData(prev => ({ ...prev, teacherPhone: e.target.value }))}
              />
            ) : (
              <p>{teacherData?.teacherPhone || "-"}</p>
            )}
          </div>

          <div className="available-time">
            <img src="/img/time.png" className="time-icon" />
            {isOwner ? (
              <input
                className="teacher-input"
                type="text"
                value={teacherData.teacherAvailableTime || ""}
                onChange={(e) => setTeacherData(prev => ({ ...prev, teacherAvailableTime: e.target.value }))}
              />
            ) : (
              <p>{teacherData?.teacherAvailableTime || "-"}</p>
            )}
          </div>
        </div>

        <div className="teacher-info-right">
          <h2>강사 소개</h2>
          {isOwner ? (
            <>
              <Editor
                ref={editor}
                initialValue="소개가 없습니다."  // 초기값을 고정
                previewStyle="vertical"
                height="400px"
                initialEditType="wysiwyg"
                useCommandShortcut={true}
                onChange={() => {
                  if (editor.current) {
                    const content = editor.current.getInstance().getHTML();
                    setTeacherData(prev => ({ ...prev, teacherContent: content }));
                  }
                }}
              />
              <button type='button' className='teacher-save-button' onClick={handleSave}>저장</button>
            </>
          ) : (
            <div className="teacher-content" dangerouslySetInnerHTML={{ __html: teacherData?.teacherContent || "소개가 없습니다." }} />
          )}
        </div>
      </div>
    </div>
  );
}
