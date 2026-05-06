package com.example.petstore.controller;

import com.example.petstore.Service.DashboardService;
import com.example.petstore.dto.DashboardResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/home")
    public ResponseEntity<DashboardResponse> getHomeDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardData());
    }
}