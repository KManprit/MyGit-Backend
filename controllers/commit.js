const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");


async function commitRepo(message) {
    // console.log("Coomit command is being called")
    const repoPath =  path.resolve(process.cwd() , ".ManGit");//repo ka pth le lege //ced //current working directory
    const stagingPath = path.join(repoPath, "staging");

    const commitPath = path.join(repoPath, "commits");

    try{
        const commitID = uuidv4();//id bna liye h
        const commitDir = path.join(commitPath, commitID);//id se folder bna liya h//folder is the name as id
        await fs.mkdir(commitDir, { recursive: true });//nested  
        const files = await fs.readdir( stagingPath);//read krne ke liye sara files ko jo staging me h
        for (const file of files) {
            await fs.copyFile(//ek ek krke hr file ki copy bna li in commit folder because final payh to commit likhe h na isiliye
              path.join( stagingPath, file),//initial path
              path.join(commitDir, file)//final path
              //initial file ka path ..final path me copy ho jayga
            ); 
          }

          //nyi file -- write file

          await fs.writeFile(
            path.join(commitDir, "commit.json"),
            JSON.stringify({ message: message, date: new Date().toISOString() }, null, 2) // Pretty formatting
        );
        

        console.log(`Commit ${commitID} created with message: ${message}`);

    }catch(err){
        console.error("Error committing files : ", err);

    }

}




module.exports = {commitRepo}