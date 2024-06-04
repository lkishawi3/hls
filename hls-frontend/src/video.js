import React from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import 'videojs-contrib-dash';

class VideoPlayer extends React.Component {
    componentDidMount() {
        console.log(this.props);
        this._isMounted = true;
        setTimeout(() => {
            if (this._isMounted) {
                this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
                    console.log("onPlayerReady", this);
                });
            }
        }, 0);
    }
    
    componentWillUnmount() {
        this._isMounted = false;
        if (this.player) {
            this.player.dispose();
        }
    }

// wrap the player in a div with a `data-vjs-player` attribute
// so videojs won't create additional wrapper in the DOM
// see https://github.com/videojs/video.js/pull/3856

render() {
    return (
      <div> 
        <div data-vjs-player>
          <video ref={node => (this.videoNode = node)} className="video-js vjs-big-play-centered" />
        </div>
      </div>
        );
    }
}

export default VideoPlayer;

