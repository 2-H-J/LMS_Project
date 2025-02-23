import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import apiAxios from "../lib/apiAxios";
import StarRating from "../components/StarRating";
import "../css/RateWrite.css";

export default function RateWrite({ setRateWriting }) {
  const { classNumber } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.users.value);

  const [rateScore, setRateScore] = useState(0);
  const [rateContent, setRateContent] = useState("");

  const handleSubmit = () => {
    if (!rateContent.trim()) {
      alert("수강평 내용을 입력해주세요.");
      return;
    }

    if (rateScore === 0) {
      alert("별점을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("params", new Blob([
          JSON.stringify({
            uno: user.uno,
            classNumber,
            rateScore,
            rateContent,
          }),
        ],
        { type: "application/json" }
      )
    );

    apiAxios
      .post(`/class/${classNumber}/rate`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        alert("수강평이 등록되었습니다.");
        setRateWriting(false);
      })
      .catch((err) => {
        console.error("수강평 작성 실패", err);
        alert("수강평 작성에 실패했습니다.");
      });
  };

  return (
    <div className="rate-write-container">
      <h2>수강평 작성</h2>
      <label>별점 :</label>
      <StarRating rateCount={rateScore} setRateCount={setRateScore} />

      <textarea
        value={rateContent}
        onChange={(e) => setRateContent(e.target.value)}
        placeholder="수강평을 작성해주세요."
      />

      <div className="rate-write-button">
        <button onClick={handleSubmit}>저장</button>
        <button onClick={() => navigate(-1)}>취소</button>
      </div>
    </div>
  );
}