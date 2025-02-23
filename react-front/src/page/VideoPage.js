import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/VideoPage.css";
import apiAxios from "../lib/apiAxios";
import YouTube from "react-youtube";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

const VideoPage = () => {
    const { videoNumber } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.users.value);

    const [videoInfo, setVideoInfo] = useState(null);
    const [prevVideoId, setPrevVideoId] = useState(null);
    const [nextVideoId, setNextVideoId] = useState(null);
    const [classTitle, setClassTitle] = useState("");
    const [chapterTitle, setChapterTitle] = useState("");
    const [classNumber, setClassNumber] = useState(null);

    const [player, setPlayer] = useState(null);
    const [lastWatchedTime, setLastWatchedTime] = useState(0);
    const [watchedPercentage, setWatchedPercentage] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false); // 외부 재생 차단 여부

    const intervalRef = useRef(null);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        if (user.token) {
            const decodedToken = jwtDecode(user.token);
            const uno = decodedToken.sub;

            // 기존 요청 취소
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            // 영상 정보 불러오기
            apiAxios.get(`/video/${videoNumber}`, { signal: abortController.signal })
                .then((response) => {
                    if (response.data.code === 1) {
                        const videoData = response.data.video;

                        setVideoInfo(videoData);
                        setClassTitle(response.data.classTitle ?? "강의 정보 없음");
                        setChapterTitle(response.data.chapterTitle ?? "챕터 정보 없음");
                        setClassNumber(videoData.classNumber);
                        setVideoDuration(videoData.videoDuration);
                        setIsBlocked(false); // 영상 차단 여부 초기화

                        // 이전/다음 영상 정보 불러오기
                        apiAxios.get(`/video/${videoNumber}/navigation/${videoData.classNumber}`, { signal: abortController.signal })
                            .then((navResponse) => {
                                setPrevVideoId(navResponse.data.prevVideoId ?? null);
                                setNextVideoId(navResponse.data.nextVideoId ?? null);
                            });

                        startOrGetVideoProgress(uno, videoData.videoDuration, abortController);
                    }
                })
                .catch((error) => {
                    if (error.name === "CanceledError") return;
                    console.error("영상 정보를 불러오는 데 실패했습니다.", error);
                });

            return () => {
                abortController.abort();
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            };
        }
    }, [videoNumber, user.token]);


    // 시청 기록 자동 생성 또는 불러오기
    const startOrGetVideoProgress = (uno, duration, abortController) => {
        apiAxios.get(`/videoProgress/${uno}/${videoNumber}`, { signal: abortController.signal })
            .then((res) => {
                if (res.data.code === 1) {
                    const progress = res.data.progress;
                    setLastWatchedTime(progress.lastWatchedTime);
                    setWatchedPercentage(progress.watchedPercentage);
                    setCompleted(progress.completed);
                } else {
                    createVideoProgress(uno, duration);
                }
            })
            .catch((err) => {
                console.error("시청 기록 불러오기 실패:", err);
                createVideoProgress(uno, duration);
            });
    };

    const createVideoProgress = (uno, duration) => {
        if (isBlocked) return; // 외부 재생 차단된 영상은 저장하지 않음

        apiAxios.post("/videoProgress/start", {
            uno, videoNumber, lastWatchedTime: 0, watchedPercentage: 0, completed: 0, videoDuration: duration
        }).then(() => {
            setLastWatchedTime(0);
            setWatchedPercentage(0);
            setCompleted(0);
        }).catch(err => console.error("시청 기록 생성 실패:", err));
    };

    // YouTube Player 설정
    const onPlayerReady = (event) => {
        console.log("YouTube Player 준비 완료");
        setPlayer(event.target);

        // 마지막 시청 기록이 있으면 해당 시간으로 이동, 없으면 0초부터 시작
        if (lastWatchedTime > 0) {
            event.target.seekTo(lastWatchedTime, true);
        } else {
            event.target.seekTo(0, true);
        }
        startTrackingProgress(event.target);
    };

    const onPlayerError = (event) => {
        if (event.data === 150 || event.data === 101) {
            console.error("🚫 외부 재생이 차단된 영상입니다.");
            setIsBlocked(true);
        }
    };

    // YouTube 영상 상태 변경 감지
    const onStateChange = (event) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            console.log("영상 재생 시작 - 시청 기록 추적 시작");
            startTrackingProgress(event.target);
        } else if (event.data === window.YT.PlayerState.PAUSED) {
            console.log("영상 일시 정지 - 현재 상태 저장");
            updateVideoProgress(player?.getCurrentTime(), watchedPercentage, completed);
        } else if (event.data === window.YT.PlayerState.ENDED) {
            console.log("영상 종료 - 시청 기록 완료 처리");
            updateVideoProgress(videoDuration, 100, 1); // 100% 완료 처리
        }
    };

    // player가 설정되면 자동으로 마지막 본 위치로 이동
    useEffect(() => {
        if (player && lastWatchedTime > 0) {
            console.log(`마지막 본 위치(${lastWatchedTime}초)로 이동`);
            player.seekTo(lastWatchedTime, true);
        }
    }, [player]);

    // 5초마다 시청 기록 업데이트
    const startTrackingProgress = (playerInstance) => {
        if (!playerInstance) return;

        // 기존 인터벌 정리
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            console.log("기존 인터벌 제거 완료");
        }

        intervalRef.current = setInterval(() => {
            if (!playerInstance) return;

            const currentTime = playerInstance.getCurrentTime();
            const percentage = (currentTime / videoDuration) * 100;

            // 100% 완료된 경우 업데이트 방지
            if (watchedPercentage >= 100 && completed === 1) {
                console.log("이미 100% 완료된 영상 - 업데이트 중단");
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                return;
            }

            setLastWatchedTime(currentTime);
            setWatchedPercentage(percentage);

            if (percentage >= 100) {
                setCompleted(1);
            }

            updateVideoProgress(currentTime, percentage, completed);
        }, 5000);
    };

    // 페이지 벗어나면 인터벌 정리
    useEffect(() => {
        return () => {
            console.log("영상 페이지를 벗어남 - 시청 기록 추적 중단");
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setPlayer(null);
        };
    }, []);

    // 시청 기록 서버 업데이트
    const updateVideoProgress = (lastTime, percentage, isCompleted) => {
        if (!user.token) return;
        const decodedToken = jwtDecode(user.token);
        const uno = decodedToken.sub;

        if (watchedPercentage >= 100 && completed === 1) return;

        apiAxios.put("/videoProgress/update", {
            uno, videoNumber, lastWatchedTime: lastTime, watchedPercentage: percentage, completed: isCompleted
        }).catch(err => console.error("시청 기록 업데이트 실패:", err));
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    if (!videoInfo) {
        return <div className="video-loading">영상 정보를 불러올 수 없습니다.</div>;
    }

    return (
        <div className="video-fullscreen-container">
            {/* 상단 네비게이션 바 */}
            <div className="video-header">
                <button className="back-button" onClick={() => navigate(`/class/${classNumber}`)}></button>
                <div className="video-info">
                    <span>{classTitle}</span>
                    <span> | </span>
                    <span>{chapterTitle}</span>
                    <span> | </span>
                    <span>{videoInfo.videoTitle}</span>
                </div>
            </div>

            {/* 유튜브 영상 */}
            <div className="video-iframe-container">
                {!isBlocked ? (
                    <YouTube className="youtube-iframe"
                        videoId={videoInfo.videoId}
                        opts={{
                            width: "100%",
                            height: "100%",
                            playerVars: {
                                autoplay: 1,
                                controls: 1,
                                modestbranding: 1,
                                rel: 0,
                                showinfo: 0
                            }
                        }}
                        onReady={onPlayerReady}
                        onStateChange={onStateChange}
                        onError={onPlayerError}
                    />
                ) : (
                    <div className="video-blocked">
                        <h2>이 영상은 외부 사이트에서 재생할 수 없습니다.</h2>
                    </div>
                )}
            </div>

            {/* 네비게이션 버튼 */}
            <div className="video-navigation">
                <span
                    className="nav-button prev"
                    onClick={prevVideoId ? () => navigate(`/video/${prevVideoId}`) : undefined}
                    style={{ opacity: prevVideoId ? 1 : 0.3, cursor: prevVideoId ? "pointer" : "default" }}
                >
                    <span className="nav-arrow"></span> 이전 영상
                </span>

                <span
                    className="nav-button next"
                    onClick={nextVideoId ? () => navigate(`/video/${nextVideoId}`) : undefined}
                    style={{ opacity: nextVideoId ? 1 : 0.3, cursor: nextVideoId ? "pointer" : "default" }}
                >
                    다음 영상 <span className="nav-arrow"></span>
                </span>
            </div>

        </div>
    );
};

export default VideoPage;