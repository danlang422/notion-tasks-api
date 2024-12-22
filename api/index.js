const express = require('express');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const app = express();
app.use(express.json());

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// GET tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          property: "Do Date",
          direction: "ascending",
        },
      ],
    });
    
    res.json(response.results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST new task
app.post('/api/tasks', async (req, res) => {
  const { name, doDate, status, frameId, projectIds } = req.body;
  
  try {
    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        "Do Date": doDate ? {
          date: {
            start: doDate,
          },
        } : null,
        Status: {
          select: {
            name: status,
          },
        },
        Frame: frameId ? {
          relation: [
            {
              id: frameId,
            },
          ],
        } : null,
        Projects: projectIds ? {
          relation: projectIds.map(id => ({ id })),
        } : null,
      },
    });
    
    res.json(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// UPDATE task status
app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const response = await notion.pages.update({
      page_id: id,
      properties: {
        Status: {
          select: {
            name: status,
          },
        },
      },
    });
    
    res.json(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Vercel serverless function handler
module.exports = app;
