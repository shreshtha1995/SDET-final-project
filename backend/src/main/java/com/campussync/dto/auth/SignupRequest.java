package com.campussync.dto.auth;

import com.campussync.model.enums.Gender;
import jakarta.validation.constraints.*;

// Step 2 of sign-up: the full profile the user submits AFTER their Cognizant ID
// has been verified. Jackson maps the incoming JSON onto this record at runtime.
// idType/role are NOT taken from the client — the server derives them from the
// verified directory entry so they can't be spoofed.
public record SignupRequest(
        @NotBlank(message = "Cognizant ID is required") String cognizantId,
        @NotBlank(message = "Name is required") String name,
        @NotBlank @Email(message = "A valid email is required") String email,
        @NotBlank @Pattern(regexp = "\\d{10}", message = "Phone number must be 10 digits") String phoneNumber,
        @NotNull(message = "Gender is required") Gender gender,
        @NotBlank @Size(min = 7, message = "Password must be at least 7 characters")
        @Pattern(regexp = "\\S+", message = "Password must not contain spaces")
        String password
)
{}
