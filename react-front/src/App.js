import "./App.css";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./page/Login";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Register from "./page/Register";
import Main from "./page/Main";
import KaKaoRedirect from "./page/KaKaoRedirect";
import ClassList from "./page/ClassList";
import KakaoRegister from "./page/KakaoRegister";
import MypageInfo from "./page/MypageInfo";
import UserUpdate from "./page/UserUpdate";
import ClassPage from "./page/ClassPage";
import Notice from "./page/Notice";
import QNA from "./page/QNA";
import QNAWrite from "./page/QNAWrite";
import Mail from "./page/FindIdPage";
import FindIdPage from "./page/FindIdPage";
import FindPwdPage from "./page/FindPwdPage";
import Quiz from "./page/Quiz";
import DashBoard from "./page/DashBoard";
import DeleteUser from "./page/DeleteUser";
import UpdatePassword from "./page/UpdatePassword";
import Rate from "./page/Rate";
import RateWrite from "./page/RateWrite";
import VideoPage from './page/VideoPage';
import CheckUser from "./page/CheckUser";
import TeacherProfile from "./page/TeacherProfile";

function Layout() {
  const location = useLocation();
  const hideHeaderFooter = ["/login"].includes(location.pathname) || location.pathname.startsWith("/video/") || location.pathname.startsWith("/register");

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/kakao/login/oauth" element={<KaKaoRedirect />} />
        <Route path="/kakaoRegister" element={<KakaoRegister />} />
        <Route path="/register" element={<Register />} />
        <Route path="/classList" element={<ClassList />} />
        <Route path="/mypage" element={<MypageInfo />} />
        <Route path="/mypage/updateinfo" element={<UserUpdate />} />
        
        <Route path='/checkUser' element={<CheckUser />} />
        <Route path="/class/:classNumber" element={<ClassPage />} />
        <Route path="/class/:classNumber/notice" element={<Notice />} />
        <Route path="/class/:classNumber/qna" element={<QNA />} />
        <Route path="/class/:classNumber/qna/write" element={<QNAWrite />} />
        <Route path="/email" element={<Mail />} />
        <Route path="/find/id" element={<FindIdPage />} />
        <Route path="/find/pwd" element={<FindPwdPage />} />
        <Route path="/quiz/:classNumber/:chapterNumber" element={<Quiz />} />
        <Route path="/deleteUser" element={<DeleteUser />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/updatePassword" element={<UpdatePassword />} />
        <Route path="/class/:classNumber/rate" element={<Rate />} />
        <Route path="/class/:classNumber/rate/write" element={<RateWrite />} />
        <Route path='/video/:videoNumber' element={<VideoPage />} />
        <Route path="/teacherProfile/:uno" element={<TeacherProfile />} />
      </Routes>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;