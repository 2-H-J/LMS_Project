import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import apiAxios from "../lib/apiAxios";
import ClassUpdate from "./ClassUpdate";
import Chapter from "./Chapter";
import Notice from "./Notice";
import QNA from "./QNA";
import QNAWrite from "./QNAWrite";
import Rate from "./Rate";
import RateWrite from "./RateWrite";
import "../css/ClassPage.css";
import { jwtDecode } from "jwt-decode";
import StarRating from "../components/StarRating";
import Chat from "./Chat.js";

export default function ClassPage() {
    const { classNumber } = useParams();
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState("chapter"); // 기본값 chapter
    const [classInfo, setClassInfo] = useState({});
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [askWriting, setAskWriting] = useState(false);
    const [rateWriting, setRateWriting] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [averageRate, setAverageRate] = useState(0); // 평균 평점 상태값 추가

    const user = useSelector((state) => state.users.value);
    const decodeToken = user?.token ? jwtDecode(user.token) : null;
    const grade = decodeToken?.grade ?? 0;
    const isClassOwner = classInfo?.uno && decodeToken?.sub && grade === 1 && String(decodeToken.sub) === String(classInfo?.uno);

    // 강의 정보 불러오기
    const fetchClassInfo = useCallback(() => {
        setLoading(true);
        apiAxios.get(`/class/${classNumber}`)
            .then((res) => {
                if (res.data.class) {
                    setClassInfo(res.data.class);
                    setAverageRate(res.data.rate || 0); // 평균 평점 추가
                } else {
                    console.error("강의 정보가 존재하지 않습니다.");
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [classNumber]);

    // 수강 여부 확인
    const checkEnrollmentStatus = useCallback(() => {
        if (!user.token) return;

        apiAxios.get(`/usersProgress/check?classNumber=${classNumber}`, {
            headers: { "Authorization": `Bearer ${user.token}` }
        })
            .then((res) => {
                setIsEnrolled(res.data.isEnrolled);
            })
            .catch((err) => console.error("수강 여부 확인 실패", err));
    }, [classNumber]);

    useEffect(() => {
        if (!classNumber) {
            console.error("classNumber가 존재하지 않습니다.");
            navigate("/");
            return;
        }
        fetchClassInfo();
        checkEnrollmentStatus();
    }, [fetchClassInfo, checkEnrollmentStatus, classNumber, navigate]);

    const handleMenuChange = (menu) => {
        setActiveMenu(menu);
        setAskWriting(false);
        setRateWriting(false);
    };

    // "강의 수강하기" 버튼
    const enrollClass = () => {
        apiAxios.post(`/usersProgress/application?classNumber=${classNumber}`, {}, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            }
        })
            .then(() => {
                alert("강의 수강이 완료되었습니다!");
                setIsEnrolled(true);
            })
            .catch((err) => console.error("수강 신청 실패", err));
    };

    // "수강 취소" 버튼
    const handleCancelEnrollment = () => {
        apiAxios.delete(`/usersProgress/cancel?classNumber=${classNumber}`, {
            headers: { "Authorization": `Bearer ${user.token}` }
        })
            .then(() => {
                alert("수강 취소가 완료되었습니다!");
                setIsEnrolled(false);
            })
            .catch((err) => console.error("수강 취소 실패", err));
    };

    // 강의 삭제
    const deleteClass = () => {
        apiAxios.delete(`/class/${classNumber}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            }
        })
            .then(res => {
                alert(res.data.msg);
                if (res.data.code === 1) {
                    navigate('/classList');
                }
            })
            .catch(err => console.log(err));
    };

    // 강의 수정 후 새로고침
    const updateHandler = () => {
        fetchClassInfo();
        navigate(`/class/${classNumber}`);
    };

    return (
        <div className="class-container">
            {loading && <p className="loading-text">로딩 중...</p>}

            {/* 강의 헤더 */}
            <div className="class-header">
                <span className="class-category">{classInfo.category}</span>
                <h1 className="class-title">{classInfo.title}</h1>
                <div className="class-instructor-info">
                    <p className="class-instructor">{classInfo.name} 강사</p>
                    <Link to={`/teacherProfile/${classInfo.uno}`} className="class-instructor-link">
                        강사소개 바로가기 &gt;
                    </Link>
                </div>
                <p className="class-description">{classInfo.description}</p>
                <div className="class-rate">
                    <StarRating rateCount={averageRate} setRateCount={() => { }} className="class-star-rating" />
                    <span>평점 : {averageRate}</span>
                </div>
                <p>수강생 {classInfo.studentCount}명</p>
                {isClassOwner && (
                    <div className="instructor-controls">
                        <button className="class-modify-button" onClick={() => setShowUpdateModal(true)}>강의 수정</button>
                        <button className="class-delete-button" onClick={deleteClass}>강의 삭제</button>
                    </div>
                )}
                {grade === 2 && (
                    isEnrolled ? (
                        <button className="class-cancel-button" onClick={handleCancelEnrollment}>
                            수강 취소
                        </button>
                    ) : (
                        <button className="class-enroll-button" onClick={enrollClass}>
                            수강 신청
                        </button>
                    )
                )}
            </div>

            {/* 강의 메뉴 */}
            <div className="class-menu">
                <button className={activeMenu === "chapter" ? "active" : ""} onClick={() => handleMenuChange("chapter")}>챕터 목록</button>
                <button className={activeMenu === "notice" ? "active" : ""} onClick={() => handleMenuChange("notice")}>공지사항</button>
                <button className={activeMenu === "qna" ? "active" : ""} onClick={() => handleMenuChange("qna")}>Q&A</button>
                <button className={activeMenu === "rate" ? "active" : ""} onClick={() => handleMenuChange("rate")}>수강평</button>
                <button className={activeMenu === "chat" ? "active" : ""} onClick={() => handleMenuChange("chat")}>채팅</button>
            </div>

            {/* 강의 컨텐츠 */}
            <div className="class-content">
                {activeMenu === "chapter" && <Chapter classNumber={classNumber} isEnrolled={isEnrolled} />}
                {activeMenu === "notice" && <Notice classNumber={classNumber} />}
                {activeMenu === "qna" && (
                    askWriting ? <QNAWrite setAskWriting={setAskWriting} chapters={chapters} /> : <QNA setAskWriting={setAskWriting} isClassOwner={isClassOwner} />
                )}
                {activeMenu === "rate" && (
                    rateWriting ? <RateWrite setRateWriting={setRateWriting} /> : <Rate setRateWriting={setRateWriting} />
                )}
                 {activeMenu === "chat" && <Chat classNumber={classNumber} />}
            </div>

            {showUpdateModal && <ClassUpdate classInfo={classInfo} onClose={() => setShowUpdateModal(false)} onClassUpdated={updateHandler} />}
        </div>
    );
}
