import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useRef, useState } from 'react';
import { Container, Dropdown, Navbar } from 'react-bootstrap';
import { Link, BrowserRouter as Router, useLocation, useMatch } from 'react-router-dom';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-hls';
import './App.css';
import VideoPlayerRef from './video.js';

function App() {
  const [url, setUrl] = useState('');
  const playerRef = useRef(null);

  const sources = url
    ? [
        {
          src: url,
          type: 'application/x-mpegURL',
        },
      ]
    : [];

  const handleInitialize = (inputUrl) => {
    localStorage.removeItem('videoUrl');
    setUrl(inputUrl);
    localStorage.setItem('videoUrl', inputUrl);
    console.log('URL set:', inputUrl);
  };

  console.log('Sources:', sources);

  return (
    <Router>
      <AppContent
        sources={sources}
        url={url}
        setUrl={setUrl}
        handleInitialize={handleInitialize}
        playerRef={playerRef}
      />
    </Router>
  );
}

function InputFields({ url, setUrl, handleInitialize, playerRef }) {
  const [inputUrl, setInputUrl] = useState(localStorage.getItem('videoUrl') || '');
  const [prefix, setPrefix] = useState(localStorage.getItem('prefix') || '');
  const [suffix, setSuffix] = useState(localStorage.getItem('suffix') || '');

  const handleUrlChange = (e) => {
    setInputUrl(e.target.value);
    localStorage.setItem('url', e.target.value);
  };

  const handlePrefixChange = (e) => {
    setPrefix(e.target.value);
    localStorage.setItem('prefix', e.target.value);
  };

  const handleSuffixChange = (e) => {
    setSuffix(e.target.value);
    localStorage.setItem('suffix', e.target.value);
  };

  const handleRefresh = () => {
    setInputUrl('');
    if (playerRef.current) {
      const playerRefElement = playerRef.current.el();
      const parentElement = playerRefElement.parentNode;
      parentElement.removeChild(playerRefElement);
    }
    localStorage.removeItem('videoUrl');
    handleInitialize('');
  };

  return (
    <div className="input-wrapper">
      <h2>Input</h2>
      <div className="input-group">
        <label htmlFor="url">URL:</label>
        <input
          type="text"
          id="url"
          placeholder="Enter URL"
          value={inputUrl}
          onChange={handleUrlChange}
        />
      </div>
      <div className="input-group">
        <label htmlFor="key">Key:</label>
        <input type="text" id="key" placeholder="Enter Key" />
      </div>
      <div className="input-group">
        <label htmlFor="user">User:</label>
        <input type="text" id="user" placeholder="Enter User" />
      </div>
      <div className="input-group">
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" placeholder="Enter Password" />
      </div>
      <div className="button-group">
        <button onClick={() => handleInitialize(inputUrl)}>Initialize</button>
        <button className="refresh-button" onClick={handleRefresh}>
          Refresh
        </button>
      </div>
    </div>
  );
}

function AppContent({ sources, url, setUrl, handleInitialize, playerRef }) {
  const location = useLocation();
  const pageTitle = location.pathname.substring(1);
  const match = useMatch("/input");
  const isInputPage = match !== null;
  const [highlights, setHighlights] = useState([]);
  const [tempHighlightStart, setTempHighlightStart] = useState(null);
  const [prefix, setPrefix] = useState(localStorage.getItem('prefix') || '');
  const [suffix, setSuffix] = useState(localStorage.getItem('suffix') || '');

  const handleNewHighlight = () => {
    setTempHighlightStart(null);
    setHighlights(prevHighlights => [...prevHighlights, { start: tempHighlightStart, end: playerRef.current.currentTime() }]);
  };

  const handleStartHighlight = () => {
    if (playerRef.current) {
      const startTime = playerRef.current.currentTime();
      setTempHighlightStart(startTime);
      console.log('Highlight start time:', startTime);
    }
  };
  
  const handleEndHighlight = async () => {
    if (playerRef.current && tempHighlightStart !== null) {
      const endTime = playerRef.current.currentTime();
      const newHighlight = { start: tempHighlightStart, end: endTime };
      setHighlights((prevHighlights) => [...prevHighlights, newHighlight]);
      console.log('Highlight saved:', newHighlight);
  
      try {
        const response = await fetch('http://localhost:3001/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startTime: newHighlight.start,
            endTime: newHighlight.end,
            streamUrl: url,
          }),
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('Clip created:', data.clipPath);
          // Fetch the file data
          fetch(`http://localhost:3001/media/clips/${data.clipName}`)
            .then(res => res.blob())
            .then(blob => {
              // Initiate download
              const downloadLink = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = downloadLink;
              a.download = data.clipName; 
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(downloadLink);
            })
            .catch(err => {
              console.error('Error downloading file:', err);
            });
        } else {
          const data = await response.json();
          console.error('Error creating clip:', data.error);
        }
  
        setTempHighlightStart(null);
      } catch (error) {
        console.error('Error sending highlight data:', error);
      }
    }
  };
  
  const handlePrefixChange = (e) => {
    setPrefix(e.target.value);
    localStorage.setItem('prefix', e.target.value);
  };
  
  const handleSuffixChange = (e) => {
    setSuffix(e.target.value);
    localStorage.setItem('suffix', e.target.value);
  };

  return (
    <div className={isInputPage ? 'input-page' : 'dashboard'}>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>
            RTMP Player - {
              location.pathname === '/'
                ? 'Dashboard'
                : pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1)
            }
          </Navbar.Brand>
          <Dropdown className="ml-auto custom-dropdown">
            <Dropdown.Toggle variant="outline-primary" id="dropdown-menu">
              <span className="navbar-toggler-icon"></span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/">Dashboard</Dropdown.Item>
              <Dropdown.Item as={Link} to="/input">Input</Dropdown.Item>
              <Dropdown.Item as={Link} to="/sources">Sources</Dropdown.Item>
              <Dropdown.Item as={Link} to="/events">Events</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Container>
        </Navbar>
      <div className="app-container">
        <div className="player-input-wrapper">
          <div className="player-wrapper">
            <VideoPlayerRef sources={sources} playerRef={playerRef} />
          </div>
          {isInputPage ? (
          <div className="input-fields-container">
            <InputFields
              url={url}
              setUrl={setUrl}
              handleInitialize={handleInitialize}
              playerRef={playerRef}
            />
            </div>
          ) : (
            <div className="input-wrapper">
              <button className="highlight-button" onClick={handleNewHighlight}>New</button>
              <button className="highlight-button" onClick={handleStartHighlight}>Start</button>
              <button className="highlight-button" onClick={handleEndHighlight}>End</button>
              <div className="input-group-name">
                <label htmlFor="prefix">Prefix:</label>
                <input
                  type="text"
                  id="prefix"
                  placeholder="Enter Prefix"
                  value={prefix}
                  onChange={handlePrefixChange}
                />

                <label htmlFor="suffix">Suffix:</label>
                <input
                  type="text"
                  id="suffix"
                  placeholder="Enter Suffix"
                  value={suffix}
                  onChange={handleSuffixChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;