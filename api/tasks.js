// api/tasks.js
import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  // Simple test response
  res.status(200).json({ message: "API is working" });
}
