import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiAxios from "../lib/apiAxios";
import "../css/Quiz.css";
import { useSelector } from "react-redux";

export default function Quiz() {
    const { chapterNumber, classNumber } = useParams();
    const [quizzes, setQuizzes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [chapterName, setChapterName] = useState(""); // 챕터명 상태 추가
    const [correctCount, setCorrectCount] = useState(0); // 정답 개수 상태 추가
    const token = useSelector(state => state.users.value.token);
    const navigator = useNavigate();

    useEffect(() => {
        if (!chapterNumber) return;

        // 퀴즈 목록을 가져오는 요청
        apiAxios.get(`/quiz/list/${chapterNumber}`)
            .then((res) => {
                setQuizzes(res.data.quizList);
                setChapterName(res.data.chapterName); // 챕터명 저장
            })
            .catch((err) => console.error(err));

        // 진행률 정보를 별도로 가져오는 요청
        apiAxios.get(`/quiz/progress/${chapterNumber}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => {
                const progressCount = res.data.progressCount || 0; // 진행률 정보
                setCurrentIndex(progressCount);
            })
            .catch((err) => console.error("진행률 정보 가져오기 실패:", err));
    }, [chapterNumber, token]);

    const handleAnswer = (answer) => {
        setSelectedAnswer(answer);
        setShowExplanation(true);
    };

    const handleNext = () => {
        if (!selectedAnswer) return; // 사용자가 답을 선택하지 않았으면 진행 불가

        const data = {
            chapterNumber,
            quizId: quizzes[currentIndex].quizId,
            selectedAnswer,
            isCorrect: selectedAnswer === quizzes[currentIndex].answer,
            progressCount: currentIndex + 1,
            totalQuizzes: quizzes.length
        };

        apiAxios.post("/quiz/submit", data, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => {
                if (currentIndex < quizzes.length - 1) {
                    setCurrentIndex(prevIndex => prevIndex + 1);
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                } else {
                    setIsFinished(true);
                    // ✅ 퀴즈 종료 후 정답 개수 가져오기
                    apiAxios.get(`/quiz/correctCount/${chapterNumber}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                        .then((res) => {
                            setCorrectCount(res.data.correctCount);
                        })
                        .catch((err) => console.error("정답 개수 가져오기 실패:", err));
                }
            })
            .catch(err => console.error("퀴즈 저장 실패:", err));
    };

    return (
        <div className="quiz-container">
            {!isFinished ? (
                quizzes.length > 0 && (
                    <div className="quiz-content">
                        <p className="chapter-name">챕터 : {chapterName} </p> {/* 챕터명 표시 */}
                        <hr/>
                        <p className="quiz-progress">진행률: {currentIndex + 1} / {quizzes.length}</p>
                        <h2>{currentIndex + 1}. {quizzes[currentIndex].question}</h2>

                        <div className="quiz-options">
                            <button
                                className={`quiz-button ${selectedAnswer === "O" ? "selected" : ""}`}
                                onClick={() => handleAnswer("O")}
                                disabled={showExplanation}
                            >O</button>
                            <button
                                className={`quiz-button ${selectedAnswer === "X" ? "selected" : ""}`}
                                onClick={() => handleAnswer("X")}
                                disabled={showExplanation}
                            >X</button>
                        </div>

                        {showExplanation && (
                            <div className="quiz-explanation">
                                <p><strong>정답 : {quizzes[currentIndex].answer}</strong></p>
                                <p><strong>설명 : {quizzes[currentIndex].description}</strong></p>
                            </div>
                        )}

                        <div className="quiz-buttons">
                            <button onClick={handleNext} disabled={!showExplanation}>
                                {currentIndex < quizzes.length - 1 ? "다음" : "퀴즈 종료"}
                            </button>
                        </div>
                    </div>
                )
            ) : (
                <div className="quiz-result">
                    <div className="quiz-result-icon"></div>
                    <h2 className="quiz-result-title">수고하셨습니다!</h2>
                    <h2 className="quiz-result-progress">퀴즈 정답률 : {correctCount}/{quizzes.length}</h2>
                    <button className="quiz-exit-button" onClick={() => navigator(`/class/${classNumber}`)}>강의 바로가기</button>
                </div>
            )}
        </div>
    );
}