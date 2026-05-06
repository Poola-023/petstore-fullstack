package com.example.petstore.Configuration;


import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    // ✨ FIXED: This string is now long enough to satisfy the 512-bit requirement
    private final String jwtSecret = "BoutiquePetStoreSuperSecretKeyThatIsExceedinglyLongAndVerySecure2026!@#$";
    private final int jwtExpirationMs = 86400000; // 24 hours

    public String generateToken(String username, String role) {
        // Convert the string into a secure Key object
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS512) // ✨ HS512 is now happy
                .compact();
    }
}