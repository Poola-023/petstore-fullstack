package com.example.petstore.repository;

import com.example.petstore.model.PetJournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PetJournalRepository extends JpaRepository<PetJournalEntry, String> {
    // Find all memories for a specific pet, newest first
    List<PetJournalEntry> findByPetIdOrderByEntryDateDesc(String petId);
}