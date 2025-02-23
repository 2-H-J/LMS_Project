import { useRef } from 'react'
import { useNavigate , useLocation } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import '../css/CheckUser.css';


export default function CheckUser(props) {
  const checkpwRef = useRef(null);
  const checkidRef = useRef(null);
  const token = useSelector((state) => state.users.value.token);
  const navigator = useNavigate();
  const location = useLocation();


  const chekpwhandle = () => {
    const data = { "password" : checkpwRef.current.value , "id" : checkidRef.current.value };
  

    axios
    .post("http://localhost:9999/CheckUser", data, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      alert(res.data.msg);
      if (res.data.status) {
        navigator(location.state || "/");
      }
    });
  }
  
  return (
      <div className="checkuser-container">
        <div className="checkuser">
          <h2>아이디와 비밀번호를 입력해주세요</h2>
          <input className="checkid" type="text" placeholder="아이디 입력" ref={checkidRef}/>
          <input className="checkpw" type="password" placeholder="기존 비밀번호 입력" ref={checkpwRef}/>
          <button className="check-btn" onClick={chekpwhandle}>계정 확인</button>
        </div>
      </div>
  )
}
