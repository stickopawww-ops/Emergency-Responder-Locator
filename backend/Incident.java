package com.cebu.emergency.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Data
public class Incident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String citizenDeviceId;
    private Long assignedUnitId; // References Responder.id
    private String title;         // e.g., "Chest pain, adult male"
    private String locationText;  // e.g., "Brgy. Lahug"
    private String category;      // medical, fire, crime, utility

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.HIGH;

    @Enumerated(EnumType.STRING)
    private IncidentStatus status = IncidentStatus.UNASSIGNED;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime resolvedAt;

    public enum Priority { HIGH, MED, LOW }
    public enum IncidentStatus { UNASSIGNED, ACTIVE, RESOLVED, FALSE_ALARM }
}