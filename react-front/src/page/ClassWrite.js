import React, { useState } from "react";
import apiAxios from "../lib/apiAxios";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import "../css/ClassWrite.css";

export default function ClassWrite({ onClose, onClassAdded }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [thumbnail, setThumbnail] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);

    const user = useSelector((state) => state.users.value);

    // 썸네일 파일을 Base64로 변환하는 함수
    const handleThumbnailUpload = (file) => {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setThumbnail(reader.result); // Base64 데이터 저장
            };
        }
    };

    // 드래그 앤 드롭 이벤트 처리
    const handleDragOver = (event) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        handleThumbnailUpload(file);
    };

    const handleThumbnailRemove = () => {
        setThumbnail(null);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        handleThumbnailUpload(file);
    };

    // 강의 등록 API 요청
    const handleSubmit = async () => {
        if (!title || !description || !category) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        setLoading(true);

        let uno = null;
        try {
            uno = jwtDecode(user.token).sub;
        } catch (error) {
            console.error("JWT 디코딩 오류:", error);
            alert("로그인이 필요합니다.");
            setLoading(false);
            return;
        }

        const requestData = {
            title,
            description,
            category,
            uno,
            thumbnail, // Base64 데이터 전달
        };

        try {
            const response = await apiAxios.post("/class/write", requestData, {
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.data.code === 1) {
                alert("강의가 성공적으로 등록되었습니다!");
                onClassAdded();
                onClose();
            } else {
                alert("강의 등록에 실패했습니다.");
            }
        } catch (error) {
            console.error("강의 등록 중 오류 발생:", error);
            alert("서버 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="class-insert-backdrop">
            <div className="class-insert-container">
                <div className="class-insert-header">
                    <p className="class-insert-title">강의 등록</p>
                    <select
                        className="class-insert-category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="" disabled>카테고리 선택</option>
                        <option value="Java">Java</option>
                        <option value="Python">Python</option>
                        <option value="C">C</option>
                        <option value="C++">C++</option>
                        <option value="C#">C#</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="TypeScript">TypeScript</option>
                        <option value="Kotlin">Kotlin</option>
                        <option value="HTML/CSS">HTML/CSS</option>
                        <option value="Database">SQL</option>
                        <option value="Swift">Swift</option>
                        <option value="Go">Go</option>
                        <option value="Rust">Rust</option>
                        <option value="Ruby">Ruby</option>
                        <option value="PHP">PHP</option>
                    </select>
                </div>

                <div className="class-insert-form">
                    <input
                        type="text"
                        className="class-insert-input"
                        placeholder="강의 제목을 입력해주세요."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <textarea
                        className="class-insert-textarea"
                        placeholder="강의 소개를 입력해주세요."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <div className="class-insert-thumbnail-wrapper">
                        <span className="class-insert-thumbnail-label">썸네일 업로드</span>
                        <button className="remove-thumbnail-btn" onClick={handleThumbnailRemove}>
                            취소
                        </button>
                    </div>

                    <div
                        className={`class-insert-thumbnail ${dragging ? "dragging" : ""}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {thumbnail ? (
                            <div className="thumbnail-preview">
                                <img src={thumbnail} alt="썸네일 미리보기" />
                            </div>
                        ) : (
                            <p className="thumbnail-plus">+</p>
                        )}
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="class-insert-file-input"
                    />

                    <ul className="thumbnail-guide">
                        <li>이곳에 강의 썸네일을 드래그하여 업로드 하세요.</li>
                        <li>비율 : 300 × 200</li>
                        <li>용량이 큰 파일은 업로드되지 않을 수 있습니다.</li>
                    </ul>
                </div>

                <div className="class-insert-button-group">
                    <button className="class-insert-submit" onClick={handleSubmit} disabled={!category || loading}>
                        {loading ? "등록 중..." : "등록"}
                    </button>
                    <button className="class-insert-cancel" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
}
