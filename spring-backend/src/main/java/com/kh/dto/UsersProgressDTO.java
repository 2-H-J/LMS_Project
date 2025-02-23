
package com.kh.dto;

import java.sql.Timestamp;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class UsersProgressDTO {
    private int usersProgressNumber;
    private String uno;
    private int classNumber;
    private int completionStatus;
    private double completionRate;
    private Timestamp progressUpdateTime;

    private String title;
    private String instructorName;

    private String thumbnail;
}
