require("dotenv").config();
require("./config/db").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const cors = require('cors');

const config = process.env;

const app = express();
app.use(cors());

app.use(express.json());

const User = require("./model/user");

// Register
app.post("/register", async (req, res) => {
    try {
        const { username, emailID, password } = req.body;

        if (!(emailID && password && username)) {
            res.status(400).send("All inputs are required");
        }
        const oldUser = await User.findOne({ emailID });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login.");
        }
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            emailID,
            password: encryptedPassword,
        });

        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
});

// Login
app.post("/login", async (req, res) => {
    try {
        const { emailID, password } = req.body;

        if (!(emailID && password)) {
            res.status(400).send("All input is required");
        }

        const user = await User.findOne({ emailID });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { user_id: user._id, emailID, username: user.username },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "30m",
                }
            );
            user.token = token;
            res.status(200).json(user);
        }
        else
            res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
    // Our register logic ends here
});

app.get("/try/access/:jwt_token", auth, (req, res) => {
    res.status(200).send(req.user);
    //console.log(req.params);
});

module.exports = app;