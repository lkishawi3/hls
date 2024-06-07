import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoPlayer = ({ sources, playerRef }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (!playerRef.current) {
      playerRef.current = videojs(videoElement, {
        autoplay: true,
        controls: true,
        width: '100%',
        height: '100%',
      });
    }

    if (sources && sources.length > 0) {
      playerRef.current.src(sources);
    }
  }, [sources, playerRef]);

  return (
    <div>
      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered" />
      </div>
    </div>
  );
};

export default VideoPlayer;