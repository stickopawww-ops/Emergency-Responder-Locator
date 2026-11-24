package com.cebu.emergency;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "auth_sessions")
public class AuthSession {
    @Id
    @Column(length = 64)
    String tokenHash;

    @Column(nullable = false, length = 30)
    String role;

    @Column(nullable = false)
    Long subjectId;

    @Column(nullable = false)
    Instant expiresAt;

    Instant revokedAt;

    protected AuthSession() {}
}
