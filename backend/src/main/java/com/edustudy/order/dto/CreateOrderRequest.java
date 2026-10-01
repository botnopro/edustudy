package com.edustudy.order.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    @NotNull(message = "ID khóa học không được để trống")
    @JsonAlias({"course_id", "courseId"})
    private Object courseId;
    
    private String phone;
    private String notes;

    public Long getParsedCourseId() {
        if (courseId == null) return null;
        if (courseId instanceof Number n) return n.longValue();
        String str = courseId.toString().trim();
        try {
            return Long.parseLong(str);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public String getRawCourseIdentifier() {
        return courseId != null ? courseId.toString().trim() : null;
    }
}
