package com.cebu.emergency;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "responders")
public class Responder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false, length = 160)
    String fullName;

    @Column(unique = true, length = 32)
    String phone;

    @Column(length = 100)
    String passwordHash;

    @Column(nullable = false, length = 80)
    String unitType;

    @Column(length = 160)
    String unitName;

    @Column(length = 240)
    String baseStation;

    @Column(nullable = false, length = 20)
    String approvalStatus = "PENDING";

    @Column(nullable = false, length = 20)
    String availability = "OFF_DUTY";

    @Column(nullable = false)
    boolean phoneVerified;

    @Column(nullable = false)
    boolean active = true;

    @Column(nullable = false)
    Instant createdAt = Instant.now();

    protected Responder() {}
}
