const fs  = require('fs').promises;

const path = require("path");



async function initRepo(){
    const repoPath = path.resolve(process.cwd(), ".ManGit")//init krne se .ManGit ka folder bn jayga//wo folder jo repo ke liye bnega #hidden folder  //process.cwd() ye current working directory ka add la ke deta h
    const commitPath = path.join(repoPath ,  "commits");



    try{
        await fs.mkdir(repoPath, {recursive: true});//recursive ka mtlb ek folder agr exists krta h to uske aander dusra folder bhi bnaya ja skta hai   --- nested folder // es path per bnana h
        await fs.mkdir(commitPath, {recursive: true});
        await fs.writeFile(
            path.join(repoPath, "config.json"),
            JSON.stringify({bucket: process.env.S3_BUCKET})
        );
        console.log("Repo initialized");
    }catch(err){
         console.error("Error initialising repository "  , err)
    }
}

module.exports = {initRepo};