import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const TASKS_DB_ID = process.env.NOTION_TASKS_DB_ID;
const FRAMES_DB_ID = process.env.NOTION_FRAMES_DB_ID;
const AREAS_DB_ID = process.env.NOTION_AREAS_DB_ID;
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
  const { frame, areas, project } = taskData;
  
  // Resolve frame ID
  const frameId = frame ? await getItemByName(FRAMES_DB_ID, frame) : null;
  
  // Resolve area IDs
  const areaIds = areas ? 
    await Promise.all(areas.map(area => getItemByName(AREAS_DB_ID, area))) : 
    [];
  
  // Resolve project ID
  const projectIds = project ? 
    [await getItemByName(PROJECTS_DB_ID, project)] : 
    [];

  return {
    frameId,
    areaIds: areaIds.filter(id => id), // Remove any null values
    projectIds: projectIds.filter(id => id)
  };
}

async function createTask(taskData) {
  // Resolve IDs from names
  const { frameId, areaIds, projectIds } = await resolveIds(taskData);
  
  return notion.pages.create({
    parent: { database_id: TASKS_DB_ID },
    properties: {
      Name: { title: [{ text: { content: taskData.name } }] },
      "Do Date": taskData.doDate ? { date: { start: taskData.doDate } } : null,
      Status: { status: { name: taskData.status || "Not started" } },
      Frame: frameId ? { relation: [{ id: frameId }] } : null,
      Areas: areaIds.length ? { relation: areaIds.map(id => ({ id })) } : null,
      Timeframe: taskData.timeframe ? { select: { name: taskData.timeframe } } : null,
      Projects: projectIds.length ? { relation: projectIds.map(id => ({ id })) } : null
    }
  });
}

export default async function handler(req, res) {
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
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: error.message });
  }
}
