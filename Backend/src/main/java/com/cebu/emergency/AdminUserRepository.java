package com.cebu.emergency;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    Optional<AdminUser> findByEmailAndActiveTrue(String email);
    boolean existsByEmail(String email);
}
