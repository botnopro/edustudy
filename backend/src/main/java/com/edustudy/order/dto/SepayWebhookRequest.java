package com.edustudy.order.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SepayWebhookRequest {

    @JsonProperty("id")
    private Long id; // sepay_transaction_id

    @JsonProperty("gateway")
    private String gateway;

    @JsonProperty("transactionDate")
    @JsonAlias({"transaction_date", "transactionDate"})
    private String transactionDate;

    @JsonProperty("accountNumber")
    @JsonAlias({"account_number", "accountNumber"})
    private String accountNumber;

    @JsonProperty("code")
    private String code;

    @JsonProperty("content")
    private String content;

    @JsonProperty("transferType")
    @JsonAlias({"transfer_type", "transferType"})
    private String transferType;

    @JsonProperty("transferAmount")
    @JsonAlias({"transfer_amount", "transferAmount"})
    private BigDecimal transferAmount;

    @JsonProperty("referenceCode")
    @JsonAlias({"reference_code", "referenceCode", "referenceNumber"})
    private String referenceCode;
}
