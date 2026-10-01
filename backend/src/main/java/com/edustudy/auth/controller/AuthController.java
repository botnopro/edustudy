package com.edustudy.auth.controller;

import com.edustudy.auth.dto.AuthResponse;
import com.edustudy.auth.dto.LoginRequest;
import com.edustudy.auth.dto.RegisterRequest;
import com.edustudy.auth.dto.UserDto;
import com.edustudy.auth.service.AuthService;
import com.edustudy.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Đăng ký, Đăng nhập, Thông tin người dùng")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản học sinh mới")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok(authService.register(request), "Đăng ký tài khoản thành công");
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập hệ thống")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request), "Đăng nhập thành công");
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin người dùng đang đăng nhập")
    public ApiResponse<UserDto> getCurrentUser() {
        return ApiResponse.ok(authService.getCurrentUserDto());
    }

    @PostMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu an toàn cho người dùng")
    public ApiResponse<Void> changePassword(@Valid @RequestBody com.edustudy.auth.dto.ChangePasswordRequest request) {
        authService.changePassword(request);
        return ApiResponse.ok(null, "Đổi mật khẩu thành công");
    }

    @PutMapping("/profile")
    @Operation(summary = "Cập nhật thông tin cá nhân")
    public ApiResponse<UserDto> updateProfile(@Valid @RequestBody com.edustudy.auth.dto.UpdateProfileRequest request) {
        return ApiResponse.ok(authService.updateProfile(request), "Cập nhật thông tin cá nhân thành công");
    }
}
