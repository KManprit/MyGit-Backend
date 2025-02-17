const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readdir = promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);

async function revertRepo(commitID) {
    const repoPath = path.resolve(process.cwd(), ".ManGit");
    const commitsPath = path.join(repoPath, "commits");
    const commitDir = path.join(commitsPath, commitID);
  
    try {
      // Check if the commit directory exists
      if (!fs.existsSync(commitDir)) {
        console.error(`Commit directory does not exist: ${commitDir}`);
        return;
      }
  
      const files = await readdir(commitDir);
      const parentDir = path.resolve(repoPath, "..");
  
      for (const file of files) {
        await copyFile(path.join(commitDir, file), path.join(parentDir, file));
      }
  
      console.log(`Commit ${commitID} reverted successfully!`);
    } catch (err) {
      console.error("Unable to revert:", err);
    }
  }
  

module.exports = { revertRepo };