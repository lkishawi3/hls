import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-hls';

const VideoPlayer = ({ sources }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (sources && sources.length > 0) {
      if (playerRef.current) {
        playerRef.current.dispose();
      }

      const videoElement = videoRef.current;
      if (!videoElement) return;

      const player = playerRef.current = videojs(videoElement, {
        sources,
        autoplay: true,
        controls: true,
        width: '100%',
        height: '100%',
      });

      return () => {
        if (player) {
          player.dispose();
        }
      };
    }
  }, [sources]);

  return (
    <div>
      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered" />
      </div>
    </div>
  );
};

export default VideoPlayer;