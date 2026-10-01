package com.edustudy.teacher;

import com.edustudy.common.AppException;
import com.edustudy.common.ErrorCode;
import com.edustudy.teacher.dto.TeacherDto;
import com.edustudy.teacher.dto.TeacherRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;

    @Transactional(readOnly = true)
    public List<TeacherDto> getAllActiveTeachers() {
        return teacherRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(TeacherDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TeacherDto> getAllTeachersForAdmin() {
        return teacherRepository.findAll().stream()
                .map(TeacherDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public TeacherDto getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TEACHER_NOT_FOUND));
        return TeacherDto.fromEntity(teacher);
    }

    @Transactional
    public TeacherDto createTeacher(TeacherRequest request) {
        Teacher teacher = Teacher.builder()
                .name(request.getName().trim())
                .title(request.getTitle())
                .subject(request.getSubject().toUpperCase())
                .avatarUrl(request.getAvatarUrl())
                .bio(request.getBio())
                .experienceYears(request.getExperienceYears())
                .rating(request.getRating() != null ? request.getRating() : 5.0)
                .studentCount(request.getStudentCount() != null ? request.getStudentCount() : 1000)
                .achievements(request.getAchievements())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return TeacherDto.fromEntity(teacherRepository.save(teacher));
    }

    @Transactional
    public TeacherDto updateTeacher(Long id, TeacherRequest request) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TEACHER_NOT_FOUND));

        teacher.setName(request.getName().trim());
        teacher.setTitle(request.getTitle());
        teacher.setSubject(request.getSubject().toUpperCase());
        if (request.getAvatarUrl() != null) teacher.setAvatarUrl(request.getAvatarUrl());
        teacher.setBio(request.getBio());
        teacher.setExperienceYears(request.getExperienceYears());
        if (request.getRating() != null) teacher.setRating(request.getRating());
        if (request.getStudentCount() != null) teacher.setStudentCount(request.getStudentCount());
        teacher.setAchievements(request.getAchievements());
        if (request.getSortOrder() != null) teacher.setSortOrder(request.getSortOrder());
        if (request.getIsActive() != null) teacher.setIsActive(request.getIsActive());

        return TeacherDto.fromEntity(teacherRepository.save(teacher));
    }

    @Transactional
    public TeacherDto toggleTeacherStatus(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TEACHER_NOT_FOUND));
        teacher.setIsActive(teacher.getIsActive() == null || !teacher.getIsActive());
        return TeacherDto.fromEntity(teacherRepository.save(teacher));
    }

    @Transactional
    public void deleteTeacher(Long id) {
        if (!teacherRepository.existsById(id)) {
            throw new AppException(ErrorCode.TEACHER_NOT_FOUND);
        }
        teacherRepository.deleteById(id);
    }
}
