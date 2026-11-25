package care.tch.beta;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import care.tch.beta.AccountStore.Caregiver;

/** Every query is scoped by the authenticated owner, never a client-supplied user ID. */
@RestController
@RequestMapping("/api/children")
public class ChildProfiles {
    private final JdbcTemplate jdbc;

    public ChildProfiles(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public record Child(UUID id, String displayName, LocalDate birthDate, String timeZone,
                        String careSummary, long revision, boolean hasPhoto) {}

    public record Details(@NotBlank @Size(max = 80) String displayName,
                          @PastOrPresent LocalDate birthDate,
                          @NotBlank @Size(max = 80) String timeZone,
                          @Size(max = 2000) String careSummary) {}

    public record Update(@Valid Details details, @Positive long revision) {}

    @GetMapping
    public List<Child> list(@AuthenticationPrincipal Caregiver owner) {
        return jdbc.query("SELECT id, display_name, birth_date, time_zone, care_summary, revision, photo IS NOT NULL AS has_photo FROM child_profile WHERE owner_id = ?",
                (rs, row) -> new Child(rs.getObject("id", UUID.class), rs.getString("display_name"),
                        rs.getObject("birth_date", LocalDate.class), rs.getString("time_zone"),
                        rs.getString("care_summary"), rs.getLong("revision"), rs.getBoolean("has_photo")), owner.id());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Child create(@AuthenticationPrincipal Caregiver owner, @Valid @RequestBody Details input) {
        validate(input);
        UUID id = UUID.randomUUID();
        jdbc.update("INSERT INTO child_profile (id, owner_id, display_name, birth_date, time_zone, care_summary, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                id, owner.id(), input.displayName().trim(), input.birthDate(), input.timeZone(), summary(input), Instant.now());
        return require(owner.id(), id);
    }

    @PutMapping("/{id}")
    public Child update(@AuthenticationPrincipal Caregiver owner, @PathVariable UUID id,
                        @Valid @RequestBody Update input) {
        if (input.details() == null) throw new IllegalArgumentException("Missing profile details");
        validate(input.details());
        require(owner.id(), id);
        int changed = jdbc.update("UPDATE child_profile SET display_name = ?, birth_date = ?, time_zone = ?, care_summary = ?, revision = revision + 1, updated_at = ? WHERE id = ? AND owner_id = ? AND revision = ?",
                input.details().displayName().trim(), input.details().birthDate(), input.details().timeZone(),
                summary(input.details()), Instant.now(), id, owner.id(), input.revision());
        if (changed != 1) throw new ResponseStatusException(HttpStatus.CONFLICT, "Reload the profile before editing.");
        return require(owner.id(), id);
    }

    Child require(UUID ownerId, UUID childId) {
        return jdbc.query("SELECT id, display_name, birth_date, time_zone, care_summary, revision, photo IS NOT NULL AS has_photo FROM child_profile WHERE id = ? AND owner_id = ?",
                (rs, row) -> new Child(rs.getObject("id", UUID.class), rs.getString("display_name"),
                        rs.getObject("birth_date", LocalDate.class), rs.getString("time_zone"),
                        rs.getString("care_summary"), rs.getLong("revision"), rs.getBoolean("has_photo")), childId, ownerId)
                .stream().findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private static void validate(Details input) {
        if (input.displayName().isBlank()) throw new IllegalArgumentException("Missing display name");
        try { ZoneId.of(input.timeZone()); }
        catch (java.time.DateTimeException ex) { throw new IllegalArgumentException("Invalid timezone"); }
    }

    private static String summary(Details input) { return input.careSummary() == null ? "" : input.careSummary().trim(); }
}
