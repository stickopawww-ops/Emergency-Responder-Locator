package com.cebu.emergency;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
class ApiController {
    private final ResponderRepository responders;
    private final IncidentRepository incidents;
    private final AdminUserRepository admins;
    private final AuthSessionRepository sessions;
    private final OtpChallengeRepository challenges;
    private final AuditEventRepository auditEvents;
    private final PasswordEncoder passwords;
    private final SmsDelivery sms;
    private final SecureRandom random = new SecureRandom();

    ApiController(
        ResponderRepository responders,
        IncidentRepository incidents,
        AdminUserRepository admins,
        AuthSessionRepository sessions,
        OtpChallengeRepository challenges,
        AuditEventRepository auditEvents,
        PasswordEncoder passwords,
        SmsDelivery sms
    ) {
        this.responders = responders;
        this.incidents = incidents;
        this.admins = admins;
        this.sessions = sessions;
        this.challenges = challenges;
        this.auditEvents = auditEvents;
        this.passwords = passwords;
        this.sms = sms;
    }

    @PostMapping("/auth/responders/register")
    @Transactional
    ResponseEntity<?> registerResponder(@Valid @RequestBody RegisterRequest body) {
        String phone = PhoneNumbers.normalizeRequired(body.phone());
        if (responders.existsByPhone(phone)) throw conflict("That mobile number is already registered.");
        Responder responder = new Responder();
        responder.fullName = body.fullName().trim();
        responder.phone = phone;
        responder.passwordHash = passwords.encode(body.password());
        responder.unitType = body.unitType().trim();
        responder.unitName = clean(body.unitName());
        responder.baseStation = clean(body.baseStation());
        responder.approvalStatus = "PENDING";
        responder.availability = "OFF_DUTY";
        responder.phoneVerified = false;
        responders.save(responder);
        OtpChallenge challenge = newChallenge("RESPONDER_VERIFY", responder.id, phone,
            "Your Cebu Emergency Finder verification code is ");
        return ResponseEntity.status(HttpStatus.CREATED).body(challengeResponse(challenge, null));
    }

    @PostMapping("/auth/responders/verify")
    @Transactional(noRollbackFor = ResponseStatusException.class)
    Map<String, Object> verifyResponder(@Valid @RequestBody VerifyRequest body) {
        OtpChallenge challenge = verifyCode(body.challengeId(), body.code(), "RESPONDER_VERIFY");
        Responder responder = responders.findById(requiredSubject(challenge))
            .orElseThrow(() -> badRequest("Verification challenge is no longer valid."));
        responder.phoneVerified = true;
        return Map.of("token", createSession("RESPONDER", responder.id),
            "responder", responderView(responder));
    }

    @PostMapping("/auth/responders/login")
    @Transactional
    Map<String, Object> responderLogin(@Valid @RequestBody LoginRequest body) {
        String phone = PhoneNumbers.normalizeRequired(body.phone());
        Responder responder = responders.findByPhoneAndActiveTrue(phone)
            .orElseThrow(() -> unauthorized("Invalid mobile number or password."));
        if (responder.passwordHash == null || !passwords.matches(body.password(), responder.passwordHash)) {
            throw unauthorized("Invalid mobile number or password.");
        }
        if (!responder.phoneVerified) throw forbidden("Verify your mobile number before signing in.");
        if (!"APPROVED".equals(responder.approvalStatus)) {
            throw forbidden("Your responder account has not been approved.");
        }
        return Map.of("token", createSession("RESPONDER", responder.id),
            "responder", responderView(responder));
    }

    @PostMapping("/auth/responders/password-reset/request")
    @Transactional
    Map<String, Object> requestPasswordReset(@Valid @RequestBody PhoneRequest body) {
        String phone = PhoneNumbers.normalizeRequired(body.phone());
        Responder responder = responders.findByPhoneAndActiveTrue(phone).orElse(null);
        OtpChallenge challenge = newChallenge("PASSWORD_RESET", responder == null ? null : responder.id,
            responder != null && responder.phoneVerified ? phone : null,
            "Your Cebu Emergency Finder password reset code is ");
        return challengeResponse(challenge, null);
    }

