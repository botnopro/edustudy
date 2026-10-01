package com.edustudy.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "payment")
public class PaymentProperties {
    private String bankBin = "970422";
    private String bankAccount = "0988888888";
    private String bankName = "MBBank";
    private String bankAccountName = "CONG TY GIAO DUC QANDA STUDY";
    private Sepay sepay = new Sepay();

    @Data
    public static class Sepay {
        private String webhookSecret = "";
    }
}
