import express from 'express';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import dotenv from "dotenv";
dotenv.config()
const app = express();

// Configure R2 client
const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.S3_URL,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
    },
});

// Get all files from reactbase directory
app.get('/api/reactbase', async (req, res) => {
    try {
        // List all files
        const listCommand = new ListObjectsV2Command({
            Bucket: 'bucket1',
            Prefix: 'reactbase/',
        });

        const listResponse = await r2Client.send(listCommand);

        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            return res.status(404).json({ error: 'No files found' });
        }

        // Get all files and their content
        const files = [];

        for (const item of listResponse.Contents) {
            if (item.Key && !item.Key.endsWith('/')) {
                // Get file content
                const getCommand = new GetObjectCommand({
                    Bucket: 'bucket1',
                    Key: item.Key,
                });

                const fileResponse = await r2Client.send(getCommand);
                const stream = fileResponse.Body as Readable;

                // Convert stream to buffer
                const chunks: Buffer[] = [];
                for await (const chunk of stream) {
                    chunks.push(Buffer.from(chunk));
                }
                const content = Buffer.concat(chunks).toString('utf-8');

                files.push({
                    path: item.Key.replace('reactbase/', ''),
                    content: content,
                });
            }
        }

        res.json({ files });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});