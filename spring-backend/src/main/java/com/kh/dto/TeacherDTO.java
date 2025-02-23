package com.kh.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDTO {
    private String uno;
    private String teacherPhone;
    private String teacherEmail;
    private String teacherAvailableTime;
    private String teacherContent;
    private String name;
    private byte[] profileimg;
}
