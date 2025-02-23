import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import apiAxios from "../lib/apiAxios";
import { jwtDecode } from "jwt-decode";
import "../css/Notice.css";
import NoticeWrite from "./NoticeWrite";

export default function Notice() {
    const [notice, setNotice] = useState([]);
    const [classInfo, setClassInfo] = useState(null);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { classNumber } = useParams();
    const user = useSelector((state) => state.users.value);
    const decodeToken = user?.token ? jwtDecode(user.token) : null;

    const grade = decodeToken
        ? decodeToken.grade || (decodeToken.roles === "강사" ? 1 : decodeToken.roles === "학생" ? 2 : 3)
        : 3;

    const isClassOwner = classInfo?.class?.uno && decodeToken?.sub && grade === 1 && String(decodeToken.sub) === String(classInfo.class.uno);


    useEffect(() => {
        if (!classNumber) {
            console.error("classNumber가 존재하지 않습니다.");
            return;
        }

        apiAxios.get(`/class/${classNumber}/notice`)
            .then((res) => {
                setNotice(res.data || []);
            })
            .catch((err) => {
                console.error(err);
                setNotice([]);
            });

        apiAxios.get(`/class/${classNumber}`)
            .then((res) => {
                setClassInfo(res.data);
            })
            .catch((err) => console.error(err));
    }, [classNumber]);

    // 공지사항 펼치기/접기 토글 함수
    const toggleExpand = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    // 공지사항 작성 모달 닫기 함수
    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const fetchNotices = async () => {
        try {
            const response = await apiAxios.get(`/class/${classNumber}/notice`);
            setNotice(response.data);
        } catch (error) {
            console.error("공지사항 목록을 가져오는 중 오류가 발생했습니다.", error);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleNoticeAdded = () => {
        fetchNotices(); // 공지 등록 후 목록을 새로고침
    };

    // 공지 삭제
    const deleteNotice = (noticeNumber) => {
        apiAxios.delete(`/class/${classNumber}/notice/${noticeNumber}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            }
        })
            .then(res => {
                alert(res.data.msg);
                if (res.data.code === 1) {
                    fetchNotices();
                }
            })
            .catch(err => console.log(err));
    };



    return (
        <div className="notice-container">
            <h2>공지사항</h2>

            {isClassOwner && (
                <button className="notice-add-button" onClick={() => setIsModalOpen(true)}>
                    공지사항 작성
                </button>
            )}

            <div className="notice-list">
                {notice.length > 0 ? (
                    notice.map((item, index) => (
                        <div key={item.noticeNumber ? item.noticeNumber : `notice-${index}`} className="notice-item">
                            <div className="notice-header" onClick={() => toggleExpand(index)}>
                                <div className="notice-title">{item.noticeTitle}</div>
                                <div className="notice-date">{item.noticeCreateTime.substring(0, 10)}</div>
                                <div className={`arrow-icon ${expandedIndex === index ? "expanded" : ""}`} />
                            </div>
                            {expandedIndex === index && (
                                <div className="notice-content">
                                    {item.noticeContent}
                                    {isClassOwner && (
                                        <button className="notice-delete-button" onClick={() => deleteNotice(item.noticeNumber)}>
                                        </button>
                                    )}
                                </div>
                            )}

                        </div>
                    ))
                ) : (
                    <p>공지사항이 없습니다.</p>
                )}
            </div>

            {/* 공지사항 작성 모달 */}
            {isModalOpen && (
                <NoticeWrite onClose={handleModalClose} onNoticeAdded={handleNoticeAdded} />
            )}
        </div>
    );
}