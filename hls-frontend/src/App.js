import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Container, Dropdown, Navbar } from 'react-bootstrap';
import { Link, BrowserRouter as Router, useLocation, useMatch } from 'react-router-dom';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-hls';
import './App.css';
import VideoPlayer from './video.js';

function App() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    const storedUrl = localStorage.getItem('videoUrl');
    if (storedUrl) {
      setUrl(storedUrl);
    }
  }, []);

  const sources = url
    ? [
        {
          src: url,
          type: 'application/x-mpegURL',
        },
      ]
    : [];

  const handleInitialize = (inputUrl) => {
    setUrl(inputUrl);
    localStorage.setItem('videoUrl', inputUrl);
  };

  return (
    <Router>
      <AppContent
        sources={sources}
        url={url}
        setUrl={setUrl}
        handleInitialize={handleInitialize}
      />
    </Router>
  );
}

function InputFields({ url, setUrl, handleInitialize }) {
  const [inputUrl, setInputUrl] = useState(localStorage.getItem('videoUrl') || '');

  const handleUrlChange = (e) => {
    setInputUrl(e.target.value);
    localStorage.setItem('url', e.target.value);
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
      <button onClick={() => handleInitialize(inputUrl)}>Initialize</button>
    </div>
  );
}

function AppContent({ sources, url, setUrl, handleInitialize }) {
  const location = useLocation();
  const pageTitle = location.pathname.substring(1);
  const match = useMatch("/input");
  const isInputPage = match !== null;

  return (
    <div className={isInputPage ? 'input-page' : ''}>
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
            <VideoPlayer sources={sources} />
          </div>
          {isInputPage && <InputFields url={url} setUrl={setUrl} handleInitialize={handleInitialize} />}
        </div>
      </div>
    </div>
  );
}

export default App;