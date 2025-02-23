import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import apiAxios from "../lib/apiAxios";
import { jwtDecode } from "jwt-decode";
import "../css/QNA.css";

export default function QNA({ setAskWriting, isClassOwner }) {
  const [qnaBoard, setQnaBoard] = useState([]);
  const [comments, setComments] = useState({});
  const [addComment, setAddComment] = useState({});

  const [isEnrolled, setIsEnrolled] = useState(false);

  const [editingAsk, setEditingAsk] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const { classNumber } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.users.value);

  const decodeToken = user?.token ? jwtDecode(user.token) : null;
  const userNumber = decodeToken ? decodeToken.sub : "";

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
    fetchQnaData();
  }, [classNumber]);

  const fetchQnaData = async () => {
    try {
      const res = await apiAxios.get(`/class/${classNumber}/qna`);
      setQnaBoard(res.data.qnaBoard);
      setComments(res.data.comments || {});
    } catch (err) {
      console.error(err);
    }
  };


  const formatDate = (dateTime) => {
    return dateTime.substring(0, 10);
  };

  // 질문 수정 버튼 클릭
  const startEditingAsk = (ask) => {
    setEditingAsk(ask.askNumber);
    setEditTitle(ask.askTitle);
    setEditContent(ask.askContent);
  };

  // 질문 수정 취소
  const cancelEditingAsk = () => {
    setEditingAsk(null);
    setEditTitle("");
    setEditContent("");
  };

  // 질문 수정 완료
  const handleEditAskSubmit = async (askNumber) => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      await apiAxios.put(`/class/${classNumber}/qna/${askNumber}`, {
        askTitle: editTitle,
        askContent: editContent,
      });

      alert("질문이 성공적으로 수정되었습니다.");
      fetchQnaData();
      cancelEditingAsk();
    } catch (err) {
      console.error(err);
      alert("질문 수정 중 오류가 발생했습니다.");
    }
  };

  // 질문 삭제
  const handleDeleteAsk = async (askNumber) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await apiAxios.delete(`/class/${classNumber}/qna/${askNumber}`);
      alert("질문이 삭제되었습니다.");
      fetchQnaData();
    } catch (err) {
      console.error(err);
      alert("질문 삭제 중 오류가 발생했습니다.");
    }
  };

  // 답변 추가 버튼 클릭 시 입력창 표시
  const toggleAddCommentInput = (askNumber) => {
    setAddComment((prev) => ({
      ...prev,
      [askNumber]: prev[askNumber] !== undefined ? undefined : "",
    }));
  };

  // 답변 입력 시 상태 업데이트
  const handleAddCommentChange = (askNumber, value) => {
    setAddComment((prev) => ({
      ...prev,
      [askNumber]: value,
    }));
  };

  // 답변 등록
  const handleAddCommentSubmit = async (askNumber) => {
    if (!addComment[askNumber]?.trim()) {
      alert("답변을 입력해주세요.");
      return;
    }

    const params = {
      commentContent: addComment[askNumber],
      askNumber,
      uno: user.uno,
    };

    try {
      const res = await apiAxios.post(`/class/${classNumber}/qna/comment`, params, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.data.code === 1) {
        alert("답변이 성공적으로 등록되었습니다.");

        // 새로운 댓글을 직접 상태에 추가
        setComments((prev) => ({
          ...prev,
          [askNumber]: [
            ...(prev[askNumber] || []),
            {
              commentNumber: res.data.commentNumber,
              commentContent: addComment[askNumber],
              commentCreateTime: new Date().toISOString(),
              uno: user.uno,
              name: res.data.name || user.name,
            },
          ],
        }));

        // 입력창 초기화
        setAddComment((prev) => ({
          ...prev,
          [askNumber]: "",
        }));
      } else {
        alert(res.data.msg);
      }
    } catch (err) {
      console.error("답변 등록 중 오류 발생:", err);
      alert("답변 등록 중 오류가 발생했습니다.");
    }
  };

  // 답변 삭제
  const handleDeleteComment = async (commentNumber, askNumber) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await apiAxios.delete(`/class/${classNumber}/qna/comment/${commentNumber}`);
      alert("답변이 삭제되었습니다.");

      // 삭제된 댓글을 상태에서 제거
      setComments((prev) => ({
        ...prev,
        [askNumber]: prev[askNumber].filter(comment => comment.commentNumber !== commentNumber),
      }));
    } catch (err) {
      console.error(err);
      alert("답변 삭제 중 오류가 발생했습니다.");
    }
  };


  return (
    <div className="qna-board">
      {(isEnrolled || isClassOwner) ?  (
        <>
          <h2 className="qna-board-title">
            궁금한 점을 자유롭게 질문하고,
            <br />
            다른 사람들의 질문에 답변을 통해 지식을 나눠보세요.
          </h2>
          <button className="qna-write-button" onClick={() => setAskWriting(true)}>질문하기</button>

          {qnaBoard.length > 0 ? (
            qnaBoard.map((qnaBoard, index) => (
              <div key={index} className="qna-card">
                <span className="qna-chapter">{qnaBoard.chapterName}</span>

                {userNumber === qnaBoard.uno && (
                  <div className="qna-actions">
                    <button className="qna-edit-btn" onClick={() => startEditingAsk(qnaBoard)}></button>
                    <button className="qna-delete-btn" onClick={() => handleDeleteAsk(qnaBoard.askNumber)}></button>
                  </div>
                )}
                {editingAsk === qnaBoard.askNumber ? (
                  <div className="edit-ask-container">
                    <label>질문 제목</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="제목을 입력하세요"
                    />
                    <label>질문 내용</label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="내용을 입력하세요"
                    />
                    <div className="edit-ask-actions">
                      <button onClick={() => handleEditAskSubmit(qnaBoard.askNumber)}>저장</button>
                      <button onClick={cancelEditingAsk}>취소</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="qna-title">{qnaBoard.askTitle}</p>
                    <p className="qna-content">{qnaBoard.askContent}</p>
                  </>
                )}


                <div className="qna-writer">
                  <img
                    src="/img/user.png"
                    alt="User Icon"
                    className="qna-writer-icon"
                  />
                  <p className="qna-writer-name">작성자 : {qnaBoard.name}</p>
                  <span className="qna-date">{formatDate(qnaBoard.askCreateTime)}</span>
                  <div className="qna-comment-count-container">
                    <img src="/img/comment.png" alt="Comment Icon" />
                    <span className="qna-comment-count">{comments[qnaBoard.askNumber] ? comments[qnaBoard.askNumber].length : 0}</span>
                  </div>
                </div>
                <div className="comments-section">
                  {comments[qnaBoard.askNumber] && comments[qnaBoard.askNumber].length > 0 ? (
                    comments[qnaBoard.askNumber].map((comment, idx) => (
                      <div key={idx} className="comment-card">
                        <div className="comment-header">
                          <div className="comment-user-icon">
                            <img src="/img/user.png" alt="User Icon" />
                            <span className="comment-user-name">{comment.name}</span>
                          </div>
                          <span className="comment-date">
                            {formatDate(comment.commentCreateTime)}
                          </span>
                          {userNumber === comment.uno && (
                            <button className="comment-delete-btn" onClick={() => handleDeleteComment(comment.commentNumber, qnaBoard.askNumber)}></button>
                          )}
                        </div>
                        <p className="comment-content">{comment.commentContent}</p>
                      </div>
                    ))
                  ) : (
                    <p className="no-comments">등록된 댓글이 없습니다.</p>
                  )}
                  {addComment[qnaBoard.askNumber] !== undefined ? (
                    <div className="add-comment-container">
                      <input
                        type="text"
                        placeholder="답변을 입력해주세요"
                        value={addComment[qnaBoard.askNumber]}
                        onChange={(e) => handleAddCommentChange(qnaBoard.askNumber, e.target.value)}
                      />
                      <button className="add-comment-submit-button" onClick={() => handleAddCommentSubmit(qnaBoard.askNumber)}>
                        <img src="/img/add-comment-icon.png" alt="Submit Comment" />
                      </button>
                    </div>
                  ) : (
                    <div className="add-comment-button-container">
                      <button className="add-comment-button" onClick={() => toggleAddCommentInput(qnaBoard.askNumber)}>답변 추가</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-qna-message">등록된 QnA가 없습니다.</p>
          )}
        </>
      ) : (
        <h2 className="not-enrolled-qna">수강 중인 강의가 아닙니다.<br />수강 신청을 하신 후 질문을 남겨보세요!</h2>
      )}

    </div>
  );
}