package com.example.petstore.controller;

import com.example.petstore.model.User; // Ensure this matches your Entity package
import com.example.petstore.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

/**
 * This controller handles the Frontend rendering.
 * It uses Thymeleaf to display data on the browser.
 */
@Controller
public class UserViewController {

    @Autowired
    private UserService userService;

    // This method handles the request to view the user list
    @GetMapping("/show-users")
    public String viewUsersPage(Model model) {
        // 1. Fetch the list of users from the Service layer
//        List<User> listUsers = userService.getAllUsers();

        // 2. "usersList" is the variable name used in the HTML th:each loop
//        model.addAttribute("usersList", listUsers);

        // 3. Return the name of your HTML file: src/main/resources/templates/users.html
        return "users";
    }
}