package com.umni.auth.controller;

import com.umni.auth.model.User;

import java.util.Optional;
import com.umni.auth.repository.UserRepository;
import com.umni.common.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Date;
import java.util.Map;
import java.util.HashMap;
import jakarta.validation.Valid;

import com.umni.auth.dto.SignupRequest;

import com.umni.auth.dto.LoginRequest;


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
	public ResponseEntity<?> signup(@RequestBody @Valid SignupRequest request){
		String email = request.getEmail();
		String password = request.getPassword();
		
		if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password are required"));
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "email already exists"));
        }
        
        if(password.length()<5) {
        	return ResponseEntity.badRequest().body(Map.of("error","password must be at least 6 charachter"));
        }
        
		User user = new User();
		user.setEmail(email);
		user.setPassword(encoder.encode(password));
		user.setCreatedAt(new Date());
		user.setRole("USER");
		userRepository.save(user);
		
		String token = jwtUtil.generateToken(email , user.getId());
		Map<String , Object> response = new HashMap<>();
		response.put("token", token);
		response.put("user", Map.of("email",user.getEmail(),
				"role",user.getRole()));
		return ResponseEntity.ok(Map.of("token", token, "user", Map.of("email", request.getEmail())));
	}
	
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody @Valid LoginRequest request){
		String email = request.getEmail();
		String password = request.getPassword();
		
		Optional<User> userOpt = userRepository.findByEmail(email);
		
		if(userOpt.isEmpty() || !encoder.matches(password , userOpt.get().getPassword())){
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("error","invalid email or password"));
		}
		
		User user = userOpt.get();
		String token  = jwtUtil.generateToken(email , user.getId());
		Map<String , Object> response = new HashMap<>();
		response.put("token" , token);
		response.put("USER", Map.of("email",user.getEmail(),
				"role",user.getRole()));
		
		return ResponseEntity.ok(Map.of("token", token, "user", Map.of("email", request.getEmail())));
	
		
	}
	

}
