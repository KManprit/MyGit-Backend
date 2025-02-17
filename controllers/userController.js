const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); //for encrypt the password
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
var ObjectId = require("mongodb").ObjectId;

dotenv.config();
const uri = process.env.MONGODB_URL;

let client; //globally set kiye h taki connection establish ho jay
async function connectClient() {
  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
  }
}
async function signup(req, res) {
  // res.send("Sigup !");
  const { username, password, email } = req.body;
  try {
    await connectClient(); //connection established done
    const db = client.db("github"); //we want to connect to our this data base in the cluster
    const usersCollection = db.collection("users"); //then it will use user collection ...agr if it is not present then it will get created

    const user = await usersCollection.findOne({ username });//agr value exist krege to first occurence  return krega 
    if (user) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);//userpassword + salt 

    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    };
    const result = await usersCollection.insertOne(newUser);
//tokem return krna h
    const token = jwt.sign(
      { id: result.insertedId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" } 
    );
    res.json({ token, userId: result.insertedId });
  } catch (err) {
    console.error("Error during signup : ", err.message);
    res.status(500).send("Server error");
  }
}
async function login(req, res) {
  const { email, password } = req.body; // Extract email and password from request body
  try {
    await connectClient(); // Establish connection
    const db = client.db("github"); // Access the "github" database
    const usersCollection = db.collection("users"); // Access the "users" collection

    // Find user by email
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid credentials! Email not found." });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials! Incorrect password." });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error("Error during login: ", err.message);
    res.status(500).send("Server error!");
  }
}

async function getAllUsers(req, res) {
  // res.send("All users fetched!");
  try {
    await connectClient(); // Establish connection
    const db = client.db("github"); // Access the "github" database
    const usersCollection = db.collection("users"); // Access the "users" collection

    const users = await usersCollection.find({}).toArray(); //toArray krna jrruri h wrna json me convert nh hoga qki ye line ek array return krega (collection of object )..as it is return krege to to json me nh ho pa rha h convert to isiliye toArray() wala function likhege
    res.json(users);
  } catch (err) {
    console.error("Error during fetching : ", err.message);
    res.status(500).send("Server error!");
  }
}
async function getUserProfile(req, res) {
  // res.send("getUserprofile");
  const currentID = req.params.id; ///userProfile/:id  yeha per :id likha h to req.params.id; yeha per bhi same id hoga
  try {
    await connectClient(); // Establish connection
    const db = client.db("github"); // Access the "github" database
    const usersCollection = db.collection("users"); // Access the "users" collection

    const user = await usersCollection.findOne({
      _id: new ObjectId(currentID), //currentID is going to be a string but mongodb ke liye ye ek alg class/object  h isiliye var ObjectId = require("mongodb").ObjectId; ye use krege
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.send(user);
  } catch (err) {
    console.error("Error during fetching : ", err.message);
    res.status(500).send("Server error!");
  }
}
async function updateUserProfile(req, res) {
  // res.send("profile updated");
  const currentID = req.params.id;
  const { email, password } = req.body;

  try {
    await connectClient(); // Establish connection
    const db = client.db("github"); // Access the "github" database
    const usersCollection = db.collection("users"); // Access the "users" collection

    let updateFields = { email };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }
    const result = await usersCollection.findOneAndUpdate(
      {
        _id: new ObjectId(currentID),
      },
      { $set: updateFields }, //jo bhi value update fields object me h usko le ke store kr dena h
      { returnDocument: "after" } //jb update ho jayga to uske bad response me updated document milna chahiye
    );

    if (!result.value) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.send(result.value); //updated result return hoga
  } catch (err) {
    console.error("Error during updating : ", err.message);
    res.status(500).send("Server error!");
  }
}
async function deleteUserProfile(req, res) {
  // res.send("deleted profile");
  const currentID = req.params.id;

  try {
    await connectClient(); // Establish connection
    const db = client.db("github"); // Access the "github" database
    const usersCollection = db.collection("users"); // Access the "users" collection

    const result = await usersCollection.deleteOne({
      _id: new ObjectId(currentID),
    });

    if (result.deleteCount == 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json({ message: "User Profile Deleted!" });
  } catch (err) {
    console.error("Error during updating : ", err.message);
    res.status(500).send("Server error!");
  }
}

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
