const express = require('express');
const NodeMediaServer = require('node-media-server');
const cors = require('cors');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const app = express();

ffmpeg.setFfmpegPath('/usr/local/bin/ffmpeg');

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
}));
app.use('/live', express.static(path.join(__dirname, 'media/live')));
app.use('/media', express.static(path.join(__dirname, 'media')));
app.use('/media/clips', express.static(path.join(__dirname, 'media/clips')));

app.use(express.static(path.join(__dirname, 'build')));

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8001,
    mediaroot: './media',
    allow_origin: '*'
  },
  trans: {
    ffmpeg: '/usr/local/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        hlsKeep: true, // to prevent hls file delete after end the stream
        dash: true,
        dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
        dashKeep: true // to prevent dash file delete after end the stream
      }
    ]
  }
};

const nms = new NodeMediaServer(config);

nms.run();

app.post('/', (req, res) => {
  console.log('Received POST request'); // Log when the route is hit

  const clipFileName = `clip_${Date.now()}.mp4`;
  const { startTime, endTime, streamUrl } = req.body;
  console.log('Request body:', req.body); // Log the request body

  ffmpeg()
    .input(streamUrl)
    .seekInput(startTime)
    .duration(endTime - startTime)
    .outputOptions('-c:v libx264')
    .outputOptions('-crf 18')
    .outputOptions('-preset slow')
    .outputOptions('-crf 23')
    .outputOptions('-c:a aac')
    .outputOptions('-movflags +faststart')
    .outputOptions('-avoid_negative_ts make_zero')
    .outputOptions('-keyint_min 2')
    .outputOptions('-g 2')
    .videoFilter('setpts=PTS-STARTPTS')
    .audioFilter('aresample=async=1')
    .output(`media/clips/${clipFileName}`)
    .on('end', () => {
      console.log('Conversion finished');
      console.log('Clip created:', clipFileName);
      const responseData = { clipName: clipFileName };
      console.log('Response data:', responseData);
      res.json(responseData);
    })
    .on('error', (err) => {
      console.error('Error:', err);
      res.status(500).json({ error: 'Error converting video' });
    })
    .run();
});

app.listen(3001, () => console.log('Server running on port 3001'));

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});