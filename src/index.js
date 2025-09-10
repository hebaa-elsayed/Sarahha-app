import "../config.js";
import express from "express";
import userController from "./modules/Users/users.controller.js";
import dbConnection from "./DB/db.connection.js";
import messageController from "./modules/Messages/messages.controller.js";
import {loggerMiddleware} from './middlewares/loggerMiddleware.js';



const app = express();
const port = process.env.PORT;
await dbConnection() 
app.use(express.json()); 



app.use('/users', userController)
app.use('/messages' , messageController)
app.use(loggerMiddleware);

app.use((req,res) =>{
    res.status(404).send({message:"404 Not Found"});
});



app.use((err,req,res) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});


app.listen(port, ()=>{
    console.log(`Server is Running on port ${port}`);
});