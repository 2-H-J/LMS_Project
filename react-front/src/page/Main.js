import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import apiAxios from "../lib/apiAxios";
import "../css/Main.css";

export default function Main() {
  const user = useSelector((state) => state.users.value);
  const [latestClasses, setLatestClasses] = useState([]);
  const [recentClasses, setRecentClasses] = useState([]);
  const [latestAsk, setLatestAsk] = useState([]);
  const [classList, setClassList] = useState([]);
  const [classQuizProgress, setClassQuizProgress] = useState([]);
  const [profileImage, setProfileImage] = useState(null);//이미지 추가!
  const [nickname, setNickname] = useState("guest");

  const navigate = useNavigate();
  let userRole = null;
  
  useEffect(() => {
    apiAxios.get("/")
      .then((res) => {
        const updatedClasses = (res.data.latestClasses || []).map(classItem => ({
          ...classItem,
          thumbnail: classItem.thumbnail
            ? (classItem.thumbnail.startsWith("data:image")
              ? classItem.thumbnail
              : `data:image/png;base64,${classItem.thumbnail}`)
            : "/img/default_thumbnail.jpg" // 기본 썸네일 제공
        }));
        setLatestClasses(updatedClasses);
      })
      .catch((err) => console.log(err));
  }, []); // user.token을 의존성에서 제거

  useEffect(() => {
    if (user.token) {
      apiAxios.get("/users", {
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      })
        .then((res) => {
          if (userRole === 1) {
            setClassList(res.data.classList || []);
          } else {
            setRecentClasses(res.data.recentClasses || []);
            setLatestAsk(res.data.latestAsk || []);
            setClassQuizProgress(res.data.classQuizProgress || []);
          }
        })
        .catch((err) => console.log(err));
    }
  }, [user.token, userRole]); // userRole이 설정된 후 실행되도록 의존성 추가

  useEffect(() => {
    if (user.token) {
      // 프로필 이미지 가져오기
      apiAxios.get("/GetUserProfile", {
        headers: { "Authorization": `Bearer ${user.token}` }
      })
        .then((res) => {
          if (res.data.profileImg) {
            console.log("서버 응답:", res.data);
            setProfileImage(res.data.profileImg);
            setNickname(res.data.nickname);
          }
        })
        .catch((err) => console.log("프로필 이미지 불러오기 실패:", err));
    }
  }, [user.token, nickname]);

  // JWT 토큰 디코딩
  if (user.token) {
    const decodeToken = jwtDecode(user.token);
    userRole = decodeToken.grade;
    const role = userRole === 1 ? "강사" : userRole === 2 ? "수강생" : "회원";
  }

  // 강의 클릭 시 해당 강의 페이지로 이동
  const handleClassClick = (classNumber) => {
    navigate(`/class/${classNumber}`);
  };

  const formatDate = (dateTime) => {
    return dateTime.substring(0, 10);
  };

  const getQuizProgress = (classNumber) => {
    const progress = classQuizProgress.find((progress) => progress.classNumber === classNumber);
    return progress ? progress.classProgress : 0; // 진행률 없으면 0%
  };

  return (
    <>
      <div className="header-space"></div>
      <div className="main-background">
        <div className="main-container">
          <div className="left">
            {/* 메인 배너 */}
            <div className="main-banner">
              <span className="banner-title"><strong>Learnify</strong>는 <br /><strong>Learn</strong>(학습)과 <strong>-ify</strong>(변화시키다)를 결합한 단어입니다.</span>
              <span className="banner-content">
                이는 학습을 보다 쉽게, 실력을 효과적으로 변화시킬 수 있다는 의미를 담고 있으며,<br />
                다양한 학습 자원을 통해, 학습의 즐거움과 성취감을 제공합니다. <br />
                Learnify와 함께 스마트한 학습 여정을 시작하세요!
              </span>
              <button className="banner-button" onClick={() => (window.location.href = "/classList")}>
                강의 목록 바로가기 &gt;
              </button>
            </div>

            {/* 최신 강의 */}
            <div className="latest-classes">
              <h2 className="lc-title">최신 강의</h2>
              <div className="lc-cards">
                {latestClasses.map((classItem) => (
                  <div className="lc-card" key={classItem.classNumber} onClick={() => handleClassClick(classItem.classNumber)}>
                    <div className="lc-thumbnail">
                      <img
                        src={classItem.thumbnail}
                        alt={classItem.title}
                        className="lc-thumbnail-image"
                      />
                    </div>
                    <div className="lc-details">
                      <span className="lc-category">{classItem.category}</span>
                      <h3 className="lc-title">{classItem.title}</h3>
                      <p className="lc-instructor">{classItem.name}</p>
                      <p className="lc-date">{formatDate(classItem.createTime)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="sidebar">
            <div className="profile">
              <div className="profile-pic">
                {profileImage && (
                  <img src={profileImage} alt="Profile" className="profile-image" />
                )}
              </div>
              <p className="profile-name">
                {nickname} 님, <br />
                어서오세요! 🔥
              </p>
            </div>

            {userRole === 1 ? (
              // 강사
              <div className="recent-classes-section">
                <h3 className="sidebar-title">등록된 강의</h3>
                <div className="recentClass-container">
                  {classList.length > 0 ? (
                    classList.slice(0, 10).map((classItem) => (
                      <div
                        className="sidebar-recentClass-container"
                        key={classItem.classNumber}
                        onClick={() => handleClassClick(classItem.classNumber)}
                      >
                        <div className="sidebar-recentClass-details">
                        <p className="sidebar-recentClass-title">{classItem.title}</p>
                        <p className="sidebar-recentClass-date">
                          {formatDate(classItem.createTime)}
                        </p>
                        </div>
                        <br/>
                      </div>
                    ))
                  ) : (
                    <p className="no-classes">등록된 강의가 없습니다.</p>
                  )}
                </div>
              </div>
            ) : (
              // 수강생
              <>
                <div className="recent-classes-section">
                  <h3 className="sidebar-title">수강 중인 강의</h3>
                  <div className="recentClass-container">
                    {recentClasses.length > 0 ? (
                      recentClasses.map((recentClasses) => (
                        <div
                          className="sidebar-recentClass-container"
                          key={recentClasses.usersProgressNumber}
                          onClick={() => handleClassClick(recentClasses.classNumber)}
                        >
                          <div className="sidebar-recentClass-details">
                            <p className="sidebar-recentClass-title">{recentClasses.title}</p>
                            <p className="sidebar-recentClass-date">
                              {formatDate(recentClasses.progressUpdateTime)}
                            </p>
                          </div>
                          <div className="quiz-progressbar">
                            <div className="progress-bar" style={{ width: `${getQuizProgress(recentClasses.classNumber)}%` }}></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-classes">아직 수강 중인 강의가 없습니다.</p>
                    )}
                  </div>
                </div>

                <div className="qna-section">
                  <h3 className="sidebar-title">Q&A</h3>
                  <div className="qnas-container">
                    {latestAsk.length > 0 ? (
                      latestAsk.map((latestAsk) => (
                        <div className="sidebar-qna-container" key={latestAsk.askNumber}>
                          <p className="sidebar-qna-title">{latestAsk.askTitle}</p>
                          <p className="sidebar-qna-date">{formatDate(latestAsk.askCreateTime)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="no-questions">
                        아직 질문이 없습니다.<br />
                        강의를 수강하고 질문을 남겨보세요!
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
