package com.kh.controller;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.configurationprocessor.json.JSONException;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.kh.dto.KakaoDTO;
import com.kh.service.KakaoService;
import com.kh.service.UsersService;
import com.kh.token.JwtTokenProvider;


@CrossOrigin(allowedHeaders = "*", origins = "*")
@RestController
public class KakaoController {
	private final String REST_API_KEY = "aacd85e03b5e9a1d0876e649521fbbd1";
	private final String REDIRECT_URI = "http://localhost:3000/kakao/login/oauth";
	private final UsersService usersService;
	private final JwtTokenProvider tokenProvider;
	private final KakaoService kakaoService;

	public KakaoController(UsersService usersService, JwtTokenProvider tokenProvider, KakaoService kakaoService) {
		this.usersService = usersService;
		this.tokenProvider = tokenProvider;
		this.kakaoService = kakaoService;
	}

	@GetMapping("/kakao/token")
	public Map<String, Object> kakaoCallBack(String code) throws JSONException {
		Map<String, Object> result = new HashMap<>();

		// 1. 카카오 서버에서 access_token 요청
		String apiURL = "https://kauth.kakao.com/oauth/token?" + "grant_type=authorization_code" + "&client_id="
				+ REST_API_KEY + "&redirect_uri=" + REDIRECT_URI + "&code=" + code;

		String tokenResponse = requestKakaoServer(apiURL, null);

		if (tokenResponse == null || tokenResponse.isEmpty()) {
			result.put("msg", "카카오 토큰을 가져올 수 없습니다.");
			return result;
		}

		JSONObject jsonObject = new JSONObject(tokenResponse);
		String accessToken = jsonObject.optString("access_token");

		// 2. 카카오 프로필 요청
		String profile = getKakaoProfile(accessToken);
		if (profile == null || profile.isEmpty()) {
			result.put("msg", "프로필 정보를 가져오지 못했습니다.");
			return result;
		}

		JSONObject profileJson = new JSONObject(profile);
		String kakaoId = profileJson.optString("id");
		String email = profileJson.getJSONObject("kakao_account").optString("email");
		System.out.println(email);
		String nickname = profileJson.getJSONObject("properties").optString("nickname");

		if (kakaoId == null || kakaoId.isEmpty()) {
			result.put("msg", "카카오 아이디를 가져올 수 없습니다.");
			return result;
		}

		// 3. DB에서 kakaoId 조회
		int count = kakaoService.checkKakaoId(kakaoId);
		boolean flag = true;

		if (count == 0) {
			// 카카오 아이디가 없으면 이메일과 카카오 ID를 반환
			flag = false;
			result.put("msg", "가입되지 않은 사용자입니다.");
			result.put("email", email);
			result.put("kakaoId", kakaoId);
			result.put("flag", flag);
			return result;
		}

		// 4. 기존 회원이면 로그인 처리 (JWT 토큰 발급)
		KakaoDTO dto = kakaoService.kakaoLogin(kakaoId);

		if (dto == null) {
			result.put("msg", "로그인 처리 중 오류 발생");
			return result;
		}

		String token = tokenProvider.generateKakaoJwtToken(dto);

		result.put("token", token);
		result.put("flag", flag);
		return result;
	}

	@ResponseBody
	@PostMapping("/kakao/register")
	public Map<String, Object> register(@RequestBody Map<String, String> body) {
		Map<String, Object> map = new HashMap<>();
		String kakaoId = body.get("kakaoId");
		String name = body.get("name");
		String nickname = body.get("nickname");
		String email = body.get("email");
		String phone = body.get("phone");
		int grade = "student".equals(body.get("role")) ? 2 : 1;
		KakaoDTO dto = new KakaoDTO(kakaoId, name, nickname, email, phone, grade);
		int count = kakaoService.insertKakaoUser(dto);
		if (count > 0) {
			dto = kakaoService.kakaoLogin(kakaoId);
			String token = tokenProvider.generateKakaoJwtToken(dto);
			map.put("token", token);
		} else {
			map.put("msg", "가입 실패, 입력하신 데이터를 확인해주세요.");
		}
		return map;
	}
	/*
	 * @GetMapping("/kakao/profile") public String getProfile(String token) {
	 * System.out.println(token); String header = "Bearer " + token; String apiURL =
	 * "https://kapi.kakao.com/v2/user/me";
	 * 
	 * String res = requestKakaoServer(apiURL, header); System.out.println(res);
	 * return res; }
	 */

	@ResponseBody
	@PostMapping("/kakao/delete")
	public String deleteToken(@RequestBody String token) {
		System.out.println(token);
		String header = "Bearer " + token;
		String apiURL = "https://kapi.kakao.com/v1/user/unlink";

		String res = requestKakaoServer(apiURL, header);
		System.out.println(res);
		return res;
	}

	public String getKakaoProfile(String accessToken) {
		String header = "Bearer " + accessToken;
		String apiURL = "https://kapi.kakao.com/v2/user/me";

		return requestKakaoServer(apiURL, header);
	}

	public String requestKakaoServer(String apiURL, String header) {
		StringBuffer res = new StringBuffer();
		try {
			URL url = new URL(apiURL);
			HttpURLConnection con = (HttpURLConnection) url.openConnection();
			con.setRequestMethod("GET");
			if (header != null && !header.equals("")) {
				con.setRequestProperty("Authorization", header);
			}

			int responseCode = con.getResponseCode();
			BufferedReader br;
			System.out.print("responseCode=" + responseCode);
			if (responseCode == 200) { // 정상 호출
				br = new BufferedReader(new InputStreamReader(con.getInputStream()));
			} else { // 에러 발생
				br = new BufferedReader(new InputStreamReader(con.getErrorStream()));
			}
			String inputLine;
			while ((inputLine = br.readLine()) != null) {
				res.append(inputLine);
			}
			br.close();
			if (responseCode == 200) {
				System.out.println(res.toString());
			}
		} catch (Exception e) {
			System.out.println(e);
		}
		return res.toString();
	}

}