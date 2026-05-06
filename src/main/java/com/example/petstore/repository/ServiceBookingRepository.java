package com.example.petstore.repository;

import com.example.petstore.model.ServiceBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceBookingRepository extends JpaRepository<ServiceBooking, String> {

    // Fetch all bookings for a user, sorted by the appointment time
    List<ServiceBooking> findByUserIdOrderByAppointmentTimeDesc(String userId);

    // Fetch all services history for a specific pet
    List<ServiceBooking> findByPetIdOrderByAppointmentTimeDesc(String petId);
}