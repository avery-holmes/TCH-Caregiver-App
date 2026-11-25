package care.tch.beta;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.filter.OncePerRequestFilter;

/** Bounded local-service protection; distributed abuse controls are a deployment gate. */
class SignInThrottle extends OncePerRequestFilter {
    private static final long WINDOW = 15 * 60 * 1000L;
    private final Map<String, Bucket> attempts = new HashMap<>();
    private final int limit;
    private final Clock clock;
    private record Bucket(long startedAt, int count) {}

    SignInThrottle(int limit) { this(limit, Clock.systemUTC()); }
    SignInThrottle(int limit, Clock clock) { this.limit = limit; this.clock = clock; }

    synchronized boolean allow(String address) {
        long now = clock.millis();
        attempts.entrySet().removeIf(entry -> now - entry.getValue().startedAt() >= WINDOW);
        Bucket bucket = attempts.getOrDefault(address, new Bucket(now, 0));
        if (bucket.count() >= limit || (attempts.size() >= 1000 && !attempts.containsKey(address))) return false;
        attempts.put(address, new Bucket(bucket.startedAt(), bucket.count() + 1));
        return true;
    }

    @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        if (req.getMethod().equals("POST") &&
                (req.getServletPath().equals("/api/session/login") || req.getServletPath().equals("/api/session/register")) &&
                !allow(req.getRemoteAddr())) {
            res.setHeader("Retry-After", "900");
            res.sendError(429);
            return;
        }
        chain.doFilter(req, res);
    }
}
