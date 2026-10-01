package com.edustudy.content.service;

import com.edustudy.common.AppException;
import com.edustudy.common.ErrorCode;
import com.edustudy.content.entity.Banner;
import com.edustudy.content.entity.FaqItem;
import com.edustudy.content.entity.Testimonial;
import com.edustudy.content.repository.BannerRepository;
import com.edustudy.content.repository.FaqItemRepository;
import com.edustudy.content.repository.TestimonialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final BannerRepository bannerRepository;
    private final FaqItemRepository faqItemRepository;
    private final TestimonialRepository testimonialRepository;

    // Public Guest Readers
    @Transactional(readOnly = true)
    public List<Banner> getActiveBanners() {
        return bannerRepository.findByIsActiveTrueOrderBySortOrderAsc();
    }

    @Transactional(readOnly = true)
    public List<FaqItem> getActiveFaqs() {
        return faqItemRepository.findByIsActiveTrueOrderBySortOrderAsc();
    }

    @Transactional(readOnly = true)
    public List<Testimonial> getActiveTestimonials() {
        return testimonialRepository.findByIsActiveTrueOrderBySortOrderAsc();
    }

    // Admin Banners
    @Transactional(readOnly = true)
    public List<Banner> getAllBanners() {
        return bannerRepository.findAllByOrderBySortOrderAsc();
    }

    @Transactional
    public Banner createBanner(Banner banner) {
        return bannerRepository.save(banner);
    }

    @Transactional
    public Banner updateBanner(Long id, Banner updated) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy banner"));
        banner.setTitle(updated.getTitle());
        banner.setSubtitle(updated.getSubtitle());
        banner.setBadge(updated.getBadge());
        banner.setImageUrl(updated.getImageUrl());
        banner.setActionText(updated.getActionText());
        banner.setActionLink(updated.getActionLink());
        banner.setSortOrder(updated.getSortOrder());
        banner.setIsActive(updated.getIsActive());
        return bannerRepository.save(banner);
    }

    @Transactional
    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }

    // Admin FAQs
    @Transactional(readOnly = true)
    public List<FaqItem> getAllFaqs() {
        return faqItemRepository.findAllByOrderBySortOrderAsc();
    }

    @Transactional
    public FaqItem createFaq(FaqItem faq) {
        return faqItemRepository.save(faq);
    }

    @Transactional
    public FaqItem updateFaq(Long id, FaqItem updated) {
        FaqItem faq = faqItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy câu hỏi"));
        faq.setQuestion(updated.getQuestion());
        faq.setAnswer(updated.getAnswer());
        faq.setCategory(updated.getCategory());
        faq.setSortOrder(updated.getSortOrder());
        faq.setIsActive(updated.getIsActive());
        return faqItemRepository.save(faq);
    }

    @Transactional
    public FaqItem toggleFaqStatus(Long id) {
        FaqItem faq = faqItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy câu hỏi"));
        faq.setIsActive(faq.getIsActive() == null || !faq.getIsActive());
        return faqItemRepository.save(faq);
    }

    @Transactional
    public void deleteFaq(Long id) {
        faqItemRepository.deleteById(id);
    }

    // Admin Testimonials
    @Transactional(readOnly = true)
    public List<Testimonial> getAllTestimonials() {
        return testimonialRepository.findAllByOrderBySortOrderAsc();
    }

    @Transactional
    public Testimonial createTestimonial(Testimonial testimonial) {
        return testimonialRepository.save(testimonial);
    }

    @Transactional
    public Testimonial updateTestimonial(Long id, Testimonial updated) {
        Testimonial t = testimonialRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy đánh giá"));
        t.setStudentName(updated.getStudentName());
        t.setSchool(updated.getSchool());
        t.setScore(updated.getScore());
        t.setContent(updated.getContent());
        t.setAvatarUrl(updated.getAvatarUrl());
        t.setTargetExam(updated.getTargetExam());
        t.setCourseName(updated.getCourseName());
        t.setSortOrder(updated.getSortOrder());
        t.setIsActive(updated.getIsActive());
        return testimonialRepository.save(t);
    }

    @Transactional
    public void deleteTestimonial(Long id) {
        testimonialRepository.deleteById(id);
    }
}
