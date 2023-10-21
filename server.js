require("dotenv").config(); //backend lay selehon dotenv yasfelgal
const express = require("express");
// const pool=require('./server/config/database')
const cors = require("cors");
const app = express();
const port = process.env.PORT||80;
const userRouter = require('./server/api/users/user.router');
const questionRouter = require("./server/api/questions/question.router");
const answerRouter = require("./server/api/answers/answer.router");
//using midelware cors
app.use(cors());
app.use(express.urlencoded({ extended: true })); //urlencoded used to use that comes frokm frontend
app.use(express.json());
// we have to write app.use('/api/users', userRouter) after the above 10 &11 line because the uper one is midelware 
app.use('/api/users', userRouter)
//...........eva11............//
app.use("/api/questions", questionRouter);
app.use("/api/answers", answerRouter);
//...........eva11............//
// app.listen(port, () => console.log(`Listening at http://localhost:${port}`)); // use backtick b/c port defineseletdereg
app.listen(port,"0.0.0.0", ()=> console.log(`Listening at http://localhost:${port}`))
