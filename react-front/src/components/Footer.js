import React from 'react';
import '../css/Footer.css';

export default function Footer() {
    return (
        <>
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-info">
                    <div className="footer-links">
                        <a href="#" className="link">개인정보처리방침</a>
                        <a href="#" className="link">이용약관</a>
                        <a href="#" className="link">이메일수집거부</a>
                    </div>
                        <p>
                            (주)Learnify | 대표자: 이형준 | 사업자번호: 123-45-67890<br />
                            개인정보보호책임자 : 이형준 | 이메일 : example@gmail.com<br />
                            전화번호 : 010 - 1234 - 1234 | 주소 : 서울 영등포구 선유동2로 57 이레빌딩 19층
                            <br />
                            ©LEARNIFY. ALL RIGHTS RESERVED
                        </p>
                    </div>
                <img src="/img/Logo2.png" alt="Logo black" />
                </div>
            </footer>
        </>
    );
}
