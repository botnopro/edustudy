package com.edustudy.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.edustudy.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "grade_level")
    private Integer gradeLevel; // 10, 11, 12

    @Column(name = "school_name", length = 150)
    private String schoolName;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;
}
