package com.cebu.emergency;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "incidents")
public class Incident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false, length = 100)
    String clientId;

    @Column(nullable = false, length = 100)
    String category;

    @Column(length = 2000)
    String description;

    @Column(length = 32)
    String requesterPhone;

    @Column(nullable = false, length = 20)
    String priority = "NORMAL";

    Double latitude;
    Double longitude;

    @Column(nullable = false, length = 20)
    String status = "OPEN";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_responder_id")
    Responder assignedResponder;

    @Column(nullable = false)
    Instant createdAt = Instant.now();

    @Column(nullable = false)
    Instant updatedAt = Instant.now();

    protected Incident() {}
}
