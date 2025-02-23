import React, { useEffect, useState } from "react";
import apiAxios from "../lib/apiAxios";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import "../css/ClassUpdate.css";

export default function ClassUpdate({ classInfo, onClose, onClassUpdated }) {
    const [classNumber] = useState(classInfo.classNumber);
    const [title, setTitle] = useState(classInfo.title);
    const [description, setDescription] = useState(classInfo.description);
    const [category, setCategory] = useState(classInfo.category);
    const [thumbnail, setThumbnail] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const user = useSelector((state) => state.users.value);

    useEffect(() => {
        if (classInfo?.thumbnail) {
            setThumbnail(classInfo.thumbnail.startsWith("data:image") 
                ? classInfo.thumbnail 
                : `data:image/png;base64,${classInfo.thumbnail}`);
        }
    }, [classInfo]);

    const handleThumbnailUpload = (file) => {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setThumbnail(reader.result); // Base64 데이터 저장
            };
        }
    };

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
            classNumber,
            title,
            description,
            category,
            uno,
            thumbnail: thumbnail || classInfo.thumbnail,
        };

        try {
            const response = await apiAxios.post(`/class/update`, requestData, {
                headers: {
                    "Authorization": `Bearer ${user.token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.data.code === 1) {
                alert("강의가 성공적으로 수정되었습니다!");
                onClassUpdated();
                onClose();
            } else {
                alert("강의 수정에 실패했습니다.");
            }
        } catch (error) {
            console.error("강의 수정 중 오류 발생:", error);
            alert("서버 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="class-update-backdrop">
            <div className="class-update-container">
                <div className="class-update-header">
                    <h2 className="class-update-title">강의 수정</h2>
                    <span className="class-update-close-button" onClick={onClose}></span>
                </div>
                <select className="class-update-category-select" value={category} onChange={(e) => setCategory(e.target.value)}>
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

                <div className="class-update-form">
                    <label className="class-update-label-title">강의 제목</label>
                    <input type="text" className="class-update-input" value={title} onChange={(e) => setTitle(e.target.value)} />

                    <label className="class-update-label-description">강의 소개</label>
                    <textarea className="class-update-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                {/* 썸네일 업로드 영역 */}
                <div className="class-update-thumbnail-wrapper">
                    <span className="class-update-thumbnail-label">썸네일 업로드</span>
                    <button className="remove-thumbnail-btn" onClick={handleThumbnailRemove}>
                        취소
                    </button>
                </div>

                {/* 드래그 & 드롭 썸네일 업로드 */}
                <div
                    className={`class-update-thumbnail ${dragging ? "dragging" : ""}`}
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

                {/* 안내 문구 */}
                <ul className="thumbnail-guide">
                    <li>이곳에 강의 썸네일을 드래그하여 업로드 하세요.</li>
                    <li>비율 : 300 × 200</li>
                    <li>용량이 큰 파일은 업로드되지 않을 수 있습니다.</li>
                </ul>

                <button className="class-update-submit" onClick={handleSubmit} disabled={loading}>
                    {loading ? "수정 중..." : "수정"}
                </button>
            </div>
        </div>
    );
}
