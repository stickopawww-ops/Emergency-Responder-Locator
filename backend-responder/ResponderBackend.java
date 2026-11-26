import com.sun.net.httpserver.*;
import java.io.*;
import java.net.InetSocketAddress;
import java.sql.*;
import java.nio.charset.StandardCharsets;

public class ResponderBackend {
    static final String DB_URL = "jdbc:sqlite:emergency.db";

    public static void main(String[] args) throws Exception {
        initDB();
        HttpServer server = HttpServer.create(new InetSocketAddress(3000), 0);

        server.createContext("/api/auth/signin", exchange -> {
            try {
                String body = readBody(exchange);
                String phone = getValue(body, "phone").replace(" ", "").replace("+63", "");
                String pass = getValue(body, "password");
                try (Connection conn = DriverManager.getConnection(DB_URL)) {
                    PreparedStatement ps = conn.prepareStatement("SELECT * FROM responders WHERE phone=? AND password=?");
                    ps.setString(1, phone);
                    ps.setString(2, pass);
                    ResultSet rs = ps.executeQuery();
                    if (rs.next()) {
                        PreparedStatement up = conn.prepareStatement("UPDATE responders SET otp_code='4444' WHERE phone=?");
                        up.setString(1, phone);
                        up.executeUpdate();
                        send(exchange, "{\"success\":true, \"message\":\"Code sent\", \"phone\":\"" + phone + "\", \"demo_code\":\"4444\"}");
                    } else {
                        send(exchange, "{\"success\":false, \"message\":\"Wrong number or password\"}");
                    }
                }
            } catch (Exception e) {
                send(exchange, "{\"success\":false}");
            }
        });

        server.createContext("/api/auth/verify-code", exchange -> {
            try {
                String body = readBody(exchange);
                String phone = getValue(body, "phone").replace(" ", "").replace("+63", "");
                String code = getValue(body, "code");
                try (Connection conn = DriverManager.getConnection(DB_URL)) {
                    PreparedStatement ps = conn.prepareStatement("SELECT * FROM responders WHERE phone=? AND otp_code=?");
                    ps.setString(1, phone);
                    ps.setString(2, code);
                    ResultSet rs = ps.executeQuery();
                    if (rs.next()) send(exchange, "{\"success\":true}");
                    else send(exchange, "{\"success\":false, \"message\":\"Wrong code. Try 4444\"}");
                }
            } catch (Exception e) {
                send(exchange, "{\"success\":false}");
            }
        });

        server.createContext("/api/auth/register", exchange -> {
            try {
                String body = readBody(exchange);
                String phone = getValue(body, "phone").replace(" ", "").replace("+63", "");
                String pass = getValue(body, "password");
                String unit = getValue(body, "unit");
                String station = getValue(body, "station");
                try (Connection conn = DriverManager.getConnection(DB_URL)) {
                    PreparedStatement ps = conn.prepareStatement("INSERT INTO responders (phone, password, unit, station, status) VALUES (?,?,?,?, 'pending')");
                    ps.setString(1, phone);
                    ps.setString(2, pass);
                    ps.setString(3, unit);
                    ps.setString(4, station);
                    ps.executeUpdate();
                    send(exchange, "{\"success\":true}");
                }
            } catch (Exception e) {
                send(exchange, "{\"success\":false, \"message\":\"Phone already exists\"}");
            }
        });

        server.createContext("/api/responder/status", exchange -> {
            try {
                String phone = exchange.getRequestURI().getQuery().split("=")[1];
                try (Connection conn = DriverManager.getConnection(DB_URL)) {
                    PreparedStatement ps = conn.prepareStatement("SELECT * FROM responders WHERE phone=?");
                    ps.setString(1, phone);
                    ResultSet rs = ps.executeQuery();
                    if (rs.next()) {
                        String status = rs.getString("status");
                        send(exchange, "{\"success\":true, \"status\":\"" + status + "\", \"canStart\":" + ("approved".equals(status)) + "}");
                    } else {
                        send(exchange, "{\"success\":false}");
                    }
                }
            } catch (Exception e) {
                send(exchange, "{\"success\":false}");
            }
        });

        server.createContext("/api/admin/approve", exchange -> {
            try {
                String phone = getValue(readBody(exchange), "phone").replace(" ", "").replace("+63", "");
                try (Connection conn = DriverManager.getConnection(DB_URL)) {
                    PreparedStatement ps = conn.prepareStatement("UPDATE responders SET status='approved' WHERE phone=?");
                    ps.setString(1, phone);
                    ps.executeUpdate();
                    send(exchange, "{\"success\":true}");
                }
            } catch (Exception e) {
                send(exchange, "{\"success\":false}");
            }
        });

        server.setExecutor(null);
        server.start();
        System.out.println("Server running on http://localhost:3000");
    }

    static void initDB() throws Exception {
        Class.forName("org.sqlite.JDBC");
        try (Connection conn = DriverManager.getConnection(DB_URL);
             Statement st = conn.createStatement()) {
            st.execute("CREATE TABLE IF NOT EXISTS responders (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL UNIQUE, password TEXT NOT NULL, unit TEXT, station TEXT, status TEXT DEFAULT 'pending', otp_code TEXT)");
            st.execute("INSERT OR IGNORE INTO responders (phone, password, unit, station, status) VALUES ('9916542601', '12345678', 'Ambulance 1', 'Health Center Samboan', 'pending')");
            System.out.println("Database ready");
        }
    }

    static String readBody(HttpExchange ex) throws IOException {
        return new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
    }

    static String getValue(String body, String key) {
        body = body.trim();
        if (body.startsWith("{")) {
            String search = "\"" + key + "\"";
            int idx = body.indexOf(search);
            if (idx == -1) return "";
            int colon = body.indexOf(":", idx + search.length());
            int start = body.indexOf("\"", colon + 1) + 1;
            int end = body.indexOf("\"", start);
            return body.substring(start, end);
        }
        for (String part : body.split("&")) {
            String[] kv = part.split("=");
            if (kv.length == 2 && kv[0].equals(key)) return kv[1];
        }
        return "";
    }

    static void send(HttpExchange ex, String json) throws IOException {
        ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        ex.getResponseHeaders().add("Content-Type", "application/json");
        byte[] b = json.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(200, b.length);
        ex.getResponseBody().write(b);
        ex.getResponseBody().close();
    }
}