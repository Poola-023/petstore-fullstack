package com.example.petstore.controller;

import com.example.petstore.model.PetJournalEntry;
import com.example.petstore.repository.PetJournalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/journal")
@CrossOrigin(origins = "*")
public class JournalController {

    @Autowired
    private PetJournalRepository journalRepository;

    /**
     * ✨ SAVE NEW MILESTONE
     * POST http://localhost:8090/api/journal/save
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveEntry(@RequestBody PetJournalEntry entry) {
        try {
            PetJournalEntry savedEntry = journalRepository.save(entry);
            return ResponseEntity.ok(savedEntry);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to save memory: " + e.getMessage());
        }
    }

    /**
     * ✨ FETCH PET TIMELINE
     * GET http://localhost:8090/api/journal/{petId}
     */
    @GetMapping("/{petId}")
    public ResponseEntity<List<PetJournalEntry>> getPetJournal(@PathVariable String petId) {
        List<PetJournalEntry> timeline = journalRepository.findByPetIdOrderByEntryDateDesc(petId);
        return ResponseEntity.ok(timeline);
    }

    /**
     * ✨ DELETE A MEMORY
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteEntry(@PathVariable String id) {
        if (journalRepository.existsById(id)) {
            journalRepository.deleteById(id);
            return ResponseEntity.ok("Memory removed from timeline.");
        }
        return ResponseEntity.notFound().build();
    }
}