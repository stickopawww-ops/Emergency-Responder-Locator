package com.cebu.emergency;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@FunctionalInterface
interface SmsDelivery {
    void send(String phone, String message);
}

final class TwilioSmsDelivery implements SmsDelivery {
    private final String accountSid;
    private final String authToken;
    private final String fromNumber;

    TwilioSmsDelivery(String accountSid, String authToken, String fromNumber) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.fromNumber = fromNumber;
    }

    @Override
    public void send(String phone, String message) {
        try {
            String form = "To=" + encode(phone) + "&From=" + encode(fromNumber) + "&Body=" + encode(message);
            String credentials = Base64.getEncoder().encodeToString(
                (accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8));
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json"))
                .header("Authorization", "Basic " + credentials)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form))
                .build();
            HttpResponse<Void> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.discarding());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("SMS provider rejected the verification message.");
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("SMS delivery was interrupted.", exception);
        } catch (java.io.IOException exception) {
            throw new IllegalStateException("Could not deliver the verification SMS.", exception);
        }
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}

final class PhoneNumbers {
    private PhoneNumbers() {}

    static String normalizeRequired(String input) {
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("Mobile number is required.");
        }
        String digits = input.replaceAll("\\D", "");
        if (digits.startsWith("0") && digits.length() == 11) {
            digits = "63" + digits.substring(1);
        } else if (digits.length() == 10 && digits.startsWith("9")) {
            digits = "63" + digits;
        }
        if (!digits.matches("639\\d{9}")) {
            throw new IllegalArgumentException("Enter a valid Philippine mobile number, such as +639XXXXXXXXX.");
        }
        return "+" + digits;
    }

    static String mask(String phone) {
        return phone.length() < 4 ? "****" : "****" + phone.substring(phone.length() - 4);
    }
}
