
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const port = 3000;

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// File upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const form = new FormData();
  form.append('file', fs.createReadStream(req.file.path));

  try {
    const response = await axios.post('https://file.io', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    // Delete the file from the server after uploading to file.io
    fs.unlinkSync(req.file.path);

    res.json({ message: 'File uploaded successfully', link: response.data.link });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

app.get('/upload_test.html', (req, res) => {
  res.sendFile(__dirname + '/upload_test.html');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
