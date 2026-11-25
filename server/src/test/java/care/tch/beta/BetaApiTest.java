package care.tch.beta;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:tch-tests;DB_CLOSE_DELAY=-1",
    "spring.datasource.username=sa", "spring.datasource.password=",
    "server.servlet.session.cookie.secure=false", "tch.auth-attempt-limit=1000"
})
@ActiveProfiles("test")
@AutoConfigureMockMvc
class BetaApiTest {
    private static final String PASSWORD = "fictional-test-passphrase";
    private static final String DETAILS = """
        {"displayName":"Sample Child","birthDate":"2020-01-02","timeZone":"America/New_York","careSummary":"Fictional routine notes"}
        """;
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;

    @BeforeEach void clearSyntheticData() {
        jdbc.update("DELETE FROM child_profile");
        jdbc.update("DELETE FROM caregiver_account");
    }

    MockHttpSession account(String email) throws Exception {
        mvc.perform(post("/api/session/register").with(csrf()).contentType("application/json")
            .content(json.writeValueAsString(new SessionController.Registration(email, "Test Caregiver", PASSWORD))))
            .andExpect(status().isCreated());
        var result = mvc.perform(get("/api/session/csrf")).andExpect(status().isOk()).andReturn();
        MockHttpSession session = (MockHttpSession) result.getRequest().getSession();
        String oldSessionId = session.getId();
        String token = json.readTree(result.getResponse().getContentAsString()).get("token").asText();
        mvc.perform(post("/api/session/login").session(session).header("X-CSRF-TOKEN", token)
            .contentType("application/x-www-form-urlencoded").param("email", email).param("password", PASSWORD))
            .andExpect(status().isOk()).andExpect(jsonPath("passwordHash").doesNotExist())
            .andExpect(jsonPath("password").doesNotExist());
        assertThat(session.getId()).isNotEqualTo(oldSessionId);
        return session;
    }

    JsonNode createChild(MockHttpSession session) throws Exception {
        return json.readTree(mvc.perform(post("/api/children").session(session).with(csrf())
            .contentType("application/json").content(DETAILS)).andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString());
    }

