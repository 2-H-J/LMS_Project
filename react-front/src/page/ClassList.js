import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import apiAxios from "../lib/apiAxios";
import "../css/ClassList.css";
import { jwtDecode } from "jwt-decode";
import ClassWrite from "./ClassWrite";

export default function ClassList() {
  const [classes, setClasses] = useState([]);
  const [visibleClasses, setVisibleClasses] = useState([]);
  const [category, setCategory] = useState("전체");
  const [sort, setSort] = useState("최신순");
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [grade, setGrade] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const searchKeyword = queryParams.get("search") || "";

  // 강의 목록을 불러오는 함수
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    console.log("정렬 방식 확인:", sort); // 정렬 방식 확인
    try {
      const response = await apiAxios.get("/class/search", {
        params: { category, sort, searchKeyword },
      });

      let sortedClasses = response.data.classList || [];

      sortedClasses = sortedClasses.map(classItem => ({
        ...classItem,
        thumbnail: classItem.thumbnail?.startsWith("data:image") ? classItem.thumbnail : "/img/default_thumbnail.png"
    }));

      setClasses(sortedClasses);
    } catch (error) {
      console.error("강의 목록을 가져오는 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  }, [category, sort, searchKeyword]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    setVisibleClasses(classes.slice(0, visibleCount));
  }, [classes, visibleCount]);

  const user = useSelector((state) => state.users.value);
  useEffect(() => {
    if (user.token) {
      const decodeToken = jwtDecode(user.token);
      setGrade(decodeToken.grade);
    }
  }, [user]);

  // "강의 더 보기" 버튼 클릭 시 추가 데이터 로드
  const loadMoreClasses = () => {
    const newVisibleCount = visibleCount + 4;
    setVisibleCount(newVisibleCount);
    setVisibleClasses(classes.slice(0, newVisibleCount));
  };

  // 강의 클릭 시 해당 강의 페이지로 이동
  const handleClassClick = (classNumber) => {
    navigate(`/class/${classNumber}`);
  };

  return (
    <div className="class-list-container">
      <div className="class-list-header">
        <h2>이곳에서는 수많은 <strong>다양한 강의</strong>를 접할 수 있습니다.</h2>
      </div>

      <div className="class-list-filter">
        <div className="class-insert-button-container">
          {grade === 1 && (
            <button className="class-insert-button" onClick={() => setShowWriteModal(true)}>
              강의 등록하기
            </button>
          )}
        </div>

        <div className="class-list-dropdown-group">
          <select
            className="class-list-dropdown"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="전체">전체</option>
            <option value="Java">Java</option>
            <option value="Python">Python</option>
            <option value="C">C</option>
            <option value="C++">C++</option>
            <option value="C#">C#</option>
            <option value="JavaScript">JavaScript</option>
            <option value="TypeScript">TypeScript</option>
            <option value="SQL">SQL</option>
            <option value="Kotlin">Kotlin</option>
            <option value="Swift">Swift</option>
            <option value="Rust">Rust</option>
            <option value="Ruby">Ruby</option>
            <option value="PHP">PHP</option>
            <option value="HTML/CSS">HTML/CSS</option>
          </select>

          <select
            className="class-list-dropdown"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="최신순">최신순</option>
            <option value="평점순">평점순</option>
          </select>
        </div>
      </div>

      <div className="class-list-grid-container">
        <div className="class-list-grid">
          {loading ? (
            <p>강의 목록을 불러오는 중...</p>
          ) : visibleClasses.length === 0 ? (
            <p>강의가 없습니다.</p>
          ) : (
            visibleClasses.map((classItem) => (
              <div
                className="class-list-card"
                key={classItem.classNumber}
                onClick={() => handleClassClick(classItem.classNumber)}
                style={{ cursor: "pointer" }}
              >
                <div className="class-list-thumbnail">
                  <img
                    src={classItem.thumbnail}
                    alt={classItem.title}
                    className="thumbnail-image"
                  />
                </div>
                <div className="class-list-details">
                  <span className="class-list-category">{classItem.category}</span>
                  <h3 className="class-list-title">{classItem.title}</h3>
                  <p className="class-list-instructor">{classItem.name}</p>
                  <p className="class-list-date">{classItem.createTime.substring(0, 10)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {visibleCount < classes.length && (
        <button className="class-list-load-more" onClick={loadMoreClasses}>
          강의 더 보기
        </button>
      )}

      {showWriteModal && (
        <ClassWrite
          onClose={() => setShowWriteModal(false)}
          onClassAdded={fetchClasses} // 강의 등록 후 목록 자동 업데이트
        />
      )}
    </div>
  );
}
