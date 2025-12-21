import express from "express";
const port = process.env.PORT || 4000;
import cors from "cors";
import { GetObjectCommand, ListObjectsV2Command, S3, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
const app = express();
import dotenv from "dotenv";
import path from "node:path";
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
        console.log({ files });
        res.json({ files });

    } catch (error) {
        res.status(500).json({
            Error: "Internal server error" + error,
        })
    }
    try {
        const listCommand = new ListObjectsV2Command({
            Bucket: process.env.BUCKET_NAME,
            Prefix: `${base}/`
        })
        const listResponse = await r2Client.send(listCommand);
        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            return res.status(404).json("File not found")
        }
        const files = [];
        for (const items of listResponse.Contents) {
            if (!items.Key || !items.Key.endsWith('/')) {
                const getCommand = new GetObjectCommand({
                    Bucket: process.env.BUCKET_NAME,
                    Key: items.Key,
                })
                const fileResponse = await r2Client.send(getCommand);
                const stream = fileResponse.Body as Readable;
                const chunks: Buffer[] = [];
                for await (const chunk of stream) {
                    chunks.push(Buffer.from(chunk));
                }
                const content = Buffer.concat(chunks)?.toString('utf8');
                files.push({
                    path: items.Key?.replace(`${base}`, 'utf-8'),
                    content: content
                })
            }
        }

    }
    catch (error) {

    }
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/download`)
})