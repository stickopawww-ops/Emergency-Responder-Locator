package com.cebu.emergency.repository;

import com.cebu.emergency.model.Responder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResponderRepository extends JpaRepository<Responder, Long> {
    List<Responder.ApprovalStatus> findByApprovalStatus(Responder.ApprovalStatus approvalStatus);
    List<Responder.Status> findByStatusAndApprovalStatus(Responder.Status status, Responder.ApprovalStatus approvalStatus);
    List<Responder> findByCategory(String category);
}