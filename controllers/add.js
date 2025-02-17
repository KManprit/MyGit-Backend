const fs = require("fs").promises;
const path = require("path");


async function addRepo(filePath) {
  const repoPath = path.resolve(process.cwd(), ".ManGit");
  const stagingPath = path.join(repoPath, "staging");

  console.log("Resolved repository path:", repoPath);
  console.log("Resolved staging path:", stagingPath);
  console.log("File path received:", filePath);

  try {
    await fs.mkdir(stagingPath, { recursive: true });
    const fileName = path.basename(filePath);
    console.log("Copying file:", filePath, "to", path.join(stagingPath, fileName));
    await fs.copyFile(filePath, path.join(stagingPath, fileName));
    console.log(`File ${fileName} added to the staging area!`);
  } catch (err) {
    console.error("Error adding file:", err);
  }
}


module.exports = {addRepo};