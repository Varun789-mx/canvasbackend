// import express from 'express';
// import { copyS3Folder } from "./r2client"
// import cors from "cors"
// import path from "path";
// import fs from "fs";

// const port = process.env.PORT;


// const app = express();
// app.use(cors());
// app.use(express.json());

// app.get('/download', async (req, res) => {
//     const { language, replID } = req.body;
//     if (!language) {
//         res.status(400).send("Bad request");
//         return;
//     }
//     await copyS3Folder(`base/${language}`, `code/${replID}`);
//     res.send('Project created');

// })

// app.get('/getallbuckets', (req, res) => {
//     const rootpath = path.join('reactbase');
//     fs.readdir(rootpath, (error, files) => {
//         const dirs = files.filter(file => {
//             const filePath = path.join(rootpath, file);
//             return fs.statSync(filePath).isDirectory();
//         })
//         if (dirs) {
//             return res.json({ status: 200, success: dirs })
//         }
//     })
// })
// app.listen(port, () => {
//     console.log(`Backend server is running on http://localhost:${port}`);
// }) 