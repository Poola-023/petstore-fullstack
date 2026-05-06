/*
package com.example.petstore.controller;

import com.example.petstore.Configuration.JwtUtils;
import com.example.petstore.Service.UserService;
import com.example.petstore.model.User;
import com.example.petstore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/send-signup-otp")
    public ResponseEntity<String> sendSignupOtp(@RequestBody Map<String, String> req) {
        String phone = req.get("phoneNumber");
        String email = req.get("email");

        if (phone == null || email == null) {
            return ResponseEntity.badRequest().body("Phone and Email are required");
        }

        userService.generateOTP(phone, email);
        return ResponseEntity.ok("OTP Sent");
    }

    @PostMapping("/verify-signup")
    public ResponseEntity<?> verifySignup(@RequestBody User user) {
        if (userService.verifyOTP(user.getPhoneNumber(), user.getOtp())) {
            Optional<User> existingUser = userService.findByPhone(user.getPhoneNumber());
            if (existingUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("User already registered");
            }
            // userService.registerUser() will handle generating the USR... ID
            return ResponseEntity.ok(userService.registerUser(user));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid PIN");
    }

    @PostMapping("/send-login-otp")
    public ResponseEntity<String> sendLoginOtp(@RequestBody Map<String, String> req) {
        String phone = req.get("phoneNumber");
        Optional<User> userOpt = userService.findByPhone(phone);

        if (userOpt.isPresent()) {
            userService.generateOTP(phone, userOpt.get().getEmail());
            return ResponseEntity.ok("OTP Sent");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Boutique record not found for this number");
    }

    */
/*@PostMapping("/verify-login")
    public ResponseEntity<?> verifyLogin(@RequestBody Map<String, String> req) {
        String phone = req.get("phoneNumber");
        String otp = req.get("otp");

        if (phone == null || otp == null) {
            return ResponseEntity.badRequest().body("Missing credentials");
        }

        if (userService.verifyOTP(phone, otp)) {
            Optional<User> userOpt = userService.findByPhone(phone);
            return userOpt.isPresent()
                    ? ResponseEntity.ok(userOpt.get())
                    : ResponseEntity.status(HttpStatus.NOT_FOUND).body("User lost during verification");
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid PIN");
    }*//*

    @Autowired
    private JwtUtils jwtUtils; // ✨ INJECT THE JWT UTILS HERE

    @PostMapping("/verify-login")
    public ResponseEntity<?> verifyLogin(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        String otp = request.get("otp");

        // ... Your existing logic to check if the OTP is correct ...

        // Assuming you fetch the user after successful OTP verification:
        Optional<User> user = userService.findByPhone(phoneNumber);

        if (user != null) {
            // ✨ 1. GENERATE THE JWT TOKEN
            // We assign the "CUSTOMER" role here since this is the User login
            String token = jwtUtils.generateToken(user.get().getUsername(), "CUSTOMER");

            // ✨ 2. PACKAGE THE TOKEN AND USER TOGETHER
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("token", token);
            responseData.put("user", user);

            // ✨ 3. SEND BOTH BACK TO REACT
            return ResponseEntity.ok(responseData);
        } else {
            return ResponseEntity.badRequest().body("Invalid PIN.");
        }
    }

    @Autowired
    private UserRepository userRepository;

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable String id, // ✨ CHANGED: Long to String
            @RequestBody User userDetails) {

        return userRepository.findById(id).map(user -> {
            user.setUsername(userDetails.getUsername());
            user.setEmail(userDetails.getEmail());
            user.setPhoneNumber(userDetails.getPhoneNumber());
            user.setProfileImg(userDetails.getProfileImg());

            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/updateImage/{id}")
    public ResponseEntity<?> updateProfileImage(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            String base64Image = payload.get("profileImg");
            java.util.Optional<User> userOpt = userRepository.findById(id);

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                // Assuming your User entity has a profileImg field.
                // If it is stored as a String (Base64), use this. If byte[], decode it first.
                user.setProfileImg(base64Image);

                userRepository.save(user);
                return ResponseEntity.ok("Profile image updated successfully");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating image");
        }
    }
}*/

