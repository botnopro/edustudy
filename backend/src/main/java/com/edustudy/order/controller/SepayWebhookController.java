package com.edustudy.order.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.edustudy.order.dto.SepayWebhookRequest;
import com.edustudy.order.service.SepayWebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping({"/api/webhooks", "/api/v1/webhooks"})
@RequiredArgsConstructor
@Tag(name = "Payment Webhooks", description = "Endpoint tiếp nhận Webhook từ SePay")
public class SepayWebhookController {

    private final SepayWebhookService sepayWebhookService;
    private final ObjectMapper objectMapper;

    @Operation(summary = "Tiếp nhận webhook thanh toán SePay")
    @PostMapping("/sepay")
    public ResponseEntity<?> handleSepayWebhook(
            @RequestBody(required = false) String rawBody,
            @RequestHeader(value = "X-SePay-Signature", required = false) String sig1,
            @RequestHeader(value = "x-sepay-signature", required = false) String sig2,
            @RequestHeader(value = "X-Signature", required = false) String sig3,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-SePay-Timestamp", required = false) String timestamp1,
            @RequestHeader(value = "x-sepay-timestamp", required = false) String timestamp2
    ) {
        if (!StringUtils.hasText(rawBody)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Empty request body"));
        }

        String signature = StringUtils.hasText(sig1) ? sig1 :
                (StringUtils.hasText(sig2) ? sig2 :
                        (StringUtils.hasText(sig3) ? sig3 : authHeader));

        String timestamp = StringUtils.hasText(timestamp1) ? timestamp1 : timestamp2;

        // Bước 1: Verify HMAC
        boolean isValid = sepayWebhookService.verifySignature(rawBody, signature, timestamp);
        if (!isValid) {
            log.warn("SePay webhook signature verification failed");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Invalid HMAC signature"
            ));
        }

        try {
            SepayWebhookRequest request = objectMapper.readValue(rawBody, SepayWebhookRequest.class);
            var result = sepayWebhookService.processWebhook(rawBody, request);
            return ResponseEntity.ok(Map.of(
                    "success", result.success(),
                    "message", result.message()
            ));
        } catch (Exception e) {
            log.error("Error parsing or processing SePay webhook payload: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Error processing payload"
            ));
        }
    }
}
