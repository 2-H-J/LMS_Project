import React, { useState, useEffect, useCallback } from "react";
import apiAxios from "../lib/apiAxios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import StarRating from "../components/StarRating";
import "../css/Rate.css";

export default function Rate({ setRateWriting }) {
  const [rateList, setRateList] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isAlreadyWritten, setIsAlreadyWritten] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editScore, setEditScore] = useState(0);

  const { classNumber } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.users.value);
  const decodeToken = user?.token ? jwtDecode(user.token) : null;

  const checkEnrollmentStatus = useCallback(() => {
    apiAxios
      .get(`/usersProgress/check?classNumber=${classNumber}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setIsEnrolled(res.data.isEnrolled);
      })
      .catch((err) => console.error("수강 여부 확인 실패", err));
  }, [classNumber, user.token]);

  useEffect(() => {
    if (!classNumber) {
      console.error("classNumber가 존재하지 않습니다.");
      navigate("/");
      return;
    }
    checkEnrollmentStatus();
  }, [classNumber, checkEnrollmentStatus, navigate]);

  useEffect(() => {
    apiAxios
      .get(`/class/${classNumber}/rate`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        setRateList(res.data);

        if (decodeToken?.sub) {
          const alreadyWritten = res.data.some(
            (rate) => rate.uno === decodeToken.sub
          );
          setIsAlreadyWritten(alreadyWritten);
        }
      })
      .catch((err) => console.error(err));
  }, [classNumber, user.token, decodeToken]);

  const handleWriteRate = () => {
    if (isAlreadyWritten) {
      alert("해당 강의에 이미 수강평을 작성하셨습니다.");
      return;
    }
    setRateWriting(true);
  };

  const deleteRate = (rateNumber) => {
    apiAxios
      .delete(`/class/${classNumber}/rate/${rateNumber}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        alert("수강평을 삭제하였습니다.");
        setRateList(res.data.rateList);
        setIsAlreadyWritten(false);
      })
      .catch((err) => console.error(err));
  };

  const handleEditClick = (rate) => {
    setEditingRate(rate.rateNumber);
    setEditContent(rate.rateContent);
    setEditScore(rate.rateScore);
  };

  const handleUpdateRate = (rateNumber) => {
    apiAxios
      .put(
        `/class/${classNumber}/rate/${rateNumber}`,
        { rateContent: editContent, rateScore: editScore },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      )
      .then((res) => {
        alert("수강평을 수정하였습니다.");
        setRateList(res.data.rateList);
        setEditingRate(null);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="rate-container">
      <h2>수강평</h2>

      {isEnrolled && (
        <button className="rate-add-button" onClick={handleWriteRate}>
          수강평 작성
        </button>
      )}

      <div className="rate-list">
        {rateList.length > 0 ? (
          rateList.map((item) => (
            <div key={item.rateNumber} className="rate-item">
              {/* ⭐ 수정 모드일 때만 별점 선택 가능 */}
              {editingRate === item.rateNumber ? (
                <StarRating rateCount={editScore} setRateCount={setEditScore} />
              ) : (
                <StarRating rateCount={item.rateScore} />
              )}

              <div className="rate-writer">{item.nickName}</div>

              {editingRate === item.rateNumber ? (
                <textarea
                  className="rate-edit-input"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              ) : (
                <div className="rate-content">{item.rateContent}</div>
              )}

              {decodeToken?.sub === item.uno && (
                <div className="rate-button-container">
                  {editingRate === item.rateNumber ? (
                    <div className="rate-update-button-container">
                      <button
                        className="rate-save-button"
                        onClick={() => handleUpdateRate(item.rateNumber)}
                      >
                        저장
                      </button>
                      <button
                        className="rate-cancel-button"
                        onClick={() => setEditingRate(null)}
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        className="rate-update-button"
                        onClick={() => handleEditClick(item)}
                      >
                        수정
                      </button>
                      <button
                        className="rate-delete-button"
                        onClick={() => deleteRate(item.rateNumber)}
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="no-rate">수강평이 없습니다.</p>
        )}
      </div>
    </div>
  );
}