/*
package com.example.petstore.controller;

import com.example.petstore.Configuration.JwtUtils;
import com.example.petstore.Service.UserService;
import com.example.petstore.model.User;
import com.example.petstore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/send-signup-otp")
    public ResponseEntity<String> sendSignupOtp(@RequestBody Map<String, String> req) {
        String phone = req.get("phoneNumber");
        String email = req.get("email");

        if (phone == null || email == null) {
            return ResponseEntity.badRequest().body("Phone and Email are required");
        }

        userService.generateOTP(phone, email);
        return ResponseEntity.ok("OTP Sent");
    }

    @PostMapping("/verify-signup")
    public ResponseEntity<?> verifySignup(@RequestBody User user) {
        if (userService.verifyOTP(user.getPhoneNumber(), user.getOtp())) {
            Optional<User> existingUser = userService.findByPhone(user.getPhoneNumber());
            if (existingUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("User already registered");
            }
            return ResponseEntity.ok(userService.registerUser(user));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid PIN");
    }

    @PostMapping("/send-login-otp")
    public ResponseEntity<String> sendLoginOtp(@RequestBody Map<String, String> req) {
        String phone = req.get("phoneNumber");
        Optional<User> userOpt = userService.findByPhone(phone);

        if (userOpt.isPresent()) {
            userService.generateOTP(phone, userOpt.get().getEmail());
            return ResponseEntity.ok("OTP Sent");
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Boutique record not found for this number");
    }

    @PostMapping("/verify-login")
    public ResponseEntity<?> verifyLogin(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        String otp = request.get("otp");

        // 1. Verify OTP
        if (userService.verifyOTP(phoneNumber, otp)) {
            Optional<User> userOpt = userService.findByPhone(phoneNumber);

            if (userOpt.isPresent()) {
                User loggedInUser = userOpt.get(); // ✨ FIXED: Extract actual User from Optional

                String token = jwtUtils.generateToken(loggedInUser.getUsername(), "CUSTOMER");

                Map<String, Object> responseData = new HashMap<>();
                responseData.put("token", token);

                // ✨ CRITICAL FIX: Create a "Lean" User to send to React.
                // We deliberately exclude the massive 'profileImg' here to prevent the
                // browser's localStorage from throwing a QuotaExceededError crash.
                Map<String, Object> leanUser = new HashMap<>();
                leanUser.put("id", loggedInUser.getUserId());
                leanUser.put("userId", loggedInUser.getUserId());
                leanUser.put("username", loggedInUser.getUsername());
                leanUser.put("phoneNumber", loggedInUser.getPhoneNumber());
                leanUser.put("email", loggedInUser.getEmail());
                leanUser.put("role", "CUSTOMER"); // Explicitly tell React this is a customer

                responseData.put("user", leanUser);

                return ResponseEntity.ok(responseData);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid PIN.");
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable String id,
            @RequestBody User userDetails) {

        return userRepository.findById(id).map(user -> {
            user.setUsername(userDetails.getUsername());
            user.setEmail(userDetails.getEmail());
            user.setPhoneNumber(userDetails.getPhoneNumber());

            // Only update image if it's explicitly sent in this payload
            if (userDetails.getProfileImg() != null) {
                user.setProfileImg(userDetails.getProfileImg());
            }

            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(updatedUser);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/updateImage/{id}")
    public ResponseEntity<?> updateProfileImage(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            String base64Image = payload.get("profileImg");
            java.util.Optional<User> userOpt = userRepository.findById(id);

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setProfileImg(base64Image);
                userRepository.save(user);
                return ResponseEntity.ok("Profile image updated successfully");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating image");
        }
    }
}*/

package com.example.petstore.controller;

