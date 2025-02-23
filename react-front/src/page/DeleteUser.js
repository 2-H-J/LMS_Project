import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "../css/DeleteUser.css";

export default function DeleteUser() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.users.value.token);
  const deletehandle = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      axios
        .post(
          "http://localhost:9999/DeleteUser",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((res) => {
          alert(res.data.msg);
          navigate('/');
        })
        .catch((error) => {
          console.error("회원 탈퇴 중 에러 발생:", error);
          alert("회원 탈퇴에 실패했습니다. 다시 시도해주세요.");
        });
    } else {
      alert("회원 탈퇴가 취소되었습니다.");
      console.log("삭제 취소");
    }
  };

  return (
    <div className="delete-container">
      <h1>정말 탈퇴 하시겠습니까?</h1>
      <p>앞으로 저희 서비스를 이용하실 수 없으며<br></br>환불도 불가합니다.</p>
      <button onClick={deletehandle}>회원 탈퇴</button>
    </div>
  );
}