package com.cebu.emergency;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "otp_challenges")
public class OtpChallenge {
    @Id
    @Column(length = 36)
    String id;

    @Column(nullable = false, length = 30)
    String purpose;

    Long subjectId;

    @Column(nullable = false, length = 100)
    String codeHash;

    @Column(nullable = false)
    Instant expiresAt;

    @Column(nullable = false)
    int attempts;

    @Column(nullable = false)
    Instant lastSentAt;

    protected OtpChallenge() {}
}
