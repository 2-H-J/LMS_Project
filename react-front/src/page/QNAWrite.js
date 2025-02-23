import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import apiAxios from "../lib/apiAxios";
import "../css/QNAWrite.css";

export default function QNAWrite({ setAskWriting, chapters }) {
    const { classNumber } = useParams();
    const user = useSelector((state) => state.users.value);


    const [askTitle, setAskTitle] = useState("");
    const [chapter, setChapter] = useState(chapters.length > 0 ? chapters[0].chapterNumber : "");
    const [askContent, setAskContent] = useState("");

    const handleTitleChange = (e) => setAskTitle(e.target.value);
    const handleChapterChange = (e) => setChapter(e.target.value);
    const handleContentChange = (e) => setAskContent(e.target.value);

    const handleSubmit = () => {
        if (!askTitle || !chapter || !askContent) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("params", new Blob([JSON.stringify({
            askTitle,
            askContent,
            classNumber,
            chapterNumber: chapter
        })], { type: "application/json" }));

        apiAxios.post(`/class/${classNumber}/qna/write`, formData, {
            headers: {
                Authorization: `Bearer ${user.token}`,
                "Content-Type": "multipart/form-data"
            }
        })
            .then((res) => {
                alert("질문이 성공적으로 등록되었습니다.");
                console.log(res.data);
                if (setAskWriting) {
                    console.log("setAskWriting 호출됨");
                    setAskWriting(false);
                }
            })
            .catch((err) => {
                console.error(err);
                alert("질문 등록 중 오류가 발생했습니다.");
            });
    };

    return (
        <div className="qna-write">
            <h2 className="qna-write-title">질문하기</h2>

            {/* 제목 입력 */}
            <div className="qna-input-group">
                <label>제목</label>
                <input
                    type="text"
                    placeholder="제목을 입력하세요."
                    value={askTitle}
                    onChange={handleTitleChange}
                />
            </div>

            {/* 챕터 선택 */}
            <div className="qna-input-group">
                <label>챕터</label>
                <select value={chapter} onChange={handleChapterChange}>
                    {chapters.map((ch) => (
                        <option key={ch.chapterNumber} value={ch.chapterNumber}>
                            {ch.chapterName}
                        </option>
                    ))}
                </select>
            </div>

            {/* 내용 입력 */}
            <div className="qna-input-group">
                <label>내용</label>
                <textarea
                    placeholder="질문 내용을 입력하세요."
                    value={askContent}
                    onChange={handleContentChange}
                ></textarea>
            </div>

            {/* 질문 등록 버튼 */}
            <button className="qna-submit-btn" onClick={handleSubmit}>
                질문 등록
            </button>
        </div>
    );
}