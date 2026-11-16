package com.cebu.emergency.controller;

import com.cebu.emergency.model.Responder;
import com.cebu.emergency.repository.ResponderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citizen")
@CrossOrigin(origins = "*")
public class CitizenController {

    @Autowired
    private ResponderRepository responderRepository;

    // Returns available units categorized for the home grid
    @GetMapping("/responders/available")
    public ResponseEntity<List<Responder>> getAvailableResponders(
            @RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(responderRepository.findByCategory(category));
        }
        return ResponseEntity.ok(responderRepository.findByStatusAndApprovalStatus(
                Responder.Status.AVAILABLE, Responder.ApprovalStatus.APPROVED));
    }
}