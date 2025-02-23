package com.kh.controller;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.kh.dto.TeacherDTO;
import com.kh.service.ClassService;
import com.kh.service.TeacherService;
import com.kh.service.UsersService;
import com.kh.token.JwtTokenProvider;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TeacherController {
	private final UsersService usersService;
	private final TeacherService teacherService;
	private final ClassService classService;
	private final JwtTokenProvider tokenProvider;


	public TeacherController(UsersService usersService, TeacherService teacherService, ClassService classService,
			JwtTokenProvider tokenProvider) {
		this.usersService = usersService;
		this.teacherService = teacherService;
		this.classService = classService;
		this.tokenProvider = tokenProvider;
	}

	@GetMapping("/teacherProfile/{uno}")
    public Map<String, Object> getTeacherProfile(@PathVariable String uno) {
        Map<String, Object> map = new HashMap<>();
        System.out.println(uno);
		TeacherDTO dto = teacherService.getTeacherProfile(uno);
		if(dto == null) {
			map.put("msg", "강사 소개가 없습니다.");
			return map;
		}
		if (dto.getProfileimg() != null && dto.getProfileimg().length > 0) {
			// BLOB 데이터를 Base64로 변환
			String base64Image = Base64.getEncoder().encodeToString(dto.getProfileimg());
			map.put("profileImg", "data:image/png;base64," + base64Image);
		} else {
			map.put("profileImg", null); // 빈 값이거나 NULL이면 null 반환
		}
		System.out.println(dto);
        map.put("dto", dto);
        return map;
    }
	
	@PostMapping("/updateTeacherProfile")
	public Map<String, Object> updateTeacherProfile(@RequestBody Map<String, String> body){
		Map<String, Object> map = new HashMap<>();
		String uno = body.get("uno");
		String teacherPhone = body.get("teacherPhone");
		String teacherEmail = body.get("teacherEmail");
		String teacherAvailableTime = body.get("teacherAvailableTime");
		String teacherContent = body.get("teacherContent");
		TeacherDTO dto = new TeacherDTO();
		dto.setUno(uno);
		dto.setTeacherPhone(teacherPhone);
		dto.setTeacherEmail(teacherEmail);
		dto.setTeacherAvailableTime(teacherAvailableTime);
		dto.setTeacherContent(teacherContent);
		int count = teacherService.saveTeacherProfile(dto);
		if(count ==1) {
			map.put("msg", "프로필 정보가 저장되었습니다.");
		}else {
			map.put("msg", "프로필 정보 저장에 실패하였습니다.");
		}
		return map;
	}
}
