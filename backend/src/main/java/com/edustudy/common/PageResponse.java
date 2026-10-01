package com.edustudy.common;

import lombok.*;

import java.util.List;

/**
 * Gói kết quả phân trang dùng chung cho các API danh sách của Admin.
 * Trả về một "trang" dữ liệu kèm thông tin tổng số để frontend dựng bộ điều hướng trang.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageResponse<T> {
    private List<T> content;
    private int page;          // trang hiện tại (bắt đầu từ 0)
    private int size;          // số phần tử mỗi trang
    private long totalElements; // tổng số phần tử sau khi lọc
    private int totalPages;     // tổng số trang

    public static <T> PageResponse<T> of(List<T> all, int page, int size) {
        int total = all.size();
        int safeSize = size <= 0 ? 20 : size;
        int totalPages = (int) Math.ceil((double) total / safeSize);
        int safePage = Math.max(0, page);
        int from = Math.min(safePage * safeSize, total);
        int to = Math.min(from + safeSize, total);
        List<T> slice = from >= to ? List.of() : all.subList(from, to);
        return PageResponse.<T>builder()
                .content(slice)
                .page(safePage)
                .size(safeSize)
                .totalElements(total)
                .totalPages(totalPages)
                .build();
    }
}
