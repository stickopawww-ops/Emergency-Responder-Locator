package com.cebu.emergency.repository;

import com.cebu.emergency.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByStatus(Incident.IncidentStatus status);
}