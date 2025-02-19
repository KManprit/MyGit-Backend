const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const mainRouter = require("./routes/main.router");


const yargs = require("yargs");
const { hideBin } = require("yargs/helpers"); // Extracts CLI arguments for better parsing//space de ke jo argument dete h usko automatically extract krne ke liye ye use hota h(hideBin)

const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");
const { QApps } = require("aws-sdk");

dotenv.config();

yargs(hideBin(process.argv))
   .command("start" , " Starts a new Server " , {} , startServer)
  // Initialize a new repository
  .command(
    "init",
    "Initialise a new repository",
    {},
    initRepo
  )

  // Add a file to the repository
  .command(
    "add <file>",
    "Add a file to the repository",
    (yargs) => {
      yargs.positional("file", {
        type: "string",
        describe: "File to add to the repository",
      });
    },
    (argv) => {
      console.log("Add command invoked with file:", argv.file); // Debugging log
      try {
        addRepo(argv.file); // Call the addRepo function with the provided file
      } catch (err) {
        console.error("Error in add command:", err);
      }
    }
  )

  // Commit staged files
  .command(
    "commit <message>",
    "Commit the staged files",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit message",
        type: "string",
      });
    },
    (argv) => {
      console.log("Commit command invoked with message:", argv.message); 
      try {
        commitRepo(argv.message); // Ensure the string is passed
      } catch (err) {
        console.error("Error in commit command:", err);
      }
    }
  )

  // Push commits to remote (S3, etc.)
  .command(
    "push",
    "Push commits to remote",
    {},
    pushRepo
  )

  // Pull commits from remote
  .command(
    "pull",
    "Pull commits from remote",
    {},
    pullRepo
  )

  // Revert to a specific commit
  .command(
    "revert <commitID>",
    "Revert to a specific commit",
    (yargs) => {
      yargs.positional("commitID", {
        describe: "Comit ID to revert to",
        type: "string",
      });
    },
    (argv) => {
      revertRepo(argv.commitID);
    }
  )

  // Ensure at least one command is provided
  .demandCommand(1, "You need at least one command to proceed")
  .help() // Provide help details for the commands
  .argv; // Parse the command-line arguments
  ////system ke process se aane wale arguments command ko read  krega aur hideBin uske parameters ko extract kr lega and read krne me help krega
//demand command ka mtlb user se command lena jruri h


function startServer(){
    // console.log("server logic is callled ")
    const app = express();
    const port = process.env.PORT||8000;
    app.use(bodyParser.json());
    app.use(express.json());
    
    const mongoURI = process.env.MONGODB_URL;
    mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB connected!"))
    .catch((err) => console.error("Unable to connect : ", err));

    // app.use(cors({ origin: "*" }));//request kisi se path se aa skta h aur wo valid path jaisa treat hoga
   
    const allowedOrigins = ["http://localhost:3000", "https://main.d1baxxsfz83jk1.amplifyapp.com"];

    const corsOptions = {
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    };
    app.use(cors(corsOptions));

    app.use(session({
      secret: process.env.JWT_SECRET_KEY,  
      resave: false,
      saveUninitialized: false,
      cookie: {
          secure: true,
          sameSite: "None",
          httpOnly: true
      }
  }));
  
    
    app.use("/" , mainRouter);
   

    let user = "test";

    //server creation
    const httpServer = http.createServer(app);
    const io = new Server(httpServer , {
       cors:{
           origin:"*",
           methods:["GET" , "POST"],

       },
    });

    io.on("connection" , (socket)=>{
      socket.on("joinRoom" , (userID)=>{
        user = userID;
        console.log("=====");
        console.log(user);
        console.log("=====");
        socket.join(userID);
      });
    });

    const db = mongoose.connection;

    db.once("open", async () => {
      console.log("CRUD operations called");
      // CRUD operations
    });

    httpServer.listen(port, () => {
      console.log(`Server is running on PORT ${port}`);
    });
  
}
