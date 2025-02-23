import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import apiAxios from "../lib/apiAxios";
import "../css/Dashboard.css";

export default function DashBoard() {
    const user = useSelector((state) => state.users.value);
    const [recentClasses, setRecentClasses] = useState([]);
    const [recentVideos, setRecentVideos] = useState([]); // 최근 시청한 영상 목록
    const [classList, setClassList] = useState([]);
    const [classQuizProgress, setClassQuizProgress] = useState([]); // 퀴즈 진행률

    const navigate = useNavigate();
    let userRole = null;

    // JWT 토큰 디코딩
    if (user.token) {
        const decodeToken = jwtDecode(user.token);
        userRole = decodeToken.grade;
    }

    useEffect(() => {
        if (!user.token) {
            navigate("/login");
            return;
        }
        apiAxios.get("/dashboard", {
            headers: {
                "Authorization": `Bearer ${user.token}`,
                "Content-Type": "application/json"
            }
        })
            .then((res) => {
                if (userRole === 1) {
                    const updatedClassList = (res.data.classList || []).map(classItem => ({
                        ...classItem,
                        thumbnail: classItem.thumbnail
                            ? (classItem.thumbnail.startsWith("data:image")
                                ? classItem.thumbnail
                                : `data:image/png;base64,${classItem.thumbnail}`)
                            : "/img/default_thumbnail.jpg"
                    }));
                    setClassList(updatedClassList);
                } else {
                    // 수강생일 경우 수강 중인 강의를 가져옴
                    const updatedClasses = (res.data.recentClasses || []).map(classItem => ({
                        ...classItem,
                        thumbnail: classItem.thumbnail
                            ? (classItem.thumbnail.startsWith("data:image")
                                ? classItem.thumbnail
                                : `data:image/png;base64,${classItem.thumbnail}`)
                            : "/img/default_thumbnail.jpg"
                    }));
                    setRecentClasses(updatedClasses);
                    //퀴즈 진행률
                    setClassQuizProgress(res.data.classQuizProgress || []);
                }
            })
            .catch((err) => console.log(err));

        // 최근 시청한 영상 가져오기
        apiAxios.get(`/videoProgress/recent/${user.uno}`, {
            headers: {
                "Authorization": `Bearer ${user.token}`,
                "Content-Type": "application/json"
            }
        })
            .then((res) => {
                if (res.data.code === 1) {
                    setRecentVideos(res.data.recentVideos);
                }
            })
            .catch((err) => console.log("최근 시청한 영상 불러오기 실패", err));

    }, [user.token]);

    // 강의 클릭 시 해당 강의 페이지로 이동
    const handleClassClick = (classNumber) => {
        navigate(`/class/${classNumber}`);
    };

    // 영상 클릭 시 해당 영상 페이지로 이동
    const handleVideoClick = (videoNumber) => {
        navigate(`/video/${videoNumber}`);
    };

    const formatDate = (dateTime) => {
        return dateTime.substring(0, 10);
    };

    // 특정 강의의 퀴즈 진행률 가져오기
    const getQuizProgress = useMemo(() => (classNumber) => {
        const progress = classQuizProgress.find((progress) => progress.classNumber === classNumber);
        return progress ? progress.classProgress : 0; // 진행률 없으면 0%
    }, [classQuizProgress]);

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">{userRole === 1 ? "내 강의 목록과 현황을 볼 수 있습니다." : "회원님의 수강 기록을 조회할 수 있습니다."}</h2>
            {/* 강사 화면 */}
            {userRole === 1 ? (
                <div className="dashboard-class-list">
                    <h3 className="dashboard-toptitle">강의 현황</h3>
                    {classList.length > 0 ? (
                        classList.map((classItem) => (
                            <div className="dashboard-teacherClass-container" key={classItem.classNumber} onClick={() => handleClassClick(classItem.classNumber)}>
                                <div className="dashboard-class-header">

                                    <img
                                        src={classItem.thumbnail}
                                        alt="강의 썸네일"
                                        className="dashboard-class-thumbnail"
                                    />
                                    <p>{formatDate(classItem.createTime)}</p>
                                </div>
                                <div className="dashboard-class-info">
                                    <p className="dashboard-recentClass-title">{classItem.title}</p>
                                    <p>챕터 개수: {classItem.chapterCount}개</p>
                                    <p>영상 개수: {classItem.videoCount}개</p>
                                    <p>수강생 수: {classItem.studentCount}명</p>
                                    <p>평균 평점: {classItem.rate}점</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-classes">등록된 강의가 없습니다.</p>
                    )}
                </div>
            ) : (
                // 수강생 화면
                <div className="dashboard-student">
                    <h3 className="dashboard-toptitle">최근에 시청한 영상</h3>
                    <div className="dashboard-recent-videos">
                        {recentVideos.length > 0 ? (
                            recentVideos.map((video) => (
                                <div className="dashboard-video-card" key={video.videoNumber} onClick={() => handleVideoClick(video.videoNumber)}>
                                    <div className="dashboard-video-thumbnail">
                                        <img
                                            src={video.thumbnail
                                                ? (video.thumbnail.startsWith("data:image")
                                                    ? video.thumbnail
                                                    : `data:image/png;base64,${video.thumbnail}`)
                                                : "/img/default_thumbnail.jpg"}
                                            alt={video.videoTitle}
                                        />
                                    </div>
                                    <div className="dashboard-video-info">
                                        <p className="dashboard-video-title">{video.videoTitle}</p>
                                        <p>{video.classTitle} - {video.instructorName} 강사</p>
                                        <p className="dashboard-video-date">{formatDate(video.videoProgressUpdateTime)}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-videos">최근 시청한 영상이 없습니다.</p>
                        )}
                    </div>
                    <h3 className="dashboard-toptitle">수강 중인 강의 목록</h3>
                    <div className="dashboard-enrolled-course">
                        {recentClasses.length > 0 ? (
                            recentClasses.map((classItem) => (
                                <div className="dashboard-recentClass-card" key={classItem.usersProgressNumber} onClick={() => handleClassClick(classItem.classNumber)}>
                                    <img
                                        src={classItem.thumbnail}
                                        alt={classItem.title}

                                        className="dashboard-class-thumbnail"
                                    />
                                    <div className="class-info">
                                        <p className="dashboard-recentClass-title">{classItem.title}</p>
                                        <p>
                                            {classItem.instructorName
                                                ? `${classItem.instructorName} 강사`
                                                : "강사정보 없음"}
                                        </p>
                                        <p className="dashboard-recentClass-date">{formatDate(classItem.progressUpdateTime)}</p>
                                        {/* 퀴즈 진행률 추가 */}
                                        <p>퀴즈 진행도</p>
                                        <div className="quiz-progressbar">
                                            <div className="progress-bar" style={{ width: `${getQuizProgress(classItem.classNumber)}%` }}></div>
                                        </div>
                                        <p className="quiz-progressbar-text">{getQuizProgress(classItem.classNumber)}% 진행</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-classes">아직 수강 중인 강의가 없습니다.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}