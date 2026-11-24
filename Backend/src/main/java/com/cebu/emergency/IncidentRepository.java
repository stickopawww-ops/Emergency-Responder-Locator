package com.cebu.emergency;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByClientIdOrderByCreatedAtDesc(String clientId);
    List<Incident> findByAssignedResponder_IdOrderByCreatedAtDesc(Long responderId);
    List<Incident> findAllByOrderByCreatedAtDesc();
    long countByStatusIn(List<String> statuses);
    long countByStatus(String status);
}
