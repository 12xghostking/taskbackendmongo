const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 4000;
const bcrypt = require('bcrypt');
const multer = require('multer');
const mongoose = require('mongoose');
const { User, Notification, Task, File } = require('./models');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = 'mongodb+srv://anmol:95PfSk3.xQknpSe@cluster0.mkjfmwn.mongodb.net/?retryWrites=true&w=majority'; // Change this to your MongoDB server URL
const dbName = 'Task'; // Replace with your MongoDB database name
mongoose.connect(`${uri}/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  writeConcern: {
    w: 'majority',
    j: true, // If you want write operations to be journaled
    wtimeout: 1000 // Timeout for write concern acknowledgment (in milliseconds)
  }
});
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected successfully to MongoDB');
});
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "C:/Users/sirki/OneDrive/Desktop/taskbackendmongo/Files"); // Specify the directory where files will be stored
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  },
});

const upload = multer({ storage });
// POST signup route
app.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user using the User model
    await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user based on the provided email
    const user = await User.findOne({ email });

    if (user) {
      const role = user.role;
      const name = user.name;

      // Compare the provided password with the hashed password stored in the database
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        // Passwords match, authentication successful
        res.status(200).json({ role, name });
      } else {
        // Passwords don't match, authentication failed
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      // User not found with the provided email
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET notifications by username
app.get('/notifications/:username', async (req, res) => {
  const username = req.params.username;

  try {
    // Find notifications by recipient using the Notification model
    const notifications = await Notification.find({ recipient: username });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST new notification
app.post('/notifications', async (req, res) => {
  const { recipient, notificationText } = req.body;

  try {
    // Create the notification using the Notification model
    await Notification.create({ recipient, notificationText });
    res.status(201).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET all users
app.get('/users', async (req, res) => {
  try {
    // Find all users with role "user" using the User model
    const users = await User.find({ role: 'user' });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// DELETE notification by id
app.delete('/notifications/:id', async (req, res) => {
  const notificationId = req.params.id;

  try {
    // Delete the notification by its ID using the Notification model
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: 'Notification removed successfully' });
  } catch (error) {
    console.error('Error removing notification:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET all tasks
app.get('/tasks', async (req, res) => {
  try {
    // Find all tasks using the Task model
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET tasks by assigned member
app.get('/tasks/:assignedMember', async (req, res) => {
  const assignedMember = req.params.assignedMember;

  try {
    // Find tasks by assigned members using the Task model
    const tasks = await Task.find({ assignedMembers: assignedMember });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST a new task
app.post('/tasks', async (req, res) => {
  const { name, deadline, assignedMembers, notes, completed } = req.body;

  try {
    // Create the task using the Task model
    await Task.create({ name, deadline, assignedMembers, notes, completed });
    res.status(201).json({ message: 'Task created successfully' });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PUT/update a task deadline
app.put('/tasks/:id/deadline', async (req, res) => {
  const { id } = req.params;
  const { deadline } = req.body;

  try {
    // Update the task's deadline by its ID using the Task model
    await Task.findByIdAndUpdate(id, { deadline });
    res.status(200).json({ message: 'Task deadline updated successfully' });
  } catch (error) {
    console.error('Error updating task deadline:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// DELETE a task
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the task by its ID using the Task model
    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PUT/update a task completion status
app.put('/tasks/:id/completed', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    // Update the task's completion status by its ID using the Task model
    await Task.findByIdAndUpdate(id, { completed });
    res.status(200).json({ message: 'Task completion status updated successfully' });
  } catch (error) {
    console.error('Error updating task completion status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PUT/update a task status
app.put('/tasks/:id/status', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    // Update the task's completion status by its ID using the Task model
    await Task.findByIdAndUpdate(id, { completed });
    res.status(200).json({ message: 'Task status updated successfully' });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET all team members
app.get('/members', async (req, res) => {
  try {
    const pipeline = [
      {
        $match: { role: 'user' },
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'name',
          foreignField: 'assignedMembers',
          as: 'assignedTasks',
        },
      },
      {
        $project: {
          id: '$_id',
          _id: 0,
          name: 1,
          totalTasks: { $size: '$assignedTasks' },
        },
      },
    ];

    const members = await User.aggregate(pipeline);
    res.status(200).json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST file upload
app.post('/files/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { task, recipient } = req.body;
  const { filename, path: filepath } = req.file;

  try {
    // Create the file using the File model
    await File.create({ filename, filepath, task, recipient });
    res.status(200).json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error saving file details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET shared files by recipient name
app.get('/files/:recipientName', async (req, res) => {
  const recipientName = req.params.recipientName;

  try {
    // Find files by recipient using the File model
    const files = await File.find({ recipient: recipientName });
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching shared files:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET download file by filename
app.get('/files/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'Files', filename);

  res.download(filePath, filename, (error) => {
    if (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ message: 'Error downloading file' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Close the MongoDB connection when the server is shut down
process.on('SIGINT', () => {
  mongoose.connection.close().then(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});