    @PostMapping("/auth/responders/password-reset/verify")
    @Transactional(noRollbackFor = ResponseStatusException.class)
    Map<String, Object> verifyPasswordReset(@Valid @RequestBody VerifyRequest body) {
        OtpChallenge challenge = verifyCode(body.challengeId(), body.code(), "PASSWORD_RESET");
        if (challenge.subjectId == null) throw badRequest("The code is invalid or expired.");
        return Map.of("resetToken", createSession("PASSWORD_RESET", challenge.subjectId, Duration.ofMinutes(15)));
    }

    @PostMapping("/auth/responders/password-reset/complete")
    @Transactional
    ResponseEntity<Void> completePasswordReset(@Valid @RequestBody CompleteResetRequest body) {
        AuthSession session = authenticate(body.resetToken(), "PASSWORD_RESET");
        Responder responder = responders.findById(session.subjectId)
            .orElseThrow(() -> unauthorized("Password reset session is invalid."));
        responder.passwordHash = passwords.encode(body.newPassword());
        session.revokedAt = Instant.now();
        revokeSessions("RESPONDER", responder.id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/auth/login")
    @Transactional
    Map<String, Object> adminLogin(@Valid @RequestBody AdminLoginRequest body) {
        AdminUser admin = admins.findByEmailAndActiveTrue(body.email().trim().toLowerCase())
            .orElseThrow(() -> unauthorized("Invalid email or password."));
        if (!passwords.matches(body.password(), admin.passwordHash)) {
            throw unauthorized("Invalid email or password.");
        }
        OtpChallenge challenge = newChallenge("ADMIN_LOGIN", admin.id, admin.phone,
            "Your Cebu Emergency Finder admin code is ");
        return challengeResponse(challenge, PhoneNumbers.mask(admin.phone));
    }

    @PostMapping("/admin/auth/verify")
    @Transactional(noRollbackFor = ResponseStatusException.class)
    Map<String, Object> verifyAdmin(@Valid @RequestBody VerifyRequest body) {
        OtpChallenge challenge = verifyCode(body.challengeId(), body.code(), "ADMIN_LOGIN");
        AdminUser admin = admins.findById(requiredSubject(challenge))
            .orElseThrow(() -> unauthorized("Admin account is unavailable."));
        return Map.of("token", createSession("ADMIN", admin.id),
            "admin", Map.of("id", admin.id, "email", admin.email, "phoneSuffix",
                admin.phone.substring(Math.max(0, admin.phone.length() - 4)), "fullName", admin.fullName));
    }

    @PostMapping("/admin/auth/resend")
    @Transactional
    Map<String, Object> resendAdminCode(@Valid @RequestBody ChallengeRequest body) {
        OtpChallenge previous = challenges.findById(body.challengeId())
            .orElseThrow(() -> badRequest("Verification challenge is invalid or expired."));
        if (!"ADMIN_LOGIN".equals(previous.purpose) || previous.expiresAt.isBefore(Instant.now())) {
            throw badRequest("Verification challenge is invalid or expired.");
        }
        if (Duration.between(previous.lastSentAt, Instant.now()).compareTo(Duration.ofSeconds(60)) < 0) {
            throw conflict("Please wait before requesting another code.");
        }
        AdminUser admin = admins.findById(requiredSubject(previous))
            .orElseThrow(() -> unauthorized("Admin account is unavailable."));
        OtpChallenge next = newChallenge("ADMIN_LOGIN", admin.id, admin.phone,
            "Your Cebu Emergency Finder admin code is ");
        previous.expiresAt = Instant.now();
        return challengeResponse(next, PhoneNumbers.mask(admin.phone));
    }

    @GetMapping("/admin/auth/me")
    Map<String, Object> adminMe(HttpServletRequest request) {
        AdminUser admin = requireAdmin(request);
        return Map.of("id", admin.id, "email", admin.email, "phoneSuffix",
            admin.phone.substring(Math.max(0, admin.phone.length() - 4)), "fullName", admin.fullName);
    }

    @RequestMapping(path = {"/admin/auth/logout", "/responder/logout"}, method = RequestMethod.POST)
    @Transactional
    ResponseEntity<Void> logout(HttpServletRequest request) {
        String role = request.getRequestURI().endsWith("/admin/auth/logout") ? "ADMIN" : "RESPONDER";
        AuthSession session = authenticatedRequest(request, role);
        session.revokedAt = Instant.now();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/responders")
    List<Map<String, Object>> directory(
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String availability,
        @RequestParam(required = false) Double latitude,
        @RequestParam(required = false) Double longitude
    ) {
        validateCoordinates(latitude, longitude);
        return responders.findByActiveTrueOrderByIdAsc().stream()
            .filter(r -> "APPROVED".equals(r.approvalStatus))
            .filter(r -> !"OFF_DUTY".equals(r.availability))
            .filter(r -> type == null || r.unitType.equalsIgnoreCase(type))
            .filter(r -> availability == null || r.availability.equalsIgnoreCase(availability))
            .map(this::publicResponderView).toList();
    }

    @PostMapping("/incidents")
    @Transactional
    ResponseEntity<Map<String, Object>> createIncident(@Valid @RequestBody IncidentRequest body) {
        try {
            UUID.fromString(body.clientId());
        } catch (IllegalArgumentException exception) {
            throw badRequest("A valid client ID is required.");
        }
        validateCoordinates(body.latitude(), body.longitude());
        String priority = body.priority() == null ? "NORMAL" : body.priority().toUpperCase();
        if (!Set.of("NORMAL", "HIGH").contains(priority)) throw badRequest("Priority must be NORMAL or HIGH.");
        Incident incident = new Incident();
        incident.clientId = body.clientId();
        incident.category = body.category().trim();
        incident.description = clean(body.description());
        incident.requesterPhone = body.requesterPhone() == null || body.requesterPhone().isBlank()
            ? null : PhoneNumbers.normalizeRequired(body.requesterPhone());
        incident.priority = priority;
        incident.latitude = body.latitude();
        incident.longitude = body.longitude();
        incident.status = "OPEN";
        return ResponseEntity.status(HttpStatus.CREATED).body(incidentView(incidents.save(incident)));
    }

    @GetMapping("/incidents/by-client/{clientId}")
    @Transactional(readOnly = true)
    List<Map<String, Object>> clientIncidents(@PathVariable String clientId) {
        try {
            UUID.fromString(clientId);
        } catch (IllegalArgumentException exception) {
            throw badRequest("A valid client ID is required.");
        }
        return incidents.findByClientIdOrderByCreatedAtDesc(clientId).stream().map(this::incidentView).toList();
    }

    @GetMapping("/responder/me")
    Map<String, Object> responderMe(HttpServletRequest request) {
        return responderView(requireResponder(request));
    }

    @PatchMapping("/responder/availability")
    @Transactional
    Map<String, Object> responderAvailability(
        HttpServletRequest request,
        @Valid @RequestBody AvailabilityRequest body
    ) {
        Responder responder = requireApprovedResponder(request);
        responder.availability = validateAvailability(body.availability());
        return responderView(responder);
    }

    @GetMapping("/responder/incidents")
    @Transactional(readOnly = true)
    List<Map<String, Object>> responderIncidents(HttpServletRequest request) {
        Responder responder = requireApprovedResponder(request);
        return incidents.findByAssignedResponder_IdOrderByCreatedAtDesc(responder.id)
            .stream().map(this::incidentView).toList();
    }

    @PatchMapping("/responder/incidents/{id}/resolve")
    @Transactional
    Map<String, Object> resolveResponderIncident(HttpServletRequest request, @PathVariable Long id) {
        Responder responder = requireApprovedResponder(request);
        Incident incident = incidents.findById(id).orElseThrow(() -> notFound("Incident not found."));
        if (incident.assignedResponder == null || !incident.assignedResponder.id.equals(responder.id)) {
            throw forbidden("This incident is not assigned to your unit.");
        }
        if ("CANCELLED".equals(incident.status)) throw conflict("Cancelled incidents cannot be resolved.");
        incident.status = "RESOLVED";
        incident.updatedAt = Instant.now();
        responder.availability = "AVAILABLE";
        return incidentView(incident);
    }

    @GetMapping("/admin/dashboard")
    Map<String, Object> dashboard(HttpServletRequest request) {
        requireAdmin(request);
        long available = responders.findByActiveTrueOrderByIdAsc().stream()
            .filter(r -> "AVAILABLE".equals(r.availability) && "APPROVED".equals(r.approvalStatus)).count();
        return Map.of(
            "openIncidents", incidents.countByStatusIn(List.of("OPEN", "ASSIGNED")),
            "unassignedIncidents", incidents.countByStatus("OPEN"),
            "availableResponders", available,
            "pendingApprovals", responders.findByActiveTrueAndApprovalStatusOrderByIdAsc("PENDING").size(),
            "totalResponders", responders.findByActiveTrueOrderByIdAsc().size()
        );
    }

    @GetMapping("/admin/incidents")
    @Transactional(readOnly = true)
    List<Map<String, Object>> adminIncidents(HttpServletRequest request) {
        requireAdmin(request);
        return incidents.findAllByOrderByCreatedAtDesc().stream().map(this::incidentView).toList();
    }

    @PostMapping("/admin/incidents/{id}/assign")
    @Transactional
    Map<String, Object> assignIncident(
        HttpServletRequest request,
        @PathVariable Long id,
        @RequestBody(required = false) AssignRequest body
    ) {
        AdminUser admin = requireAdmin(request);
        Incident incident = incidents.findById(id).orElseThrow(() -> notFound("Incident not found."));
        if (!"OPEN".equals(incident.status)) throw conflict("Only open incidents can be assigned.");
        Responder responder;
        if (body != null && body.responderId() != null) {
            responder = responders.findById(body.responderId())
                .filter(r -> r.active && "APPROVED".equals(r.approvalStatus))
                .orElseThrow(() -> notFound("Approved responder not found."));
            if (!"AVAILABLE".equals(responder.availability)) throw conflict("That responder is not available.");
        } else {
            responder = responders.findByActiveTrueOrderByIdAsc().stream()
                .filter(r -> "APPROVED".equals(r.approvalStatus))
                .filter(r -> "AVAILABLE".equals(r.availability))
                .findFirst().orElseThrow(() -> conflict("No responders are currently available."));
        }
        incident.assignedResponder = responder;
        incident.status = "ASSIGNED";
        incident.updatedAt = Instant.now();
        responder.availability = "BUSY";
        recordAudit(admin, "ASSIGN_INCIDENT", "INCIDENT", incident.id);
        return incidentView(incident);
    }

    @PatchMapping("/admin/incidents/{id}/status")
    @Transactional
    Map<String, Object> changeIncidentStatus(
        HttpServletRequest request, @PathVariable Long id, @Valid @RequestBody StatusRequest body
    ) {
        AdminUser admin = requireAdmin(request);
        Incident incident = incidents.findById(id).orElseThrow(() -> notFound("Incident not found."));
        String status = body.status().toUpperCase();
        if (!Set.of("OPEN", "ASSIGNED", "RESOLVED", "CANCELLED").contains(status)) {
            throw badRequest("Unsupported incident status.");
        }
        incident.status = status;
        incident.updatedAt = Instant.now();
        if (("RESOLVED".equals(status) || "CANCELLED".equals(status)) && incident.assignedResponder != null) {
            incident.assignedResponder.availability = "AVAILABLE";
        }
        recordAudit(admin, "UPDATE_INCIDENT_STATUS_" + status, "INCIDENT", incident.id);
        return incidentView(incident);
    }

    @GetMapping("/admin/responders")
    List<Map<String, Object>> adminResponders(HttpServletRequest request) {
        AdminUser admin = requireAdmin(request);
        return responders.findByActiveTrueOrderByIdAsc().stream().map(this::responderView).toList();
    }

    @PostMapping("/admin/responders")
    @Transactional
    ResponseEntity<Map<String, Object>> addResponderUnit(
        HttpServletRequest request, @Valid @RequestBody AdminResponderRequest body
    ) {
        AdminUser admin = requireAdmin(request);
        Responder responder = new Responder();
        responder.fullName = body.fullName().trim();
        responder.phone = body.phone() == null || body.phone().isBlank()
            ? null : PhoneNumbers.normalizeRequired(body.phone());
        if (responder.phone != null && responders.existsByPhone(responder.phone)) {
            throw conflict("That mobile number is already registered.");
        }
        responder.unitType = body.unitType().trim();
        responder.unitName = clean(body.unitName());
        responder.baseStation = clean(body.baseStation());
        responder.availability = body.availability() == null
            ? "OFF_DUTY" : validateAvailability(body.availability());
        responder.approvalStatus = "APPROVED";
        responder.phoneVerified = responder.phone != null;
        Responder saved = responders.save(responder);
        recordAudit(admin, "CREATE_RESPONDER", "RESPONDER", saved.id);
        return ResponseEntity.status(HttpStatus.CREATED).body(responderView(saved));
    }

    @GetMapping("/admin/approvals")
    List<Map<String, Object>> pendingApprovals(HttpServletRequest request) {
        requireAdmin(request);
        return responders.findByActiveTrueAndApprovalStatusOrderByIdAsc("PENDING")
            .stream().map(this::responderView).toList();
    }

    @PatchMapping("/admin/approvals/{id}")
    @Transactional
    Map<String, Object> updateApproval(
        HttpServletRequest request, @PathVariable Long id, @Valid @RequestBody ApprovalRequest body
    ) {
        AdminUser admin = requireAdmin(request);
        Responder responder = responders.findById(id).orElseThrow(() -> notFound("Responder not found."));
        if (!responder.active || !"PENDING".equals(responder.approvalStatus)) {
            throw conflict("This application has already been reviewed.");
        }
        String status = body.status().toUpperCase();
        if (!Set.of("APPROVED", "REJECTED").contains(status)) {
            throw badRequest("Approval status must be APPROVED or REJECTED.");
        }
        responder.approvalStatus = status;
        recordAudit(admin, status + "_RESPONDER_APPLICATION", "RESPONDER", responder.id);
        return responderView(responder);
    }

    @PatchMapping("/admin/responders/{id}/availability")
    @Transactional
    Map<String, Object> adminAvailability(
        HttpServletRequest request, @PathVariable Long id, @Valid @RequestBody AvailabilityRequest body
    ) {
        AdminUser admin = requireAdmin(request);
        Responder responder = responders.findById(id)
            .filter(r -> r.active).orElseThrow(() -> notFound("Responder not found."));
        responder.availability = validateAvailability(body.availability());
        recordAudit(admin, "UPDATE_RESPONDER_AVAILABILITY", "RESPONDER", responder.id);
        return responderView(responder);
    }

    @DeleteMapping("/admin/responders/{id}")
    @Transactional
    ResponseEntity<Void> deactivateResponder(HttpServletRequest request, @PathVariable Long id) {
        AdminUser admin = requireAdmin(request);
        Responder responder = responders.findById(id).orElseThrow(() -> notFound("Responder not found."));
        responder.active = false;
        responder.availability = "OFF_DUTY";
        revokeSessions("RESPONDER", responder.id);
        recordAudit(admin, "DEACTIVATE_RESPONDER", "RESPONDER", responder.id);
        return ResponseEntity.noContent().build();
    }

    private OtpChallenge newChallenge(String purpose, Long subjectId, String phone, String message) {
        OtpChallenge challenge = new OtpChallenge();
        challenge.id = UUID.randomUUID().toString();
        challenge.purpose = purpose;
        challenge.subjectId = subjectId;
        challenge.expiresAt = Instant.now().plus(Duration.ofMinutes(5));
        challenge.attempts = 0;
        challenge.lastSentAt = Instant.now();
        String code = String.format("%06d", random.nextInt(1_000_000));
        challenge.codeHash = passwords.encode(code);
        challenges.save(challenge);
        if (phone != null) sms.send(phone, message + code + ".");
        return challenge;
    }

    private OtpChallenge verifyCode(String id, String code, String purpose) {
        OtpChallenge challenge = challenges.findById(id)
            .orElseThrow(() -> badRequest("The code is invalid or expired."));
        if (!purpose.equals(challenge.purpose) || challenge.expiresAt.isBefore(Instant.now())
            || challenge.attempts >= 5) {
            throw badRequest("The code is invalid or expired.");
        }
        challenge.attempts++;
        if (!passwords.matches(code, challenge.codeHash)) throw badRequest("The code is incorrect.");
        challenge.expiresAt = Instant.now();
        return challenge;
    }

    private Map<String, Object> challengeResponse(OtpChallenge challenge, String maskedPhone) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("challengeId", challenge.id);
        if (maskedPhone != null) response.put("maskedPhone", maskedPhone);
        response.put("expiresInSeconds", 300);
        return response;
    }

    private String createSession(String role, Long subjectId) {
        return createSession(role, subjectId, Duration.ofHours(12));
    }

    private String createSession(String role, Long subjectId, Duration duration) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        AuthSession session = new AuthSession();
        session.tokenHash = sha256(token);
        session.role = role;
        session.subjectId = subjectId;
        session.expiresAt = Instant.now().plus(duration);
        sessions.save(session);
        return token;
    }

    private AuthSession authenticate(String token, String expectedRole) {
        if (token == null || token.isBlank()) throw unauthorized("Authentication is required.");
        AuthSession session = sessions.findByTokenHashAndRevokedAtIsNullAndExpiresAtAfter(sha256(token), Instant.now())
            .orElseThrow(() -> unauthorized("Session is invalid or expired."));
        if (expectedRole != null && !expectedRole.equals(session.role)) throw forbidden("This account cannot access that resource.");
        return session;
    }

    private AuthSession authenticatedRequest(HttpServletRequest request, String role) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) throw unauthorized("Authentication is required.");
        return authenticate(header.substring(7), role);
    }

    private AdminUser requireAdmin(HttpServletRequest request) {
        AuthSession session = authenticatedRequest(request, "ADMIN");
        return admins.findById(session.subjectId).filter(a -> a.active)
            .orElseThrow(() -> unauthorized("Admin account is unavailable."));
    }

    private Responder requireResponder(HttpServletRequest request) {
        AuthSession session = authenticatedRequest(request, "RESPONDER");
        return responders.findById(session.subjectId).filter(r -> r.active)
            .orElseThrow(() -> unauthorized("Responder account is unavailable."));
    }

    private Responder requireApprovedResponder(HttpServletRequest request) {
        Responder responder = requireResponder(request);
        if (!"APPROVED".equals(responder.approvalStatus)) {
            throw forbidden("Your responder account has not been approved.");
        }
        return responder;
    }

    private void revokeSessions(String role, Long subjectId) {
        sessions.findByRoleAndSubjectIdAndRevokedAtIsNull(role, subjectId)
            .forEach(session -> session.revokedAt = Instant.now());
    }

    private void recordAudit(AdminUser admin, String action, String entityType, Long entityId) {
        AuditEvent event = new AuditEvent();
        event.adminId = admin.id;
        event.action = action;
        event.entityType = entityType;
        event.entityId = entityId;
        auditEvents.save(event);
    }

    private Map<String, Object> responderView(Responder responder) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", responder.id);
        view.put("fullName", responder.fullName);
        view.put("phone", responder.phone);
        view.put("unitType", responder.unitType);
        view.put("unitName", responder.unitName);
        view.put("baseStation", responder.baseStation);
        view.put("approvalStatus", responder.approvalStatus);
        view.put("availability", responder.availability);
        return view;
    }

    private Map<String, Object> publicResponderView(Responder responder) {
        Map<String, Object> view = responderView(responder);
        view.remove("phone");
        return view;
    }

    private Map<String, Object> incidentView(Incident incident) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", incident.id);
        view.put("clientId", incident.clientId);
        view.put("category", incident.category);
        view.put("description", incident.description);
        view.put("requesterPhone", incident.requesterPhone);
        view.put("priority", incident.priority);
        view.put("latitude", incident.latitude);
        view.put("longitude", incident.longitude);
        view.put("status", incident.status);
        view.put("assignedResponderId", incident.assignedResponder == null ? null : incident.assignedResponder.id);
        view.put("assignedResponderName", incident.assignedResponder == null ? null
            : Optional.ofNullable(incident.assignedResponder.unitName).orElse(incident.assignedResponder.fullName));
        view.put("createdAt", incident.createdAt);
        view.put("updatedAt", incident.updatedAt);
        return view;
    }

    private static String validateAvailability(String value) {
        String status = value.toUpperCase();
        if (!Set.of("AVAILABLE", "BUSY", "BREAK", "OFF_DUTY").contains(status)) {
            throw badRequest("Availability must be AVAILABLE, BUSY, BREAK, or OFF_DUTY.");
        }
        return status;
    }

    private static void validateCoordinates(Double latitude, Double longitude) {
        if ((latitude == null) != (longitude == null)) throw badRequest("Latitude and longitude must be provided together.");
        if (latitude != null && (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)) {
            throw badRequest("Coordinates are outside the valid range.");
        }
    }

    private static Long requiredSubject(OtpChallenge challenge) {
        if (challenge.subjectId == null) throw badRequest("The code is invalid or expired.");
        return challenge.subjectId;
    }

    private static String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable.", exception);
        }
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
    private static ResponseStatusException unauthorized(String message) {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, message);
    }
    private static ResponseStatusException forbidden(String message) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, message);
    }
    private static ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }
    private static ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    record RegisterRequest(
        @NotBlank @Size(max = 160) String fullName,
        @NotBlank String phone,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(max = 80) String unitType,
        @Size(max = 160) String unitName,
        @Size(max = 240) String baseStation
    ) {}
    record VerifyRequest(@NotBlank String challengeId, @NotBlank @Pattern(regexp = "\\d{6}") String code) {}
    record ChallengeRequest(@NotBlank String challengeId) {}
    record LoginRequest(@NotBlank String phone, @NotBlank String password) {}
    record PhoneRequest(@NotBlank String phone) {}
    record CompleteResetRequest(
        @NotBlank String resetToken,
        @NotBlank @Size(min = 8, max = 100) @Pattern(regexp = ".*\\d.*") String newPassword
    ) {}
    record AdminLoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
    record IncidentRequest(
        @NotBlank @Size(max = 100) String clientId,
        @NotBlank @Size(max = 100) String category,
        @Size(max = 2000) String description,
        String requesterPhone,
        String priority,
        @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
        @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude
    ) {}
    record AvailabilityRequest(@NotBlank String availability) {}
    record AssignRequest(Long responderId) {}
    record StatusRequest(@NotBlank String status) {}
    record AdminResponderRequest(
        @NotBlank @Size(max = 160) String fullName,
        String phone,
        @NotBlank @Size(max = 80) String unitType,
        @Size(max = 160) String unitName,
        @Size(max = 240) String baseStation,
        String availability
    ) {}
    record ApprovalRequest(@NotBlank String status) {}
}
