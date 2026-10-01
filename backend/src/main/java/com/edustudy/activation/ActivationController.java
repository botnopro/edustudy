package com.edustudy.activation;

import com.edustudy.activation.dto.ActivateRequest;
import com.edustudy.activation.dto.ActivationResponse;
import com.edustudy.activation.dto.CodeCheckResponse;
import com.edustudy.common.ApiResponse;
import com.edustudy.course.dto.CourseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/activation")
@RequiredArgsConstructor
@Tag(name = "Course Activation", description = "Kích hoạt khóa học bằng mã")
public class ActivationController {

    private final ActivationService activationService;

    @GetMapping("/check/{code}")
    @Operation(summary = "Kiểm tra thông tin mã kích hoạt (không yêu cầu đăng nhập)")
    public ApiResponse<CodeCheckResponse> checkCode(@PathVariable String code) {
        return ApiResponse.ok(activationService.checkCode(code));
    }

    @PostMapping("/activate")
    @Operation(summary = "Kích hoạt khóa học vào tài khoản người dùng")
    public ApiResponse<ActivationResponse> activateCourse(@Valid @RequestBody ActivateRequest request) {
        return ApiResponse.ok(activationService.activateCourse(request), "Kích hoạt khóa học thành công!");
    }

    @GetMapping("/my-courses")
    @Operation(summary = "Lấy danh sách các khóa học đã kích hoạt của tài khoản")
    public ApiResponse<List<CourseDto>> getMyCourses() {
        return ApiResponse.ok(activationService.getMyCourses());
    }
}
