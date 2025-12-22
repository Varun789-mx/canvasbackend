import express from "express";
const port = process.env.PORT || 4000;
import cors from "cors";
import { GetObjectCommand, ListObjectsV2Command, S3, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
const app = express();
import dotenv from "dotenv";
dotenv.config();

app.use(express.json());
app.use(cors());

const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.S3_URL,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || ""
    },
})

app.get('/download', async (req, res) => {
    const base = req.query.path;
    try {
        const listCommand = new ListObjectsV2Command({
            Bucket: process.env.BUCKET_NAME,
            Prefix: `${base}/`
        });

        const listResponse = await r2Client.send(listCommand);
        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            return res.status(404).json({ error: 'No files exist' });
        }
        const files = [];
        for (const item of listResponse.Contents) {
            if (item.Key && !item.Key.endsWith('/')) {
                const getCommand = new GetObjectCommand({
                    Bucket: process.env.BUCKET_NAME,
                    Key: item.Key
                })
                const fileResponse = await r2Client.send(getCommand);
                const stream = fileResponse.Body as Readable;
                const chunks: Buffer[] = [];
                for await (const chunk of stream) {
                    chunks.push(Buffer.from(chunk));
                }
                const content = Buffer.concat(chunks).toString('utf8');
                files.push({
                    path: item.Key.replace(`${base}`, ''),
                    content: content
                })
            }
        }
        res.json({ files });

    } catch (error) {
        res.status(500).json({
            Error: "Internal server error" + error,
        })
    }
})

app.get('/sucker', async (req, res) => {
    //this get's the name of the base files like react or node js depending on the project 
    const base = req.query.path;
    try {
        //we create a command for getting the contents where we add the bucketname and the prefix to find it 
        const listcontent = new ListObjectsV2Command({
            Bucket: process.env.BUCKET_NAME,
            Prefix: `${base}/`,
        })
        //then we send the command and get it's output in the listreponse
        const listResponse = await r2Client.send(listcontent);
        //if it doens't exist then we return the request with a message error in this case
        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            return res.status(400).json({
                message: "could't get the files",
            })
        }
        //we create an array for files
        const files = [];
        for (const item of listResponse.Contents) {
            //if the items.key like the name of the file exists and it doesn't start with the / idk why the / part 
            if (item.Key) {
                if (item.Key.endsWith('/')) {
                    //then we create a command to fetch the files from the bucket and put the bucketnane and file name as key here
                    files.push({
                        name: item.Key.replace(`${base}/`, ''),
                        type: 'folder',
                    })
                } else {
                    const getCommand = new GetObjectCommand({
                        Bucket: process.env.BUCKET_NAME,
                        Key: item.Key,
                    })
                    //here we send the command using the r2client
                    const fileResponse = await r2Client.send(getCommand);
                    //now creating a variable to store the response's body as a readable stream data;
                    const stream = fileResponse.Body as Readable
                    //creating an variable array for storing the chunks of data;
                    const chunks: Buffer[] = [];
                    //adding the streams's data to the chunks array idk why Buffer.from(chunk ) part
                    for await (const chunk of stream) {
                        chunks.push(Buffer.from(chunk));
                    }
                    //also don't know why this i just understand the we convert the buffer's data to a sting 'utf-8' format here but why the concat here idk
                    const content = Buffer.concat(chunks).toString('utf-8');
                    //here we push that chunk into the files array
                    files.push({
                        name: item.Key.replace(`${base}/`, ''),
                        type: 'file',
                        content: content,
                    })
                }
            }
        }
        res.send({ files });
    } catch (error) {
        return res.send(500).json({
            error: "Internal server error" + error,
        })
    }
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/download`)
})