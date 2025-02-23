package com.kh.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.kh.dto.UsersProgressDTO;
import com.kh.mapper.UsersProgressMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsersProgressService {

    private final UsersProgressMapper usersProgressMapper;

    public boolean checkProgress(String uno, int classNumber) {
        return usersProgressMapper.checkProgress(uno, classNumber) > 0;
    }

    public int applicationInsert(String uno, int classNumber) {
        return usersProgressMapper.applicationInsert(uno, classNumber);
    }

    public int cancelProgress(String uno, int classNumber) {
        return usersProgressMapper.cancelProgress(uno, classNumber);
    }

    public List<UsersProgressDTO> selectRecentClasses(String uno) {
        return usersProgressMapper.selectRecentClasses(uno);
    }

}
