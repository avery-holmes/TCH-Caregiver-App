package care.tch.beta;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class PhotoAndThrottleTest {
    @Test void rejectsEmptyOversizeAndDecompressionHeavyPhotos() throws Exception {
        assertThatIllegalArgumentException().isThrownBy(() -> ChildPhotos.sanitize(new byte[0]));
        assertThatIllegalArgumentException().isThrownBy(() -> ChildPhotos.sanitize(new byte[3 * 1024 * 1024 + 1]));
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(4100, 1, BufferedImage.TYPE_INT_RGB), "png", bytes);
        assertThatIllegalArgumentException().isThrownBy(() -> ChildPhotos.sanitize(bytes.toByteArray()));
    }

    @Test void throttleBoundsAttemptsByClientAndExpires() {
        Clock base = Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC);
        class AdjustableClock extends Clock {
            Instant now = base.instant();
            public java.time.ZoneId getZone() { return ZoneOffset.UTC; }
            public Clock withZone(java.time.ZoneId zone) { return this; }
            public Instant instant() { return now; }
        }
        AdjustableClock clock = new AdjustableClock();
        SignInThrottle throttle = new SignInThrottle(2, clock);
        assertThat(throttle.allow("first")).isTrue();
        assertThat(throttle.allow("first")).isTrue();
        assertThat(throttle.allow("first")).isFalse();
        assertThat(throttle.allow("second")).isTrue();
        clock.now = clock.now.plusSeconds(901);
        assertThat(throttle.allow("first")).isTrue();
    }
}
