import React, { useState } from "react";
import apiAxios from "../lib/apiAxios";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";
import "../css/NoticeWrite.css";

export default function NoticeWrite({ onClose, onNoticeAdded }) {
    const [noticeTitle, setNoticeTitle] = useState("");
    const [noticeContent, setNoticeContent] = useState("");

    const [loading, setLoading] = useState(false);
    const { classNumber } = useParams();

    const user = useSelector((state) => state.users.value);

    const handleSubmit = async () => {
        if (!noticeTitle || !noticeContent) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        let uno = null;
                try {
                    uno = jwtDecode(user.token).sub;
                } catch (error) {
                    console.error("JWT 디코딩 오류:", error);
                    alert("로그인이 필요합니다.");
                    setLoading(false);
                    return;
                }

        const params = JSON.stringify({ noticeTitle, noticeContent, uno, classNumber });
    
        const formData = new FormData();
        formData.append("params", params);
    
        try {
            const response = await apiAxios.post(`/class/${classNumber}/notice/write`, formData, {
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                    "Content-Type": "multipart/form-data"
                },
            });
    
            if (response.data.code === 1) {
                alert("공지사항이 성공적으로 등록되었습니다.");
                onNoticeAdded();
                onClose();
            } else {
                alert("공지사항 등록에 실패했습니다.");
            }
        } catch (error) {
            console.error("공지사항 등록 중 오류 발생:", error);
            alert("서버 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="notice-insert-backdrop">
            <div className="notice-insert-container">
                    <p className="notice-insert-title">공지사항 작성</p>

                <div className="notice-insert-form">
                    <input
                        type="text"
                        className="notice-insert-input"
                        placeholder="공지 제목을 입력해주세요."
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                    />

                    <textarea
                        className="notice-insert-textarea"
                        placeholder="공지 내용을 입력해주세요."
                        value={noticeContent}
                        onChange={(e) => setNoticeContent(e.target.value)}
                    />
                </div>

                <div className="notice-insert-button-group">
                    <button
                        className="notice-insert-submit"
                        onClick={handleSubmit}
                        disabled={loading || !noticeTitle || !noticeContent}
                    >
                        {loading ? "등록 중..." : "등록"}
                    </button>
                    <button className="notice-insert-cancel" onClick={onClose}>
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
}