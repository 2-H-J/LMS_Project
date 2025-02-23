import { useMemo } from "react";

export function useKakao() {
  
  const Kakao = useMemo(() => {
    if(!window.Kakao.isInitialized()) {
     window.Kakao.init("05d652b73c4d068ab46d5332d6959d95");
      // window.Kakao.init("3ee3b7036c2183d8a2fff2cab61e6a1a");
    }
    return window.Kakao;
  }, []);
  
  return Kakao;
}