import com.example.petstore.Configuration.JwtUtils;
import com.example.petstore.Service.EmailService;
import com.example.petstore.Service.UserService;
import com.example.petstore.model.User;
import com.example.petstore.model.UserSession;
import com.example.petstore.repository.UserRepository;
import com.example.petstore.repository.UserSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserSessionRepository sessionRepository;

    @PostMapping("/send-signup-otp")
    public ResponseEntity<String> sendSignupOtp(@RequestBody Map<String, String> req) {
        String phone = req.get("phoneNumber");
        String email = req.get("email");
        if (phone == null || email == null) return ResponseEntity.badRequest().body("Phone and Email required");
        userService.generateOTP(phone, email);
        return ResponseEntity.ok("OTP Sent");
    }

    @PostMapping("/verify-signup")
    public ResponseEntity<?> verifySignup(@RequestBody User user) {
        if (userService.verifyOTP(user.getPhoneNumber(), user.getOtp())) {
            if (userService.findByPhone(user.getPhoneNumber()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("User already registered");
            }
            return ResponseEntity.ok(userService.registerUser(user));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid PIN");
    }

    @PostMapping("/send-login-otp")
    public ResponseEntity<String> sendLoginOtp(@RequestBody Map<String, String> req) {
        String phone = req.get("phoneNumber");
        Optional<User> userOpt = userService.findByPhone(phone);
        if (userOpt.isPresent()) {
            userService.generateOTP(phone, userOpt.get().getEmail());
            return ResponseEntity.ok("OTP Sent");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Boutique record not found");
    }

    // ✨ CRITICAL FIX IS HERE
   /* @PostMapping("/verify-login")
    public ResponseEntity<?> verifyLogin(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        String otp = request.get("otp");

        if (userService.verifyOTP(phoneNumber, otp)) {
            Optional<User> userOpt = userService.findByPhone(phoneNumber);

            if (userOpt.isPresent()) {
                User loggedInUser = userOpt.get(); // 1. Extract the actual User object

                String token = jwtUtils.generateToken(loggedInUser.getUsername(), "CUSTOMER");

                Map<String, Object> responseData = new HashMap<>();
                responseData.put("token", token);

                // 2. Create a LEAN user object (Leaves the massive profileImg out)
                Map<String, Object> leanUser = new HashMap<>();
                leanUser.put("id", loggedInUser.getUserId());
                leanUser.put("userId", loggedInUser.getUserId());
                leanUser.put("username", loggedInUser.getUsername());
                leanUser.put("phoneNumber", loggedInUser.getPhoneNumber());
                leanUser.put("email", loggedInUser.getEmail());
                leanUser.put("role", "CUSTOMER"); // 3. Explicitly set role for React Router

                responseData.put("user", leanUser);
                return ResponseEntity.ok(responseData);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid PIN.");
    }*/

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUserProfile(@PathVariable String id, @RequestBody User userDetails) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(userDetails.getUsername());
            user.setEmail(userDetails.getEmail());
            user.setPhoneNumber(userDetails.getPhoneNumber());
            if (userDetails.getProfileImg() != null) user.setProfileImg(userDetails.getProfileImg());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/updateImage/{id}")
    public ResponseEntity<?> updateProfileImage(@PathVariable String id, @RequestBody Map<String, String> payload) {
        try {
            String base64Image = payload.get("profileImg");
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setProfileImg(base64Image);
                userRepository.save(user);
                return ResponseEntity.ok("Profile image updated successfully");
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating image");
        }
    }

    @PostMapping("/verify-login")
    public ResponseEntity<?> verifyLogin(@RequestBody Map<String, String> request, HttpServletRequest servletRequest) {
        String phoneNumber = request.get("phoneNumber");
        String otp = request.get("otp");

        String exactDevice = request.getOrDefault("deviceInfo", "Unknown Device");
        String clientIp = servletRequest.getRemoteAddr();

        if (userService.verifyOTP(phoneNumber, otp)) {
            Optional<User> userOpt = userService.findByPhone(phoneNumber);

            if (userOpt.isPresent()) {
                User loggedInUser = userOpt.get();
                UserSession session = new UserSession();
                session.setUserId(loggedInUser.getUserId());
                session.setDeviceInfo(exactDevice);
                session.setIpAddress(clientIp);
                sessionRepository.save(session);

                // 1. Generate Security Token
                String token = jwtUtils.generateToken(loggedInUser.getUsername(), "CUSTOMER");

                String targetEmail = loggedInUser.getEmail() != null ? loggedInUser.getEmail() : "user@example.com";
                emailService.sendLoginNotification(
                        loggedInUser.getEmail(),
                        loggedInUser.getUsername(),
                        exactDevice,
                        "Hyderabad (IP: " + clientIp + ")"
                );

                // 4. Construct Response
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("token", token);

                Map<String, Object> leanUser = new HashMap<>();
                leanUser.put("id", loggedInUser.getUserId());
                leanUser.put("userId", loggedInUser.getUserId());
                leanUser.put("username", loggedInUser.getUsername());
                leanUser.put("phoneNumber", loggedInUser.getPhoneNumber());
                leanUser.put("email", loggedInUser.getEmail());
                leanUser.put("role", "CUSTOMER");

                responseData.put("user", leanUser);

                System.out.println("🛡️ Security: Login notification sent for user: " + loggedInUser.getUsername());
                return ResponseEntity.ok(responseData);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid PIN.");
    }

    /**
     * ✨ Utility to clean up the User-Agent string for the email
     */
    private String parseDevice(String ua) {
        if (ua == null) return "Unknown Device";
        if (ua.contains("Android")) return "Android Mobile";
        if (ua.contains("iPhone")) return "iPhone";
        if (ua.contains("Windows")) return "Windows PC";
        if (ua.contains("Macintosh")) return "MacBook / iMac";
        return "Web Browser";
    }
    @GetMapping("/sessions/{userId}")
    public ResponseEntity<List<UserSession>> getSessions(@PathVariable String userId) {
        // Matches /api/users/sessions/{userId}
        return ResponseEntity.ok(sessionRepository.findByUserIdOrderByLoginTimeDesc(userId));
    }
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<?> logoutDevice(@PathVariable String sessionId) {
        sessionRepository.deleteById(sessionId);
        return ResponseEntity.ok("Device signed out successfully");
    }

    // ✨ CONSTRAINT 3: HEARTBEAT (Call this from React every few minutes)
    @PutMapping("/sessions/heartbeat/{userId}/{deviceInfo}")
    public ResponseEntity<?> updateHeartbeat(@PathVariable String userId, @PathVariable String deviceInfo) {
        Optional<UserSession> session = sessionRepository.findByUserIdAndDeviceInfo(userId, deviceInfo);
        session.ifPresent(s -> {
            s.setLastSeen(LocalDateTime.now());
            sessionRepository.save(s);
        });
        return ResponseEntity.ok().build();
    }
}