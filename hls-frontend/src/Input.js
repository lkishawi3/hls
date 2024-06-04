import React from 'react';
import { default as VideoPlayer } from "./video.js";

function InputPage({ videoJsOptions }) {
  return (
    <div>
      <div className="player-wrapper">
        <VideoPlayer key="input-player" {...videoJsOptions} />
      </div>
    </div>
  );
}

export default InputPage;