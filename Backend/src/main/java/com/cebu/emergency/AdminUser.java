package com.cebu.emergency;

import jakarta.persistence.*;

@Entity
@Table(name = "admin_users")
public class AdminUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false, unique = true)
    String email;

    @Column(nullable = false, length = 100)
    String passwordHash;

    @Column(nullable = false, length = 160)
    String fullName;

    @Column(nullable = false, length = 32)
    String phone;

    @Column(nullable = false)
    boolean active = true;

    protected AdminUser() {}
}
