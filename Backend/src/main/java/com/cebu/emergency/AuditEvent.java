package com.cebu.emergency;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_events")
public class AuditEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false)
    Long adminId;

    @Column(nullable = false, length = 80)
    String action;

    @Column(nullable = false, length = 40)
    String entityType;

    Long entityId;

    @Column(nullable = false)
    Instant createdAt = Instant.now();

    protected AuditEvent() {}
}
