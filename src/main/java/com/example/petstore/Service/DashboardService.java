package com.example.petstore.Service;

import com.example.petstore.dto.DashboardResponse;
import com.example.petstore.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private PetRepository petRepository;

    public DashboardResponse getDashboardData() {
        DashboardResponse response = new DashboardResponse();

        // Let the database do the heavy lifting of sorting and limiting
        response.setJustArrived(petRepository.findTop8ByOrderByIdDesc());
        response.setBestSelling(petRepository.findTop8ByOrderByPriceDesc());

        return response;
    }
}