    @Test void privateEndpointsRequireAuthentication() throws Exception {
        mvc.perform(get("/api/children")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/session/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/children/" + UUID.randomUUID() + "/photo")).andExpect(status().isUnauthorized());
    }

    @Test void registrationAndLoginRequireCsrf() throws Exception {
        mvc.perform(post("/api/session/register").contentType("application/json").content("{}"))
            .andExpect(status().isForbidden());
        mvc.perform(post("/api/session/login").param("email", "nobody@example.test").param("password", PASSWORD))
            .andExpect(status().isForbidden());
    }

    @Test void createsAccountHashesPasswordAndRestoresIdentity() throws Exception {
        MockHttpSession session = account("Owner@Example.test");
        mvc.perform(get("/api/session/me").session(session)).andExpect(status().isOk())
            .andExpect(jsonPath("email").value("owner@example.test"));
        String hash = jdbc.queryForObject("SELECT password_hash FROM caregiver_account", String.class);
        assertThat(hash).startsWith("$2a$12$").doesNotContain(PASSWORD);
    }

    @Test void badCredentialsDoNotAuthenticate() throws Exception {
        mvc.perform(post("/api/session/login").with(csrf()).param("email", "missing@example.test")
            .param("password", PASSWORD)).andExpect(status().isUnauthorized());
    }

    @Test void rejectsShortPasswordAndDuplicateEmail() throws Exception {
        mvc.perform(post("/api/session/register").with(csrf()).contentType("application/json")
            .content("{\"email\":\"short@example.test\",\"displayName\":\"Test\",\"password\":\"short\"}"))
            .andExpect(status().isBadRequest());
        account("same@example.test");
        mvc.perform(post("/api/session/register").with(csrf()).contentType("application/json")
            .content(json.writeValueAsString(new SessionController.Registration("SAME@example.test", "Other", PASSWORD))))
            .andExpect(status().isConflict());
    }

    @Test void logoutInvalidatesTheSessionAndRequiresCsrf() throws Exception {
        MockHttpSession session = account("logout@example.test");
        mvc.perform(post("/api/session/logout").session(session)).andExpect(status().isForbidden());
        mvc.perform(post("/api/session/logout").session(session).with(csrf())).andExpect(status().isNoContent());
        assertThat(session.isInvalid()).isTrue();
        mvc.perform(get("/api/session/me")).andExpect(status().isUnauthorized());
    }

    @Test void newAccountHasNoSeededChildrenOrClinicalData() throws Exception {
        mvc.perform(get("/api/children").session(account("empty@example.test")))
            .andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    @Test void profilePersistsAcrossSignInSessions() throws Exception {
        MockHttpSession first = account("return@example.test");
        JsonNode child = createChild(first);
        mvc.perform(post("/api/session/logout").session(first).with(csrf())).andExpect(status().isNoContent());
        var signedIn = mvc.perform(post("/api/session/login").with(csrf()).param("email", "return@example.test")
            .param("password", PASSWORD)).andExpect(status().isOk()).andReturn();
        MockHttpSession second = (MockHttpSession) signedIn.getRequest().getSession();
        mvc.perform(get("/api/children").session(second)).andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(child.get("id").asText()))
            .andExpect(jsonPath("$[0].displayName").value("Sample Child"));
    }

    @Test void oneChildLimitIsEnforcedOnServer() throws Exception {
        MockHttpSession owner = account("one@example.test");
        createChild(owner);
        mvc.perform(post("/api/children").session(owner).with(csrf()).contentType("application/json").content(DETAILS))
            .andExpect(status().isConflict());
    }

    @Test void rejectsInvalidTimezoneFutureDateAndForgedOwner() throws Exception {
        MockHttpSession owner = account("validate@example.test");
        for (String input : new String[]{DETAILS.replace("America/New_York", "invalid-zone"),
                DETAILS.replace("2020-01-02", "2999-01-01"), DETAILS.replace("Sample Child", " "),
                DETAILS.replace("\"displayName\"", "\"ownerId\":\"forged\",\"displayName\"")}) {
            mvc.perform(post("/api/children").session(owner).with(csrf()).contentType("application/json").content(input))
                .andExpect(status().isBadRequest());
        }
    }

    @Test void otherAccountCannotListEditOrAccessPhoto() throws Exception {
        JsonNode child = createChild(account("alice@example.test"));
        MockHttpSession other = account("bob@example.test");
        String id = child.get("id").asText();
        mvc.perform(get("/api/children").session(other)).andExpect(content().json("[]"));
        mvc.perform(put("/api/children/" + id).session(other).with(csrf()).contentType("application/json")
            .content("{\"details\":" + DETAILS + ",\"revision\":1}")).andExpect(status().isNotFound());
        mvc.perform(get("/api/children/" + id + "/photo").session(other)).andExpect(status().isNotFound());
        mvc.perform(delete("/api/children/" + id + "/photo").session(other).with(csrf())).andExpect(status().isNotFound());
        mvc.perform(multipart("/api/children/" + id + "/photo").file(image()).session(other).with(csrf())
            .with(req -> { req.setMethod("PUT"); return req; })).andExpect(status().isNotFound());
    }

    @Test void staleEditCannotOverwriteNewerProfile() throws Exception {
        MockHttpSession owner = account("revision@example.test");
        String id = createChild(owner).get("id").asText();
        String update = "{\"details\":" + DETAILS.replace("Sample Child", "Updated Child") + ",\"revision\":1}";
        mvc.perform(put("/api/children/" + id).session(owner).with(csrf()).contentType("application/json").content(update))
            .andExpect(status().isOk()).andExpect(jsonPath("revision").value(2));
        mvc.perform(put("/api/children/" + id).session(owner).with(csrf()).contentType("application/json").content(update))
            .andExpect(status().isConflict());
    }

    @Test void photoCanBeUploadedReadWithoutCachingAndRemoved() throws Exception {
        MockHttpSession owner = account("photo@example.test");
        String id = createChild(owner).get("id").asText();
        mvc.perform(multipart("/api/children/" + id + "/photo").file(image()).session(owner).with(csrf())
            .with(req -> { req.setMethod("PUT"); return req; })).andExpect(status().isNoContent());
        mvc.perform(get("/api/children/" + id + "/photo").session(owner)).andExpect(status().isOk())
            .andExpect(content().contentType("image/png")).andExpect(header().string("Cache-Control", "no-store"));
        mvc.perform(get("/api/children").session(owner)).andExpect(jsonPath("$[0].hasPhoto").value(true));
        mvc.perform(delete("/api/children/" + id + "/photo").session(owner).with(csrf())).andExpect(status().isNoContent());
        mvc.perform(get("/api/children/" + id + "/photo").session(owner)).andExpect(status().isNotFound());
    }

    @Test void rejectsSpoofedImageContents() throws Exception {
        MockHttpSession owner = account("spoof@example.test");
        String id = createChild(owner).get("id").asText();
        var svg = new MockMultipartFile("photo", "pretend.png", "image/png", "<svg>no</svg>".getBytes(StandardCharsets.UTF_8));
        mvc.perform(multipart("/api/children/" + id + "/photo").file(svg).session(owner).with(csrf())
            .with(req -> { req.setMethod("PUT"); return req; })).andExpect(status().isBadRequest());
        mvc.perform(get("/api/children").session(owner)).andExpect(jsonPath("$[0].hasPhoto").value(false));
    }

    @Test void browserCorsOnlyAllowsConfiguredOrigin() throws Exception {
        mvc.perform(options("/api/children").header("Origin", "http://localhost:8083")
            .header("Access-Control-Request-Method", "GET")).andExpect(status().isOk())
            .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:8083"))
            .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
        mvc.perform(options("/api/children").header("Origin", "https://untrusted.example")
            .header("Access-Control-Request-Method", "GET")).andExpect(status().isForbidden());
    }

    private static MockMultipartFile image() throws Exception {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(4, 4, BufferedImage.TYPE_INT_RGB), "png", bytes);
        return new MockMultipartFile("photo", "synthetic.png", "image/png", bytes.toByteArray());
    }
}
