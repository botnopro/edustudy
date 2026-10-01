package com.edustudy.teacher;

import com.edustudy.common.ApiResponse;
import com.edustudy.teacher.dto.TeacherDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teachers")
@RequiredArgsConstructor
@Tag(name = "Teachers Public", description = "Danh sách giáo viên luyện thi")
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping
    @Operation(summary = "Lấy danh sách giáo viên đang hoạt động")
    public ApiResponse<List<TeacherDto>> getAllTeachers() {
        return ApiResponse.ok(teacherService.getAllActiveTeachers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem hồ sơ giáo viên theo ID")
    public ApiResponse<TeacherDto> getTeacherById(@PathVariable Long id) {
        return ApiResponse.ok(teacherService.getTeacherById(id));
    }
}
