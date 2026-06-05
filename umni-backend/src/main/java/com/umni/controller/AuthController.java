package com.umni.controller;

import com.umni.model.User;
import com.umni.repository.UserRepository;
import com.umni.service.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Date;
import java.util.Map;
import java.util.HashMap;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private JwtUtil jwtUtil;
	
	@Autowired
    private BCryptPasswordEncoder encoder;
	
	@PostMapping("/signup")
	public ResponseEntity<?> signup(@RequestBody Map<String , String> body){
		String email = body.get("email");
		String password = body.get("password");
		
		if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password are required"));
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "email already exists"));
        }
        
        if(password.length()<9) {
        	return ResponseEntity.badRequest().body(Map.of("error","password must be at least 8 charachter"));
        }
        
		User user = new User();
		user.setEmail(email);
		user.setPassword(encoder.encode(password));
		user.setCreatedAt(new Date());
		user.setRole("USER");
		userRepository.save(user);
		
		String token = jwtUtil.generateToken(email);
		Map<String , Object> response = new HashMap<>();
		response.put("token", token);
		response.put("user", Map.of("email",user.getEmail(),
				"role",user.getRole()));
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

}
