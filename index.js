/* Node Js Video Code

// const http = require("http");
import http from "http";
import { generateLovePercent } from "./features.js";
import fs from "fs";
// import path from "path";

// console.log(path.extname("/home/random/index.html"));

// const gfName = require("./features");

// console.log(generateLovePercent());

const home = fs.readFileSync("./index.html");

//First step is to create server
const server = http.createServer((req, res) => {
  if (req.url === "/about") {
    res.end(`<h1>Love is ${generateLovePercent()}</h1>`);
  } else if (req.url === "/") {
    // fs.readFile("./index.html", (err, home) => {
    //   res.end(home);
    // });
    res.end(home);
  } else {
    res.end("<h1>Page not found</h1>");
  }
});

server.listen(5000, () => {
  console.log("Server is working");
});

*/

import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const mongoURI = "mongodb://127.0.0.1:27017/";

const connectToMongo = async () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(mongoURI);
    console.log("Connected to Mongo Successfully!");
  } catch (error) {
    console.log(error);
  }
};

connectToMongo();

// const messageSchema = new mongoose.Schema({
//   name: String,
//   email: String,
// });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const app = express(); //This line is used for creating the server (industry standards use name as app instead of server)

//Using middlewares
app.use(express.static(path.join(path.resolve(), "public"))); //This is middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Setting up view engine
app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "secret");
    req.user = await User.findById(decoded._id);
    next();
  } else {
    res.redirect("login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  // const pathLocation = path.resolve();
  // res.sendFile(path.join(pathLocation, "index.html"));
  res.render("logout", { name: req.user.name });
  // res.sendFile("index.html");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    return res.redirect("/register");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render("login", {
      email: email,
      message: "Incorrect Password",
    });
  }
  const token = jwt.sign({ _id: user._id }, "secret");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    return res.redirect("/login");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name: name,
    email: email,
    password: hashedPassword,
  });

  const token = jwt.sign({ _id: user._id }, "secret");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.get("/add", async (req, res) => {
  await Message.create({ name: "Sumit Chouhan", email: "sample2@gmail.com" });
  res.send("Nice");
});

// app.get("/success", (req, res) => {
//   res.render("success");
// });

// app.post("/contact", async (req, res) => {
//   const { name, email } = req.body;
//   await Message.create({ name: name, email: email });
//   res.redirect("/success");
// });

// app.get("/users", (req, res) => {
//   res.json({
//     users,
//   });
// });

app.listen(5000, () => {
  console.log("server is working");
});
