package care.tch.beta;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import care.tch.beta.AccountStore.Caregiver;
import care.tch.beta.AccountStore.PublicAccount;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwords() { return new BCryptPasswordEncoder(12); }

    @Bean ApplicationRunner localOnly(Environment environment) {
        return args -> {
            if (!environment.acceptsProfiles(Profiles.of("local", "test"))) {
                throw new IllegalStateException("Only local synthetic testing is supported by this increment.");
            }
        };
    }

    @Bean SecurityFilterChain security(HttpSecurity http, ObjectMapper json,
            @Value("${tch.auth-attempt-limit}") int attemptLimit,
            @Qualifier("corsConfigurationSource") CorsConfigurationSource corsSource) throws Exception {
        http.cors(cors -> cors.configurationSource(corsSource))
            .csrf(Customizer.withDefaults())
            .authorizeHttpRequests(rules -> rules
                .requestMatchers(HttpMethod.GET, "/api/session/csrf").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/session/register", "/api/session/login").permitAll()
                .requestMatchers("/error").permitAll()
                .anyRequest().authenticated())
            .requestCache(cache -> cache.disable())
            .exceptionHandling(errors -> errors
                .authenticationEntryPoint((req, res, ex) -> res.sendError(401))
                .accessDeniedHandler((req, res, ex) -> res.sendError(403)))
            .formLogin(form -> form.loginProcessingUrl("/api/session/login").usernameParameter("email")
                .successHandler((req, res, auth) -> {
                    res.setContentType("application/json");
                    json.writeValue(res.getOutputStream(), PublicAccount.from((Caregiver) auth.getPrincipal()));
                })
                .failureHandler((req, res, ex) -> res.sendError(401)))
            .logout(logout -> logout.logoutUrl("/api/session/logout")
                .deleteCookies("JSESSIONID")
                .logoutSuccessHandler((req, res, auth) -> res.setStatus(204)))
            .addFilterBefore(new SignInThrottle(attemptLimit), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean CorsConfigurationSource corsConfigurationSource(@Value("${tch.allowed-origin}") String origin) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(origin));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Content-Type", "X-CSRF-TOKEN"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
