package com.umni.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class DeleteAccountRequest {

    @NotBlank(message = "Current password is required")
    private String password;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
