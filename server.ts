import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import webpush from 'web-push';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

// Storage for push subscriptions and tasks
const STORAGE_DIR = path.join(process.cwd(), 'storage');
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR);

const SUBS_FILE = path.join(STORAGE_DIR, 'subscriptions.json');
const TASKS_FILE = path.join(STORAGE_DIR, 'tasks.json');

const getSubs = () => fs.existsSync(SUBS_FILE) ? JSON.parse(fs.readFileSync(SUBS_FILE, 'utf-8')) : [];
const saveSubs = (subs: any[]) => fs.writeFileSync(SUBS_FILE, JSON.stringify(subs));

const getTasks = () => fs.existsSync(TASKS_FILE) ? JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8')) : [];
const saveTasks = (tasks: any[]) => fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks));

// VAPID Keys
const VAPID_FILE = path.join(STORAGE_DIR, 'vapid.json');
let vapidKeys: any;
if (fs.existsSync(VAPID_FILE)) {
  vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf-8'));
} else {
  vapidKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys));
}

webpush.setVapidDetails(
  'mailto:example@yourdomain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

app.use(bodyParser.json());

// API Routes
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  const subs = getSubs();
  if (!subs.find((s: any) => s.endpoint === subscription.endpoint)) {
    subs.push(subscription);
    saveSubs(subs);
  }
  res.status(201).json({});
});

app.post('/api/sync-tasks', (req, res) => {
  const { uid, tasks } = req.body;
  const allTasks = getTasks();
  // Filter out old tasks for this user and add new ones
  const otherTasks = allTasks.filter((t: any) => t.uid !== uid);
  saveTasks([...otherTasks, ...tasks]);
  res.json({ success: true });
});

// Background task checker
const notifiedTasks = new Set();

setInterval(() => {
  const now = new Date();
  const tasks = getTasks();
  const subs = getSubs();
  
  tasks.forEach((task: any) => {
    if (task.completed) return;
    
    const scheduledTime = new Date(task.scheduledAt);
    const diff = now.getTime() - scheduledTime.getTime();
    const taskKey = `${task.id}_${task.scheduledAt}`;
    
    // If it's time (within the last minute) and not already notified
    if (diff >= 0 && diff < 60000 && !notifiedTasks.has(taskKey)) {
      notifiedTasks.add(taskKey);
      
      subs.forEach((sub: any) => {
        webpush.sendNotification(sub, JSON.stringify({
          title: `Task Reminder: ${task.title} ⏰`,
          body: task.notes || 'Time to complete your scheduled task!',
          icon: '/icon.png'
        })).catch(err => {
          if (err.statusCode === 410) {
            const currentSubs = getSubs();
            saveSubs(currentSubs.filter((s: any) => s.endpoint !== sub.endpoint));
          }
        });
      });
    }
  });
  
  // Clean up old notified tasks (older than 1 hour)
  notifiedTasks.forEach((key: any) => {
    const [id, time] = key.split('_');
    if (now.getTime() - new Date(time).getTime() > 3600000) {
      notifiedTasks.delete(key);
    }
  });
}, 30000);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`VAPID Public Key: ${vapidKeys.publicKey}`);
  });
}

startServer();
