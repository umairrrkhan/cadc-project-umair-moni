package com.umni.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;


//this is the model honestly its the easiest part so far 

@Document(collection = "users")
public class User {
	@Id
	private String id;
	private String email ;
	private String password;
	private Date createdAt;
	 private String role;
	 
	 
	 public String getId() { return id;}
	 public void setId(String id) {this.id = id;}
	 public String getEmail() { return email; }
	 public void setEmail(String email) { this.email = email; }
	 public String getPassword() { return password; }
	 public void setPassword(String password) { this.password = password; }
	 public Date getCreatedAt() {return createdAt;}
	 public void setCreatedAt(Date createdAt) {this.createdAt = createdAt;}
	 public String getRole() {return role;}
	 public void setRole(String Role) {this.role  = role;}
	 
	public static void main(String[] args) {
		// TODO Auto-generated method stub

	}

}
