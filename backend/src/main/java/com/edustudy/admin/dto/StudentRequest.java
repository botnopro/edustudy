package com.edustudy.admin.dto;

import com.edustudy.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    private String password;

    private String phone;

    private String avatarUrl;

    private Integer gradeLevel;

    private String schoolName;

    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private Role role = Role.ROLE_STUDENT;
}
