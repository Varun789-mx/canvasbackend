// import express from "express";
// const port = process.env.PORT || 4000;
// import cors from "cors";
// import { GetObjectCommand, ListObjectsV2Command, S3, S3Client } from "@aws-sdk/client-s3";
// import { Readable } from "node:stream";
// const app = express();
// import dotenv from "dotenv";
// dotenv.config();

import { WebSocketServer } from "ws";

// app.use(express.json());
// app.use(cors());

// const r2Client = new S3Client({
//     region: 'auto',
//     endpoint: process.env.S3_URL,
//     credentials: {
//         accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || '',
//         secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || ""
//     },
// })

// app.get('/download', async (req, res) => {
//     const base = req.query.path;
//     try {
//         const listCommand = new ListObjectsV2Command({
//             Bucket: process.env.BUCKET_NAME,
//             Prefix: `${base}/`
//         });

//         const listResponse = await r2Client.send(listCommand);
//         if (!listResponse.Contents || listResponse.Contents.length === 0) {
//             return res.status(404).json({ error: 'No files exist' });
//         }
//         const files = [];
//         for (const item of listResponse.Contents) {
//             if (item.Key && !item.Key.endsWith('/')) {
//                 const getCommand = new GetObjectCommand({
//                     Bucket: process.env.BUCKET_NAME,
//                     Key: item.Key
//                 })
//                 const fileResponse = await r2Client.send(getCommand);
//                 const stream = fileResponse.Body as Readable;
//                 const chunks: Buffer[] = [];
//                 for await (const chunk of stream) {
//                     chunks.push(Buffer.from(chunk));
//                 }
//                 const content = Buffer.concat(chunks).toString('utf8');
//                 files.push({
//                     path: item.Key.replace(`${base}`, ''),
//                     content: content
//                 })
//             }
//         }
//         res.json({ files });

//     } catch (error) {
//         res.status(500).json({
//             Error: "Internal server error" + error,
//         })
//     }
// })

// app.get('/sucker', async (req, res) => {
//     const path = req.query.path;
//     try {
//         const listObject = new ListObjectsV2Command({
//             Bucket: process.env.BUCKET_NAME,
//             Prefix: `${path}/`,
//         })
//         const listResponse = await r2Client.send(listObject);
//         if (!listResponse.Contents || listResponse.Contents.length === 0) {
//             return res.status(400).json({
//                 error: "Resource not found"
//             })
//         }
//         const files = [];
//         for (const item of listResponse.Contents) {
//             if (!item.Key) {
//                 continue;
//             }
//             const relativepath = item.Key.replace(`${path}/`, '');
//             if (item.Key.endsWith('/')) {
//                 files.push({
//                     type: 'folder',
//                     path: relativepath,
//                 })
//             }
//             else {
//                 const getobject = new GetObjectCommand({
//                     Bucket: process.env.BUCKET_NAME,
//                     Key: item.Key,
//                 })
//                 const fileResponse = await r2Client.send(getobject);
//                 const stream = fileResponse.Body as Readable;
//                 const chunks: Buffer[] = [];
//                 for await (const chunk of stream) {
//                     chunks.push(Buffer.from(chunk));
//                 }
//                 const content = Buffer.concat(chunks).toString('utf-8');
//                 files.push({
//                     path: item.Key.replace(`${path}`, ''),
//                     type:'file',
//                     content: content
//                 })
//             }
//         }

//         return res.json({ files });
//     }
//     catch (error) {
//         res.status(500).json({
//             error: "Internal server error" + error,
//         })
//     }
// })

// app.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}/download`)
// })

import http from 'http'
import { error, log } from "console";


const server = http.createServer(function (req: any, res: any) {
    console.log('Server started on ', req.url);
    res.send('There she goes')
})

const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
    ws.on('error', console.error);
    ws.on('message', (data) => {
        console.log(data.toString());
        wss.clients.forEach((client) => {
            client.send(data)
        })
    })
    ws.send('There she goes');
})

server.listen(8000, () => {
    console.log(`server is working on ws://localhost:8000`);

})