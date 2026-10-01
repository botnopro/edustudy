package com.edustudy.content.entity;

import com.edustudy.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "banners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 255)
    private String subtitle;

    @Column(length = 50)
    private String badge; // "ƯU ĐÃI NĂM HỌC MỚI", "LỚP 12 CẤP TỐC"

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "action_text", length = 50)
    private String actionText; // "Kích hoạt ngay", "Khám phá khóa học"

    @Column(name = "action_link", length = 200)
    private String actionLink; // "/active-course", "/courses?grade=12"

    @Builder.Default
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
