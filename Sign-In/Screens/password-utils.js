function responderPasswordKey(phoneNumber) {
    return `responderPasswordHash:${phoneNumber}`;
}

function bytesToHex(bytes) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
    if (!/^(?:[0-9a-f]{2})+$/i.test(hex)) {
        throw new Error("The saved password data is invalid.");
    }

    return new Uint8Array(hex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
}

async function hashResponderPassword(password, salt) {
    if (typeof crypto === "undefined" || !crypto.subtle) {
        throw new Error("Secure password storage is unavailable in this browser.");
    }

    salt = salt || crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );
    const hash = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        key,
        256
    );

    return JSON.stringify({ salt: bytesToHex(salt), hash: bytesToHex(new Uint8Array(hash)) });
}

async function verifyResponderPassword(password, savedValue) {
    const saved = JSON.parse(savedValue);
    const salt = hexToBytes(saved.salt);
    const calculated = JSON.parse(await hashResponderPassword(password, salt));
    return calculated.hash === saved.hash;
}
