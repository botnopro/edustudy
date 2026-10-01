package com.edustudy.common;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    INTERNAL_SERVER_ERROR("SERVER_500", "Lỗi máy chủ nội bộ", HttpStatus.INTERNAL_SERVER_ERROR),
    BAD_REQUEST("REQ_400", "Dữ liệu yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("AUTH_401", "Chưa đăng nhập hoặc phiên làm việc đã hết hạn", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("AUTH_403", "Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    NOT_FOUND("RES_404", "Không tìm thấy dữ liệu yêu cầu", HttpStatus.NOT_FOUND),
    RESOURCE_NOT_FOUND("RES_404", "Không tìm thấy tài nguyên yêu cầu", HttpStatus.NOT_FOUND),
    CONFLICT("RES_409", "Dữ liệu đã tồn tại hoặc xảy ra xung đột", HttpStatus.CONFLICT),
    
    // Auth & Account Security
    EMAIL_ALREADY_EXISTS("AUTH_EMAIL_EXISTS", "Email này đã được đăng ký", HttpStatus.CONFLICT),
    INVALID_CREDENTIALS("AUTH_INVALID_CREDS", "Email hoặc mật khẩu không chính xác", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND("USER_NOT_FOUND", "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    ACCOUNT_LOCKED("AUTH_ACCOUNT_LOCKED", "Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ ban quản trị để được hỗ trợ.", HttpStatus.FORBIDDEN),
    CURRENT_PASSWORD_INCORRECT("AUTH_WRONG_PASSWORD", "Mật khẩu hiện tại không chính xác", HttpStatus.BAD_REQUEST),
    NEW_PASSWORD_SAME_AS_OLD("AUTH_SAME_PASSWORD", "Mật khẩu mới không được trùng với mật khẩu hiện tại", HttpStatus.BAD_REQUEST),

    // Course & Activation
    COURSE_NOT_FOUND("COURSE_NOT_FOUND", "Khóa học không tồn tại", HttpStatus.NOT_FOUND),
    ACTIVATION_CODE_INVALID("CODE_INVALID", "Mã kích hoạt không hợp lệ hoặc không tồn tại", HttpStatus.BAD_REQUEST),
    ACTIVATION_CODE_EXPIRED("CODE_EXPIRED", "Mã kích hoạt đã hết hạn sử dụng", HttpStatus.BAD_REQUEST),
    ACTIVATION_CODE_EXHAUSTED("CODE_EXHAUSTED", "Mã kích hoạt đã được sử dụng hết số lần cho phép", HttpStatus.BAD_REQUEST),
    COURSE_ALREADY_ACTIVATED("COURSE_ALREADY_ACTIVATED", "Bạn đã kích hoạt khóa học này trước đó rồi", HttpStatus.CONFLICT),
    TEACHER_NOT_FOUND("TEACHER_NOT_FOUND", "Giáo viên không tồn tại", HttpStatus.NOT_FOUND);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
