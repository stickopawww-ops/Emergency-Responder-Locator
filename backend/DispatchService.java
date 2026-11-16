package com.cebu.emergency.service;

import com.cebu.emergency.model.Incident;
import com.cebu.emergency.model.Responder;
import com.cebu.emergency.repository.IncidentRepository;
import com.cebu.emergency.repository.ResponderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DispatchService {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private ResponderRepository responderRepository;

    @Transactional
    public Incident assignIncidentToResponder(Long incidentId, Long responderId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        
        Responder responder = responderRepository.findById(responderId)
                .orElseThrow(() -> new RuntimeException("Responder not found"));

        if (responder.getStatus() != Responder.Status.AVAILABLE) {
            throw new IllegalStateException("Selected unit is not available.");
        }

        // Update Incident
        incident.setAssignedUnitId(responder.getId());
        incident.setStatus(Incident.IncidentStatus.ACTIVE);
        incidentRepository.save(incident);

        // Automatically flip responder status to BUSY so they don't get double-booked
        responder.setStatus(Responder.Status.BUSY);
        responderRepository.save(responder);

        return incident;
    }
}