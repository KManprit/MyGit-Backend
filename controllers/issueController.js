const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");



// In your createIssue function
async function createIssue(req, res) {
    const { title, description, repository } = req.body; // repository comes from the request body
    try {
      // Check if repository exists
      const repo = await Repository.findById(repository);
      if (!repo) {
        return res.status(400).json({ error: "Repository not found!" });
      }
  
      const issue = new Issue({
        title,
        description,
        repository,
      });
  
      await issue.save();
      res.status(201).json(issue);
    } catch (err) {
      console.error("Error during issue creation: ", err.message);
      res.status(500).send("Server error");
    }
  }
  
  
async function updateIssueById(req, res){
    // res.send("Issue updated!")
    const{id}=req.params;
    const{title , description , status } = req.body;
    try{
       const issue = await Issue.findById(id);

       if(!issue){
        res.status(404).json({error: "Issue not found!"});
       }

       issue.title = title;
       issue.description = description;
       issue.status = status;

       await issue.save();

       res.json(issue , {message : "Issue updated"});
    }catch (err) {
    console.error("Error during issue updation : ", err.message);
    res.status(500).send("Server error");
   }

};

const deleteIssueById = async (req, res) => {
    const { id } = req.params;
    try {
      const issue = await Issue.findByIdAndDelete(id); // Use await here
  
      if (!issue) {
        return res.status(404).json({ error: "Issue not found!" });
      }
      res.json({ message: "Issue deleted" });
    } catch (err) {
      console.error("Error during issue deletion: ", err.message);
      res.status(500).send("Server error");
    }
  };
  

// Fix for getAllIssues
const getAllIssues = async (req, res) => {
    const { id } = req.params;
    try {
      const issues = await Issue.find({ repository: id }); // Use await here
  
      if (!issues || issues.length === 0) {
        return res.status(404).json({ error: "Issues not found!" });
      }
      res.status(200).json(issues);
    } catch (err) {
      console.error("Error during issue fetching: ", err.message);
      res.status(500).send("Server error");
    }
  };
  

// Fix for getIssueById
const getIssueById = async (req, res) => {
    const { id } = req.params;
    try {
      const issue = await Issue.findById(id);  // Use await here
      if (!issue) {
        return res.status(404).json({ error: "Issue not found!" });
      }
      res.json(issue);
    } catch (err) {
      console.error("Error during issue fetching: ", err.message);
      res.status(500).send("Server error");
    }
  };
  



module.exports = {
    createIssue,
    updateIssueById,
    deleteIssueById,
    getAllIssues,
    getIssueById,
};
