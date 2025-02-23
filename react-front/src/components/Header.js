import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearInfo } from "../store/UsersSlice";
import { jwtDecode } from "jwt-decode";
import "../css/Header.css";
import apiAxios from "../lib/apiAxios";

export default function Header() {
  const user = useSelector((state) => state.users.value);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [nickname, setNickname] = useState("guest");
  let uno = null;
  // 로그아웃
  const logout = (e) => {
    e.preventDefault();
    dispatch(clearInfo());
    alert("로그아웃 되었습니다.");
    navigate("/login");
  };
  
  // 검색 창
  const searchHandler = () => {
    if (search.trim()) {
      navigate(`/classList?search=${encodeURIComponent(search)}`);
    }
  };


  // 엔터키 입력 처리 함수
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchHandler();
    }
  };

  // JWT 토큰 디코딩
  if (user.token) {
    const decodeToken = jwtDecode(user.token);
    const grade = decodeToken.grade === 1 ? "강사" : "수강생";
    uno = decodeToken.sub;
  }
  useEffect(() => {
    if (user.token) {
      apiAxios.get(`/getNickname/${uno}`
      ).then((res) => {
        setNickname(res.data.nickname);
      }).catch((err) => {
        console.error("요청 에러:", err);
      });
    }
  }, [user.token]);

  const location = useLocation();
  if (location.pathname === "/login") {
    return null;
  }

  return (
    <header>
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">
            <img src="/img/Logo.png" alt="Learnify Logo" className="logo" />
          </Link>
        </div>
        <nav>
          <ul>
            <li>
              <span className="classList">
                <Link to="/classList">강의 목록</Link>
              </span>
            </li>
            <li>
              <span className="dashboard">
                <Link to="/dashboard">대시보드</Link>
              </span>
            </li>
            <li>
              <div className="search">
                <input
                  type="text"
                  className="search-input"
                  placeholder="강의를 검색해보세요."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <img
                  src="/img/search.png"
                  alt="Search"
                  className="search-icon"
                  onClick={searchHandler}
                  role="button"
                />
              </div>
            </li>
            <li>
              {user.token ? (
                <>
                  <Link to="/mypage" className="user-link">
                    {nickname}님
                  </Link>
                  <span>| </span>
                  <span role="button" onClick={logout} className="logout-link">
                    로그아웃
                  </span>
                </>
              ) : (
                <Link to="/login">로그인</Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
