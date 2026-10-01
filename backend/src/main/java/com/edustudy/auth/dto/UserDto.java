package com.edustudy.auth.dto;

import com.edustudy.user.Role;
import com.edustudy.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private Role role;
    private Integer gradeLevel;
    private String schoolName;
    private Instant createdAt;

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .gradeLevel(user.getGradeLevel())
                .schoolName(user.getSchoolName())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
