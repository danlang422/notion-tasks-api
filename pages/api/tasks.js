import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function findByName(databaseId, name) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Name",
        title: {
          equals: name
        }
      }
    });
    console.log(`Search results for ${name}:`, response.results);
    return response.results[0];
  } catch (error) {
    console.error(`Error finding ${name}:`, error);
    return null;
  }
}

async function getRelationId(databaseId, name) {
  if (!databaseId || !name) return null;
  const item = await findByName(databaseId, name);
  return item?.id;
}

async function createTask(taskData) {
  console.log('Starting createTask');
  console.log('Environment variables present:', {
    hasTasksDb: !!process.env.NOTION_TASKS_DB_ID,
    hasToken: !!process.env.NOTION_TOKEN
  });
  
  console.log('Creating task with data:', taskData);

  const { name, doDate, status, frame, areas, timeframe, project } = taskData;

  try {
    const frameId = frame ? await getRelationId(process.env.NOTION_FRAMES_DB_ID, frame) : null;
    console.log('Frame ID:', frameId);
    
    const projectId = project ? await getRelationId(process.env.NOTION_PROJECTS_DB_ID, project) : null;
    console.log('Project ID:', projectId);
    
    const areaIds = areas && Array.isArray(areas) 
      ? await Promise.all(areas.map(area => getRelationId(process.env.NOTION_AREAS_DB_ID, area)))
      : null;
    console.log('Area IDs:', areaIds);

    const properties = {
      Name: { title: [{ text: { content: name } }] },
      Status: { status: { name: status || "Not started" } }
    };

    if (doDate) properties["Do Date"] = { date: { start: doDate } };
    if (timeframe) properties.Timeframe = { select: { name: timeframe } };
    if (frameId) properties.Frame = { relation: [{ id: frameId }] };
    if (projectId) properties.Projects = { relation: [{ id: projectId }] };
    if (areaIds?.length) properties.Areas = { relation: areaIds.filter(id => id).map(id => ({ id })) };

    console.log('Creating with properties:', properties);

    return notion.pages.create({
      parent: { database_id: process.env.NOTION_TASKS_DB_ID },
      properties
    });
  } catch (error) {
    console.error('Error in createTask:', error);
    throw error;
  }
}

async function getTasks() {
  return notion.databases.query({
    database_id: process.env.NOTION_TASKS_DB_ID,
    sorts: [{ property: "Do Date", direction: "ascending" }],
  });
}

export const tasksHandler = async (req, res) => {
  console.log('Handler started, method:', req.method);
  try {
    if (req.method === 'GET') {
      console.log('Processing GET request');
      const response = await getTasks();
      res.status(200).json(response.results);
    } else if (req.method === 'POST') {
      console.log('Processing POST request');
      const response = await createTask(req.body);
      res.status(200).json(response);
    }
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: error.message });
  }
  console.log('Handler completed');
};

export default tasksHandler;
