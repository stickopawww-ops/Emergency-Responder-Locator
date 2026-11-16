package com.cebu.emergency.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "responders")
@Data
public class Responder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String mobileNumber;
    private String unitName;     // e.g., "Ambulance 1"
    private String stationName;  // e.g., "Ginatilan Rural Health Unit"
    private String category;     // ambulance, fire, tanod, police, utility

    @Enumerated(EnumType.STRING)
    private Status status = Status.OFF_DUTY;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    private Double lat;
    private Double lng;

    public enum Status { AVAILABLE, BUSY, BREAK, OFF_DUTY }
    public enum ApprovalStatus { PENDING, APPROVED, REJECTED }
}