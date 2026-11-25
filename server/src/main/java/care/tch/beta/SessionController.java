package care.tch.beta;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import care.tch.beta.AccountStore.Caregiver;
import care.tch.beta.AccountStore.PublicAccount;

@RestController
@RequestMapping("/api/session")
public class SessionController {
    private final AccountStore accounts;
    private final PasswordEncoder passwords;

    public SessionController(AccountStore accounts, PasswordEncoder passwords) {
        this.accounts = accounts;
        this.passwords = passwords;
    }

    public record Registration(@NotBlank @Email @Size(max = 254) String email,
                               @NotBlank @Size(max = 80) String displayName,
                               @NotBlank @Size(min = 15, max = 64) String password) {}

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken csrf) {
        return Map.of("token", csrf.getToken(), "headerName", csrf.getHeaderName());
    }

    @GetMapping("/me")
    public PublicAccount me(@AuthenticationPrincipal Caregiver account) { return PublicAccount.from(account); }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@Valid @RequestBody Registration input) {
        if (input.password().getBytes(StandardCharsets.UTF_8).length > 72 || input.displayName().isBlank()) {
            throw new IllegalArgumentException("Invalid account details");
        }
        accounts.create(input.email(), input.displayName(), passwords.encode(input.password()));
    }
}
