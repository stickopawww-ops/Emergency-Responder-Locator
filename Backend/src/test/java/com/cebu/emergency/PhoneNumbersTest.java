package com.cebu.emergency;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class PhoneNumbersTest {
    @Test
    void acceptsTheFrontendPhilippineMobileNumberFormats() {
        assertEquals("+639916542601", PhoneNumbers.normalizeRequired("+639916542601"));
        assertEquals("+639916542601", PhoneNumbers.normalizeRequired("09916542601"));
        assertEquals("+639916542601", PhoneNumbers.normalizeRequired("991 654 2601"));
    }

    @Test
    void rejectsMissingOrInvalidNumbers() {
        assertThrows(IllegalArgumentException.class, () -> PhoneNumbers.normalizeRequired(null));
        assertThrows(IllegalArgumentException.class, () -> PhoneNumbers.normalizeRequired("1234567890"));
        assertThrows(IllegalArgumentException.class, () -> PhoneNumbers.normalizeRequired("+63991654260"));
    }
}
