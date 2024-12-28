// pages/api/tasks.js
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const TASKS_DB_ID = process.env.NOTION_TASKS_DB_ID;
const FRAMES_DB_ID = process.env.NOTION_FRAMES_DB_ID;
const PROJECTS_DB_ID = process.env.NOTION_PROJECTS_DB_ID;

// Helper function to get database item by name
async function getItemByName(databaseId, name) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Name",
      title: {
        equals: name
      }
    }
  });
  return response.results[0]?.id;
}

async function resolveIds(taskData) {
  const { frame, project } = taskData;
  
  // Resolve frame ID if provided
  const frameId = frame ? await getItemByName(FRAMES_DB_ID, frame) : null;
  
  // Resolve project ID
  const projectId = project ? await getItemByName(PROJECTS_DB_ID, project) : null;

  return {
    frameId,
    projectId
  };
}

async function createTask(taskData) {
  // Resolve IDs from names
  const { frameId, projectId } = await resolveIds(taskData);
  
  return notion.pages.create({
    parent: { database_id: TASKS_DB_ID },
    properties: {
      Name: { title: [{ text: { content: taskData.name } }] },
      "Do Date": taskData.doDate ? { date: { start: taskData.doDate } } : null,
      Status: { status: { name: taskData.status || "Not started" } },
      Frame: frameId ? { relation: [{ id: frameId }] } : null,
      Timeframe: taskData.timeframe ? { select: { name: taskData.timeframe } } : null,
      Projects: projectId ? { relation: [{ id: projectId }] } : null
    }
  });
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      console.log('Processing POST request:', req.body);
      const response = await createTask(req.body);
      res.status(200).json(response);
    } else if (req.method === 'GET') {
      const response = await notion.databases.query({
        database_id: TASKS_DB_ID,
        sorts: [{ property: "Do Date", direction: "ascending" }],
      });
      res.status(200).json(response.results);
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: error.message });
  }
}
