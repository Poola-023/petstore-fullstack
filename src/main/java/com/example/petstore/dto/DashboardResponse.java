package com.example.petstore.dto; // Or put it in your model package

import com.example.petstore.model.Pet;
import lombok.Data;
import java.util.List;

@Data
public class DashboardResponse {
    private List<Pet> justArrived;
    private List<Pet> bestSelling;
    private List<Pet> popular;
}