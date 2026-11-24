
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Test backend connection
app.get("/api/message", (req, res) => {
    res.json({
        message: "Emergency Responder Backend Connected Successfully!"
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
