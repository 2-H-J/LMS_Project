package com.kh.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.dto.KakaoDTO;
import com.kh.dto.UsersDTO;
import com.kh.service.KakaoService;
import com.kh.service.UsersService;
import com.kh.token.JwtTokenProvider;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UsersController {
	private final UsersService usersService;
	private final KakaoService kakaoService;
	private final JwtTokenProvider tokenProvider;

	public UsersController(UsersService usersService, KakaoService kakaoService, JwtTokenProvider tokenProvider) {
		this.usersService = usersService;
		this.kakaoService = kakaoService;
		this.tokenProvider = tokenProvider;
	}

	@PostMapping("/users/login")
	public Map<String, Object> login(@RequestBody Map<String, String> map) {
		Map<String, Object> result = new HashMap<>();
		String id = map.get("id");
		String passwd = map.get("passwd");
		UsersDTO member = usersService.login(id, passwd);
		boolean flag = false;
		if (member != null) {
			String token = tokenProvider.generateJwtToken(member);
			flag = true;
			result.put("token", token);
			result.put("flag", flag);
		}
		result.put("flag", flag);

		return result;
	}

	@ResponseBody
	@PostMapping("/register")
	public Map<String, Object> register(@RequestBody Map<String, String> body) {
		Map<String, Object> map = new HashMap<>();
		String id = body.get("id");
		String password = body.get("password");
		String name = body.get("username");
		String nickname = body.get("nickname");
		String email = body.get("email");
		String phone = body.get("phone");
		int grade = "student".equals(body.get("role")) ? 2 : 1;
		UsersDTO dto = new UsersDTO(name, id, nickname, password, email, phone, grade);
		int count = usersService.insertUser(dto);
		map.put("count", count);
		if (count > 0) {
			map.put("msg", "회원가입 완료");
		} else {
			map.put("msg", "회원 가입 실패, 입력하신 데이터를 확인해주세요.");
		}
		return map;
	}

	@PostMapping("/check/id")
	public boolean checkId(@RequestBody Map<String, String> body) {
		String id = body.get("id");
		return usersService.checkIdExists(id);
	}

	@PostMapping("/check/nickname")
	public boolean checkNickName(@RequestBody Map<String, String> body) {
		String nickname = body.get("nickname");
		return usersService.checkNickNameExists(nickname);
	}

	@PostMapping("/MypageInfo")
	public Map<String, Object> userInfo(@RequestHeader("Authorization") String token) {
		Map<String, Object> map = new HashMap<>();
		int usertype = tokenProvider.getUserTypeFromToken(removeBearer(token));
		if (usertype == 0) {
			UsersDTO user = usersService.findUserByUno(tokenProvider.getUserNumberFromToken(removeBearer(token)));
			map.put("name", user.getName());
			map.put("phone", user.getPhone());
			map.put("email", user.getEmail());
			map.put("nickname", user.getNickname());
			map.put("grade", user.getGrade());
		} else if (usertype == 1) {
			KakaoDTO kakaoDto = kakaoService.findKakaoByUno(tokenProvider.getUserNumberFromToken(removeBearer(token)));
			map.put("name", kakaoDto.getName());
			map.put("phone", kakaoDto.getPhone());
			map.put("email", kakaoDto.getEmail());
			map.put("nickname", kakaoDto.getNickname());
			map.put("grade", kakaoDto.getGrade());
		} else {
			map.put("msg", "유효하지 않은 계정 정보입니다.");
		}
		map.put("usertype", usertype);
		return map;
	}

	@GetMapping("/GetUserProfile")
	public ResponseEntity<Map<String, Object>> getUserProfile(@RequestHeader("Authorization") String token) {
		UsersDTO user = usersService.findUserByUno(tokenProvider.getUserNumberFromToken(removeBearer(token)));

		Map<String, Object> response = new HashMap<>();
		System.out.println("getProfileimg:" + user.getProfileimg());
		String nickname = user.getNickname();
		System.out.println(nickname);
		response.put("nickname", nickname);
		if (user.getProfileimg() != null && user.getProfileimg().length > 0) {
			// BLOB 데이터를 Base64로 변환
			String base64Image = Base64.getEncoder().encodeToString(user.getProfileimg());
			response.put("profileImg", "data:image/png;base64," + base64Image);
		} else {
			response.put("profileImg", null); // 빈 값이거나 NULL이면 null 반환
		}

		return ResponseEntity.ok(response);
	}

	@PostMapping("/UpdateUserProfile")
	public Map<String, Object> userupdate(@RequestHeader("Authorization") String token,
			@RequestPart(value = "file", required = false) MultipartFile file) {
		System.out.println(file == null ? "파일 엄슴" : "파일 있습");

		// 1) 토큰에서 사용자번호 추출 + DB 조회
		UsersDTO user = usersService.findUserByUno(tokenProvider.getUserNumberFromToken(removeBearer(token)));
		HashMap<String, Object> map = new HashMap<>();

		// 2) 업로드된 파일이 있는 경우
		if (file != null && !file.isEmpty()) {
			try {
				byte[] fileData = file.getBytes();
				user.setProfileimg(fileData);
				usersService.updateprofileimg(user);

				map.put("message", "프로필 이미지가 DB에 저장되었습니다.");
				map.put("fileSize", fileData.length); // 파일 크기만 로그에 출력
				System.out.println("업로드된 파일 크기: " + fileData.length + " bytes");
			} catch (IOException e) {
				e.printStackTrace();
				map.put("error", "파일 업로드 중 오류 발생: " + e.getMessage());
				return map;
			}
		}

		// 3) 업로드된 파일이 없는 경우(프로필 제거)
		else {
			user.setProfileimg(null); // BLOB 컬럼을 NULL로 설정
			System.out.println(user.getProfileimg());
			usersService.updateprofileimg(user);
			System.out.println(user.getProfileimg());

			map.put("message", "프로필 이미지를 제거했습니다.");
		}

		return map;
	}

	@PatchMapping("/Updateuserinfo")
	public HashMap<String, Object> updateuserinfo(@RequestBody HashMap<String, Object> map,
			@RequestHeader("Authorization") String token) {
		String removedToken = removeBearer(token);
		String uno = tokenProvider.getUserNumberFromToken(removedToken);
		map.put("uno", uno);

		int userType = tokenProvider.getUserTypeFromToken(removedToken);

		if (userType == 0) {
			usersService.updateUserInfo(map);
		} else if (userType == 1) {
			kakaoService.updateKakaoInfo(map);
		} else {
			map.clear();
			map.put("msg", "유효하지 않은 계정 정보입니다.");
			return map;
		}
		map.put("msg", "업데이트 완료");
		return map;
	}

	@PostMapping("/CheckUser")
	public HashMap<String, Object> checkPassword(@RequestBody HashMap<String, Object> map,
			@RequestHeader("Authorization") String token) {
		System.out.println(map);
		HashMap<String, Object> result = new HashMap<>();
		String uno = tokenProvider.getUserNumberFromToken(removeBearer(token));
		map.put("uno", uno);
		int checkedUser = usersService.checkUser(map);
		if (checkedUser >= 1) {
			result.put("status", true);
			result.put("msg", "계정 확인 성공");
			return result;
		} else {
			result.put("status", false);
			result.put("msg", "계정 확인 실패");
			return result;
		}
	}

	@PostMapping("/UpdatePassword")
	public Map<String, Object> updatePassword(@RequestBody Map<String, Object> map,
			@RequestHeader("Authorization") String token) {
		Map<String, Object> result = new HashMap<>();
		String uno = tokenProvider.getUserNumberFromToken(removeBearer(token));
		map.put("uno", uno);
		int work = usersService.updatePassword(map);
		if (work >= 1) {
			result.put("msg", "비밀번호 변경 완료");
		} else {
			result.put("msg", "비밀번호 변경 실패");
		}
		return result;
	}

	@PostMapping("/DeleteUser")
	public HashMap<String, Object> deleteUser(@RequestHeader("Authorization") String token) {
		HashMap<String, Object> result = new HashMap<>();
		String uno = tokenProvider.getUserNumberFromToken(removeBearer(token));
		int del = usersService.deleteUno(uno);
		if (del == 1) {
			result.put("msg", "회원 삭제 완료");
			return result;
		} else {
			result.put("msg", "회원 삭제 실패");
			return result;
		}
	}

	private String removeBearer(String token) {
		return token != null && token.startsWith("Bearer ") ? token.substring("Bearer ".length()).trim() : null;
	}

	@PostMapping("/findPassword")
	public Map<String, Object> findPassword(@RequestBody Map<String, String> body) {
		HashMap<String, Object> map = new HashMap<>();
		String uno = body.get("uno");
		String pwd = body.get("pwd");
		int result = usersService.findPassword(uno, pwd);
		if (result == 1) {
			map.put("msg", "비밀번호가 변경되었습니다.");
			map.put("code", 1);
		} else {
			map.put("msg", "비밀번호 변경에 실패하였습니다.");
			map.put("code", 2);
		}
		return map;
	}
	
	@GetMapping("/getNickname/{uno}")
	public Map<String, Object> getNickname(@PathVariable String uno){
		Map<String, Object> map = new HashMap<>();
		System.out.println(uno);
		UsersDTO dto = usersService.findUserByUno(uno);
		String nickname = dto.getNickname();
		map.put("nickname", nickname);
		return map;
	}
}