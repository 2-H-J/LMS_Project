import axios from "axios";

//baseURL, timeout 등 기본 설정을 가진 Axios 인스턴스
// 현재 실행 중인 환경의 hostname 확인 (localhost 또는 IP 자동 설정)
const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:9999" 
  : `http://${window.location.hostname}:9999`;

const apiAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
//요청 인터셉터 추가
apiAxios.interceptors.request.use(
  (config) => {
    console.log('request')
    //요청 전처리 부분
    console.log(config.method.toUpperCase(), ' - ', config.url);
    return config;
  },
  (error) => {
    //요청에 에러가 발생했을때 처리부분
    console.log(error)
    return Promise.reject(error);
  }
);

//응답 인터셉터 추가
apiAxios.interceptors.response.use(
  (response) => {
    //응답 전처리 부분
    console.log('reponse')
    console.log(response.data);
    console.log(response.config.method.toUpperCase(), ' - ', response.config.url);
    return response;
  },
  (error) => {  
    //응답에 에러가 발생했을때 처리부분
    console.log(error)
    return Promise.reject(error);
  }
)
export default apiAxios;