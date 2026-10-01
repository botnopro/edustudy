package com.edustudy.admin.controller;

import com.edustudy.common.ApiResponse;
import com.edustudy.content.entity.Banner;
import com.edustudy.content.entity.FaqItem;
import com.edustudy.content.entity.Testimonial;
import com.edustudy.content.service.ContentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/content")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin Content", description = "Quản lý Banners, FAQs, Testimonials hiển thị trên trang chủ và trang kích hoạt")
public class AdminContentController {

    private final ContentService contentService;

    // Banners
    @GetMapping("/banners")
    @Operation(summary = "Lấy tất cả banners")
    public ApiResponse<List<Banner>> getAllBanners() {
        return ApiResponse.ok(contentService.getAllBanners());
    }

    @PostMapping("/banners")
    @Operation(summary = "Thêm banner mới")
    public ApiResponse<Banner> createBanner(@Valid @RequestBody Banner banner) {
        return ApiResponse.ok(contentService.createBanner(banner), "Thêm banner thành công");
    }

    @PutMapping("/banners/{id}")
    @Operation(summary = "Cập nhật banner")
    public ApiResponse<Banner> updateBanner(@PathVariable Long id, @Valid @RequestBody Banner banner) {
        return ApiResponse.ok(contentService.updateBanner(id, banner), "Cập nhật banner thành công");
    }

    @DeleteMapping("/banners/{id}")
    @Operation(summary = "Xóa banner")
    public ApiResponse<Void> deleteBanner(@PathVariable Long id) {
        contentService.deleteBanner(id);
        return ApiResponse.ok(null, "Xóa banner thành công");
    }

    // FAQs
    @GetMapping("/faqs")
    @Operation(summary = "Lấy tất cả câu hỏi FAQ")
    public ApiResponse<List<FaqItem>> getAllFaqs() {
        return ApiResponse.ok(contentService.getAllFaqs());
    }

    @PostMapping("/faqs")
    @Operation(summary = "Thêm FAQ mới")
    public ApiResponse<FaqItem> createFaq(@Valid @RequestBody FaqItem faq) {
        return ApiResponse.ok(contentService.createFaq(faq), "Thêm FAQ thành công");
    }

    @PutMapping("/faqs/{id}")
    @Operation(summary = "Cập nhật FAQ")
    public ApiResponse<FaqItem> updateFaq(@PathVariable Long id, @Valid @RequestBody FaqItem faq) {
        return ApiResponse.ok(contentService.updateFaq(id, faq), "Cập nhật FAQ thành công");
    }

    @PutMapping("/faqs/{id}/toggle-status")
    @Operation(summary = "Khóa hoặc Mở khóa câu hỏi FAQ")
    public ApiResponse<FaqItem> toggleFaqStatus(@PathVariable Long id) {
        FaqItem updated = contentService.toggleFaqStatus(id);
        String msg = Boolean.TRUE.equals(updated.getIsActive()) ? "Đã hiển thị câu hỏi FAQ" : "Đã tạm ẩn câu hỏi FAQ";
        return ApiResponse.ok(updated, msg);
    }

    @DeleteMapping("/faqs/{id}")
    @Operation(summary = "Xóa FAQ")
    public ApiResponse<Void> deleteFaq(@PathVariable Long id) {
        contentService.deleteFaq(id);
        return ApiResponse.ok(null, "Xóa FAQ thành công");
    }

    // Testimonials
    @GetMapping("/testimonials")
    @Operation(summary = "Lấy tất cả đánh giá học sinh")
    public ApiResponse<List<Testimonial>> getAllTestimonials() {
        return ApiResponse.ok(contentService.getAllTestimonials());
    }

    @PostMapping("/testimonials")
    @Operation(summary = "Thêm đánh giá học sinh mới")
    public ApiResponse<Testimonial> createTestimonial(@Valid @RequestBody Testimonial testimonial) {
        return ApiResponse.ok(contentService.createTestimonial(testimonial), "Thêm đánh giá thành công");
    }

    @PutMapping("/testimonials/{id}")
    @Operation(summary = "Cập nhật đánh giá")
    public ApiResponse<Testimonial> updateTestimonial(@PathVariable Long id, @Valid @RequestBody Testimonial testimonial) {
        return ApiResponse.ok(contentService.updateTestimonial(id, testimonial), "Cập nhật đánh giá thành công");
    }

    @DeleteMapping("/testimonials/{id}")
    @Operation(summary = "Xóa đánh giá")
    public ApiResponse<Void> deleteTestimonial(@PathVariable Long id) {
        contentService.deleteTestimonial(id);
        return ApiResponse.ok(null, "Xóa đánh giá thành công");
    }
}
