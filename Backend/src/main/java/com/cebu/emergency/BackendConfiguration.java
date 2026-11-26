package com.cebu.emergency;

import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.boot.ApplicationRunner;

@Configuration
class BackendConfiguration {
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(requests -> requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().permitAll())
            .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(
        @Value("${app.cors.allowed-origins:http://localhost:5500,http://127.0.0.1:5500}") String configuredOrigins
    ) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(configuredOrigins.split(","))
            .map(String::trim).filter(origin -> !origin.isEmpty()).toList());
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    @Profile("dev")
    SmsDelivery consoleSmsDelivery() {
        return (phone, message) -> System.out.printf("SMS to %s: %s%n", phone, message);
    }

    @Bean
    @Profile("prod")
    SmsDelivery twilioSmsDelivery(
        @Value("${app.sms.twilio.account-sid}") String accountSid,
        @Value("${app.sms.twilio.auth-token}") String authToken,
        @Value("${app.sms.twilio.from-number}") String fromNumber
    ) {
        return new TwilioSmsDelivery(accountSid, authToken, fromNumber);
    }

    @Bean
    ApplicationRunner bootstrapAdmin(
        AdminUserRepository admins,
        PasswordEncoder passwordEncoder,
        @Value("${app.bootstrap-admin.enabled:false}") boolean enabled,
        @Value("${app.bootstrap-admin.email:}") String email,
        @Value("${app.bootstrap-admin.password:}") String password,
        @Value("${app.bootstrap-admin.name:}") String name,
        @Value("${app.bootstrap-admin.phone:}") String phone
    ) {
        return args -> {
            if (!enabled) return;
            if (email.isBlank() || password.length() < 12 || name.isBlank()) {
                throw new IllegalStateException("Bootstrap admin requires an email, name, and password of at least 12 characters.");
            }
            String normalizedEmail = email.trim().toLowerCase();
            if (admins.existsByEmail(normalizedEmail)) return;
            AdminUser admin = new AdminUser();
            admin.email = normalizedEmail;
            admin.passwordHash = passwordEncoder.encode(password);
            admin.fullName = name.trim();
            admin.phone = PhoneNumbers.normalizeRequired(phone);
            admins.save(admin);
        };
    }

    @Bean
    @Profile("dev")
    ApplicationRunner seedDevelopmentResponders(ResponderRepository responders) {
        return args -> {
            updateDevelopmentAmbulance(responders, "Ginatilan Ambulance 1", "Ginatilan Ambulance 1",
                "Ginatilan Rural Health Unit");
            updateDevelopmentAmbulance(responders, "Ginatilan Ambulance 2", "Ginatilan Ambulance 2",
                "Ginatilan Municipal Health Office");
            if (responders.count() == 0) {
                responders.saveAll(Arrays.asList(
                    sampleResponder("Medical", "Ginatilan Ambulance 1", "Ginatilan Rural Health Unit", "AVAILABLE"),
                    sampleResponder("Fire", "Cebu City Fire Station", "Cebu City", "AVAILABLE"),
                    sampleResponder("Police", "Cebu City Police Unit", "Cebu City", "AVAILABLE"),
                    sampleResponder("Barangay tanod", "Central Cebu Tanod Unit", "Cebu City", "AVAILABLE")
                ));
            }
            if (!responders.existsByUnitName("Ginatilan Ambulance 2")) {
                responders.save(sampleResponder("Medical", "Ginatilan Ambulance 2",
                    "Ginatilan Municipal Health Office", "BUSY"));
            }
        };
    }

    private static void updateDevelopmentAmbulance(
        ResponderRepository responders,
        String oldName,
        String unitName,
        String baseStation
    ) {
        responders.findAll().stream()
            .filter(responder -> oldName.equals(responder.unitName) || unitName.equals(responder.unitName))
            .forEach(responder -> {
                responder.unitName = unitName;
                responder.fullName = unitName;
                responder.baseStation = baseStation;
                responders.save(responder);
            });
    }

    private static Responder sampleResponder(String type, String unitName, String baseStation, String availability) {
        Responder responder = new Responder();
        responder.fullName = unitName;
        responder.unitType = type;
        responder.unitName = unitName;
        responder.baseStation = baseStation;
        responder.approvalStatus = "APPROVED";
        responder.availability = availability;
        responder.phoneVerified = false;
        responder.active = true;
        return responder;
    }
}
