package com.edustudy.content.controller;

import com.edustudy.common.ApiResponse;
import com.edustudy.content.entity.Banner;
import com.edustudy.content.entity.FaqItem;
import com.edustudy.content.entity.Testimonial;
import com.edustudy.content.service.ContentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/content")
@RequiredArgsConstructor
@Tag(name = "Content Public", description = "Banner, FAQ, Đánh giá học viên hiển thị cho khách")
public class ContentController {

    private final ContentService contentService;

    @GetMapping("/banners")
    @Operation(summary = "Lấy danh sách banners đang hoạt động")
    public ApiResponse<List<Banner>> getBanners() {
        return ApiResponse.ok(contentService.getActiveBanners());
    }

    @GetMapping("/faqs")
    @Operation(summary = "Lấy danh sách câu hỏi thường gặp FAQ")
    public ApiResponse<List<FaqItem>> getFaqs() {
        return ApiResponse.ok(contentService.getActiveFaqs());
    }

    @GetMapping("/testimonials")
    @Operation(summary = "Lấy danh sách đánh giá của học sinh 9+")
    public ApiResponse<List<Testimonial>> getTestimonials() {
        return ApiResponse.ok(contentService.getActiveTestimonials());
    }
}
