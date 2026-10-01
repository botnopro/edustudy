package com.edustudy.category.service;

import com.edustudy.category.dto.GradeDto;
import com.edustudy.category.dto.SubjectDto;
import com.edustudy.category.entity.Grade;
import com.edustudy.category.entity.Subject;
import com.edustudy.category.repository.GradeRepository;
import com.edustudy.category.repository.SubjectRepository;
import com.edustudy.common.AppException;
import com.edustudy.common.ErrorCode;
import com.edustudy.course.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final GradeRepository gradeRepository;
    private final SubjectRepository subjectRepository;
    private final CourseRepository courseRepository;

    // ==========================================
    // GRADES (Khối Lớp)
    // ==========================================

    @Transactional(readOnly = true)
    public List<GradeDto> getActiveGrades() {
        return gradeRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(this::mapGradeWithCount)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GradeDto> getAllGradesForAdmin() {
        return gradeRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::mapGradeWithCount)
                .toList();
    }

    @Transactional
    public GradeDto createGrade(GradeDto dto) {
        String code = dto.getCode().trim().toUpperCase();
        if (gradeRepository.existsByCode(code)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mã khối lớp '" + code + "' đã tồn tại");
        }
        Grade grade = Grade.builder()
                .code(code)
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .icon(dto.getIcon() != null ? dto.getIcon() : "GraduationCap")
                .badge(dto.getBadge())
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        return mapGradeWithCount(gradeRepository.save(grade));
    }

    @Transactional
    public GradeDto updateGrade(Long id, GradeDto dto) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy khối lớp có ID: " + id));

        String code = dto.getCode().trim().toUpperCase();
        if (!grade.getCode().equalsIgnoreCase(code) && gradeRepository.existsByCode(code)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mã khối lớp '" + code + "' đã tồn tại");
        }

        grade.setCode(code);
        grade.setName(dto.getName().trim());
        grade.setDescription(dto.getDescription());
        if (dto.getIcon() != null) grade.setIcon(dto.getIcon());
        grade.setBadge(dto.getBadge());
        if (dto.getSortOrder() != null) grade.setSortOrder(dto.getSortOrder());
        if (dto.getIsActive() != null) grade.setIsActive(dto.getIsActive());

        return mapGradeWithCount(gradeRepository.save(grade));
    }

    @Transactional
    public void deleteGrade(Long id) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy khối lớp có ID: " + id));
        gradeRepository.delete(grade);
    }

    private GradeDto mapGradeWithCount(Grade grade) {
        GradeDto dto = GradeDto.fromEntity(grade);
        try {
            long count = courseRepository.countByIsActiveTrue(); // or specific count if needed
            dto.setCourseCount(count);
        } catch (Exception ignored) {
            dto.setCourseCount(0L);
        }
        return dto;
    }

    // ==========================================
    // SUBJECTS (Môn Học)
    // ==========================================

    @Transactional(readOnly = true)
    public List<SubjectDto> getActiveSubjects() {
        return subjectRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(this::mapSubjectWithCount)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SubjectDto> getAllSubjectsForAdmin() {
        return subjectRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::mapSubjectWithCount)
                .toList();
    }

    @Transactional
    public SubjectDto createSubject(SubjectDto dto) {
        String code = dto.getCode().trim().toUpperCase();
        if (subjectRepository.existsByCode(code)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mã môn học '" + code + "' đã tồn tại");
        }
        Subject subject = Subject.builder()
                .code(code)
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .icon(dto.getIcon() != null ? dto.getIcon() : "BookOpen")
                .color(dto.getColor() != null ? dto.getColor() : "#EF4401")
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        return mapSubjectWithCount(subjectRepository.save(subject));
    }

    @Transactional
    public SubjectDto updateSubject(Long id, SubjectDto dto) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy môn học có ID: " + id));

        String code = dto.getCode().trim().toUpperCase();
        if (!subject.getCode().equalsIgnoreCase(code) && subjectRepository.existsByCode(code)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mã môn học '" + code + "' đã tồn tại");
        }

        subject.setCode(code);
        subject.setName(dto.getName().trim());
        subject.setDescription(dto.getDescription());
        if (dto.getIcon() != null) subject.setIcon(dto.getIcon());
        if (dto.getColor() != null) subject.setColor(dto.getColor());
        if (dto.getSortOrder() != null) subject.setSortOrder(dto.getSortOrder());
        if (dto.getIsActive() != null) subject.setIsActive(dto.getIsActive());

        return mapSubjectWithCount(subjectRepository.save(subject));
    }

    @Transactional
    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy môn học có ID: " + id));
        subjectRepository.delete(subject);
    }

    private SubjectDto mapSubjectWithCount(Subject subject) {
        SubjectDto dto = SubjectDto.fromEntity(subject);
        return dto;
    }
}
