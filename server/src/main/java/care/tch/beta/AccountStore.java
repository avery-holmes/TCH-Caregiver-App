package care.tch.beta;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Repository;

@Repository
public class AccountStore implements UserDetailsService {
    private final JdbcTemplate jdbc;

    public AccountStore(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public record Caregiver(UUID id, String email, String displayName, String passwordHash)
            implements UserDetails, Serializable {
        @Override public String getUsername() { return email; }
        @Override public String getPassword() { return passwordHash; }
        @Override public List<? extends GrantedAuthority> getAuthorities() {
            return List.of(new SimpleGrantedAuthority("ROLE_CAREGIVER"));
        }
    }

    public record PublicAccount(UUID id, String email, String displayName) {
        static PublicAccount from(Caregiver account) {
            return new PublicAccount(account.id(), account.email(), account.displayName());
        }
    }

    @Override public Caregiver loadUserByUsername(String email) {
        return jdbc.query("SELECT * FROM caregiver_account WHERE email = ?",
                (rs, row) -> new Caregiver(rs.getObject("id", UUID.class), rs.getString("email"),
                        rs.getString("display_name"), rs.getString("password_hash")), normalizeEmail(email))
                .stream().findFirst().orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
    }

    public void create(String email, String displayName, String passwordHash) {
        jdbc.update("INSERT INTO caregiver_account (id, email, display_name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
                UUID.randomUUID(), normalizeEmail(email), displayName.trim(), passwordHash, Instant.now());
    }

    private static String normalizeEmail(String value) { return value.trim().toLowerCase(Locale.ROOT); }
}
