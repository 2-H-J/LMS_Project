import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import apiAxios from "../lib/apiAxios";
import "../css/Chat.css";
import { useNavigate } from "react-router-dom";

function Chat({ classNumber }) {
  const ws = useRef(null);
  const user = useSelector((state) => state.users.value);
  const chatContainerRef = useRef(null); // 👈 채팅창 스크롤 조절을 위한 ref
  const navigate = useNavigate();
  // 수강 여부 / 강사 여부
  const [isEnrolled, setIsEnrolled] = useState(null);
  const [isInstructor, setIsInstructor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  // -------------------------------
  // (1) 두 API를 Promise.all로 동시에 호출
  // -------------------------------
  useEffect(() => {
    if (!user?.token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [progressRes, classRes] = await Promise.all([
          apiAxios.get(`/usersProgress/check?classNumber=${classNumber}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          apiAxios.get(`/class/${classNumber}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        setIsEnrolled(progressRes.data.isEnrolled);
        const instructorUno =
          classRes.data.class?.uno || classRes.data.uno;
        const myUno = user?.token ? jwtDecode(user.token).sub : null;
        setIsInstructor(String(instructorUno) === String(myUno));
      } catch (error) {
        console.error("API 호출 중 오류:", error);
        setIsEnrolled(false);
        setIsInstructor(false);
      }
    };

    fetchData();
  }, [classNumber, user.token]);

  // -------------------------------
  // (2) 두 상태가 모두 결정된 이후에만 WebSocket 연결 시도
  // -------------------------------
  useEffect(() => {
    if (isEnrolled === null || isInstructor === null) return;
    if (!isEnrolled && !isInstructor) {
      console.log("🚨 수강생도 아니고 강사도 아닙니다. WebSocket 연결 생략.");
      return;
    }

    const myUno = user?.token ? jwtDecode(user.token).sub : null;
    if (!myUno) {
      console.error("🚨 Invalid Token: WebSocket 연결 중단");
      return;
    }
    const SOCKET_URL = `ws://localhost:9999/chat?uno=${myUno}&classNumber=${classNumber}`;
    ws.current = new WebSocket(SOCKET_URL);

    ws.current.onopen = () => {
      console.log("✅ WebSocket 연결됨!");
    };

    ws.current.onmessage = (event) => {
      console.log("📩 받은 메시지:", event.data);
      try {
        const parsedMessage = JSON.parse(event.data); // JSON 문자열을 객체로 변환
        console.log("📩 받은 메시지(파싱된 데이터):", parsedMessage);

        setMessages((prev) => [...prev, parsedMessage]); // 객체를 배열에 추가
      } catch (error) {
        console.error("JSON 파싱 오류:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("❌ WebSocket 연결 종료됨!");
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [isEnrolled, isInstructor, classNumber, user.token]);

  // -------------------------------
  // (3) 메시지 추가 시 채팅 창만 스크롤
  // -------------------------------
  useEffect(() => {
    if (!chatContainerRef.current) return; // 💡 chatContainerRef.current가 null이면 실행하지 않음

    const scrollTop = chatContainerRef.current.scrollTop; // 현재 스크롤 위치 (위에서 얼마나 내려왔는지)
    const scrollHeight = chatContainerRef.current.scrollHeight; // 전체 스크롤 가능한 높이
    const clientHeight = chatContainerRef.current.clientHeight; // 현재 보이는 영역 높이
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100; // 스크롤이 맨 아래인지 확인
    if (chatContainerRef.current && isAtBottom) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // 메시지가 변경될 때마다 실행

  // -------------------------------
  // (4) 메시지 전송
  // -------------------------------
  const sendMessage = () => {
    if (ws.current && inputMessage.trim() !== "") {
      ws.current.send(inputMessage);
      setInputMessage("");
    }
  };



  return (
    <div className="web-socket-container">
      <h2>📝 채팅 (강의번호: {classNumber})</h2>
      {isEnrolled === null || isInstructor === null ? (
        <p>⏳ 수강/강사 여부 확인 중...</p>
      ) : !isEnrolled && !isInstructor ? (
        <p>🚨 이 강의를 수강하지 않은 사용자입니다.</p>
      ) : (
        <>
          <p>📌 현재 상태: {isInstructor ? "👨‍🏫 강사" : "✅ 수강 중"}</p>
          <div
            className="chat-container"
            ref={chatContainerRef}
            style={{
              height: "400px",
              overflowY: "scroll",
              border: "1px solid gray",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {messages.map((msg, idx) => {
              const isMe = String(msg.uno) === String(jwtDecode(user.token).sub);
              const isInstructor = String(msg.uno) === String(msg.lectureUno); // 🔹 강사 여부 확인

              return (
                <p key={idx} className={isMe ? "me" : "others"}>
                  {!isMe ? msg.nickname + (isInstructor ? " (강사)" : "") + " : " : ""}
                  {msg.message}
                </p>
              );
            })}
          </div>
          <div className="input-block">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="메시지를 입력하세요..."
            />
            <button onClick={sendMessage} className="send-button">전송</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Chat;
