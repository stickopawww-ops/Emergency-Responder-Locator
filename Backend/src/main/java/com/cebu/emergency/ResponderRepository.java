package com.cebu.emergency;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResponderRepository extends JpaRepository<Responder, Long> {
    Optional<Responder> findByPhoneAndActiveTrue(String phone);
    boolean existsByPhone(String phone);
    boolean existsByUnitName(String unitName);
    List<Responder> findByActiveTrueOrderByIdAsc();
    List<Responder> findByActiveTrueAndApprovalStatusOrderByIdAsc(String approvalStatus);
}
