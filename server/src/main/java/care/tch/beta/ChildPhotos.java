package care.tch.beta;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.Iterator;
import java.util.UUID;
import javax.imageio.ImageIO;
import javax.imageio.stream.MemoryCacheImageInputStream;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import care.tch.beta.AccountStore.Caregiver;

@RestController
@RequestMapping("/api/children/{id}/photo")
public class ChildPhotos {
    private final ChildProfiles profiles;
    private final JdbcTemplate jdbc;

    public ChildPhotos(ChildProfiles profiles, JdbcTemplate jdbc) { this.profiles = profiles; this.jdbc = jdbc; }

    @GetMapping(produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> read(@AuthenticationPrincipal Caregiver owner, @PathVariable UUID id) {
        profiles.require(owner.id(), id);
        byte[] photo = jdbc.queryForObject("SELECT photo FROM child_profile WHERE id = ? AND owner_id = ?", byte[].class, id, owner.id());
        if (photo == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).contentType(MediaType.IMAGE_PNG).body(photo);
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void replace(@AuthenticationPrincipal Caregiver owner, @PathVariable UUID id,
                        @RequestParam("photo") MultipartFile photo) throws IOException {
        profiles.require(owner.id(), id);
        byte[] cleaned = sanitize(photo.getBytes());
        jdbc.update("UPDATE child_profile SET photo = ?, revision = revision + 1, updated_at = ? WHERE id = ? AND owner_id = ?",
                cleaned, Instant.now(), id, owner.id());
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal Caregiver owner, @PathVariable UUID id) {
        profiles.require(owner.id(), id);
        jdbc.update("UPDATE child_profile SET photo = NULL, revision = revision + 1, updated_at = ? WHERE id = ? AND owner_id = ?",
                Instant.now(), id, owner.id());
    }

    static byte[] sanitize(byte[] upload) throws IOException {
        if (upload.length == 0 || upload.length > 3 * 1024 * 1024) throw new IllegalArgumentException("Invalid photo size");
        try (ImageInputStream stream = new MemoryCacheImageInputStream(new ByteArrayInputStream(upload))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(stream);
            if (!readers.hasNext()) throw new IllegalArgumentException("Invalid photo format");
            ImageReader reader = readers.next();
            try {
                reader.setInput(stream, true, true);
                String format = reader.getFormatName();
                if (!format.equalsIgnoreCase("JPEG") && !format.equalsIgnoreCase("PNG")) {
                    throw new IllegalArgumentException("Use JPEG or PNG");
                }
                int width = reader.getWidth(0), height = reader.getHeight(0);
                if (width < 1 || height < 1 || width > 4096 || height > 4096 || (long) width * height > 8_000_000) {
                    throw new IllegalArgumentException("Photo dimensions are too large");
                }
                BufferedImage decoded = reader.read(0);
                // Re-encode pixels, removing original metadata (including location/EXIF).
                ByteArrayOutputStream output = new ByteArrayOutputStream();
                ImageIO.write(decoded, "png", output);
                if (output.size() > 3 * 1024 * 1024) throw new IllegalArgumentException("Photo is too large");
                return output.toByteArray();
            } finally { reader.dispose(); }
        } catch (javax.imageio.IIOException error) {
            throw new IllegalArgumentException("Invalid image contents");
        }
    }
}
