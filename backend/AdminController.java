package com.cebu.emergency.controller;

import com.cebu.emergency.model.Incident;
import com.cebu.emergency.model.Responder;
import com.cebu.emergency.repository.IncidentRepository;
import com.cebu.emergency.repository.ResponderRepository;
import com.cebu.emergency.service.DispatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private ResponderRepository responderRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private DispatchService dispatchService;

    // 1. Fetch pending responder registration approvals
    @GetMapping("/approvals/pending")
    public List<Responder> getPendingApprovals() {
        return responderRepository.findByApprovalStatus(Responder.ApprovalStatus.PENDING);
    }

    // 2. Approve or Reject a responder account
    @PatchRequestMappping("/approvals/{id}")
    public ResponseEntity<Responder> updateApprovalStatus(
            @PathVariable Long id, @RequestParam Responder.ApprovalStatus status) {
        Responder responder = responderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Responder not found"));
        responder.setApprovalStatus(status);
        return ResponseEntity.ok(responderRepository.save(responder));
    }

    // 3. Get all live incidents for dispatch view
    @GetMapping("/incidents/live")
    public List<Incident> getLiveIncidents() {
        return incidentRepository.findByStatus(Incident.IncidentStatus.UNASSIGNED);
    }

    // 4. Assign unit to emergency call
    @PostMapping("/incidents/{incidentId}/assign/{responderId}")
    public ResponseEntity<Incident> assignUnit(
            @PathVariable Long incidentId, @PathVariable Long responderId) {
        Incident updatedIncident = dispatchService.assignIncidentToResponder(incidentId, responderId);
        return ResponseEntity.ok(updatedIncident);
    }
}