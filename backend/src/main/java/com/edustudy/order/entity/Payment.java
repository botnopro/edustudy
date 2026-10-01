package com.edustudy.order.entity;

import com.edustudy.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_sepay_trans_id", columnList = "sepay_transaction_id", unique = true),
        @Index(name = "idx_payment_order_id", columnList = "order_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "sepay_transaction_id", nullable = false, unique = true)
    private Long sepayTransactionId;

    @Column(length = 50)
    private String gateway;

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @Column(name = "transfer_type", length = 20)
    private String transferType;

    @Column(name = "transfer_amount", precision = 12, scale = 2)
    private BigDecimal transferAmount;

    @Column(name = "payment_code", length = 100)
    private String paymentCode;

    @Column(length = 500)
    private String content;

    @Column(name = "reference_code", length = 100)
    private String referenceCode;

    @Column(name = "transaction_date")
    private String transactionDate;

    @Column(name = "raw_payload", columnDefinition = "TEXT")
    private String rawPayload;
}
