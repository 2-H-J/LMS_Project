import React, { useState } from "react";
import "../css/VideoWrite.css";
import apiAxios from "../lib/apiAxios";

export default function VideoWrite({ onClose, chapterNumber, classNumber, onVideoAdded }) {
    const [title, setTitle] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 유튜브 URL 검증 함수
    const isValidYouTubeUrl = (url) => {
        const regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
        return regex.test(url);
    };

    // "등록" 버튼 클릭 시 실행
    const handleSubmit = async () => {
        if (!title.trim() || !videoUrl.trim()) {
            setError("동영상 제목과 URL을 입력해주세요.");
            return;
        }

        // 유튜브 URL 검증
        if (!isValidYouTubeUrl(videoUrl)) {
            setError("올바른 유튜브 URL을 입력해주세요.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await apiAxios.post("/video/insert", {
                videoTitle: title,
                videoUrl, 
                chapterNumber,
                classNumber
            });

            if (response.data.code === 1) {
                alert("영상이 성공적으로 등록되었습니다.");
                onVideoAdded(); // 부모 컴포넌트에서 목록 갱신
                onClose(); // 모달 닫기
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error("영상 등록 실패:", error);
            setError("영상 등록 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="video-write-modal">
            <div className="video-write-container">
                <h2>동영상 강의 등록</h2>
                {error && <p className="error-text">{error}</p>}
                <input
                    type="text"
                    placeholder="동영상 제목을 입력하세요."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="유튜브 영상 URL을 입력하세요."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                />
                <div className="video-write-buttons">
                    <button onClick={handleSubmit} className="submit-btn" disabled={loading}>
                        {loading ? "등록 중..." : "등록"}
                    </button>
                    <button onClick={onClose} className="cancel-btn" disabled={loading}>
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
}
