# NAS Music Player

A desktop music player built with Electron that connects to your Synology NAS to stream and play your music collection.

## Features

- 🎵 Connect to Synology NAS via File Station API
- 📁 Browse and load music files from your NAS
- ▶️ Full music player controls (play, pause, next, previous)
- 🔊 Volume control
- ⏱️ Progress bar with time display
- 🔍 Search functionality for your music library
- 🎨 Modern, beautiful UI

## Prerequisites

- Node.js (v14 or higher)
- A Synology NAS with:
  - File Station enabled
  - Music files stored in a folder (e.g., `/music`)
  - Network access from your computer

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

Start the application in development mode:
```bash
npm start
```

## Usage

### Connecting to Your NAS

1. Enter your NAS details:
   - **NAS Address**: Your NAS IP address and port (e.g., `192.168.1.100:5000`)
   - **Username**: Your Synology account username
   - **Password**: Your Synology account password
   - **Music Folder Path**: Path to your music folder on the NAS (e.g., `/music`)

2. Click "Connect to NAS"

3. Once connected, your music library will be loaded automatically

### Playing Music

- Click on any song in the library to start playing
- Use the player controls:
  - ⏮ Previous track
  - ▶/⏸ Play/Pause
  - ⏭ Next track
- Adjust volume using the volume slider
- Seek through the song using the progress bar
- Search for songs using the search bar

## Technical Details

### Architecture

- **Main Process** (`src/index.ts`): Manages the Electron application window
- **Renderer Process** (`src/renderer.ts`): Handles UI and music playback
- **NAS Service** (`src/nas-service.ts`): Manages connection and communication with Synology NAS

### Synology File Station API

The application uses the Synology File Station API to:
- Authenticate with your NAS
- List music files
- Stream audio files

### Supported Audio Formats

- MP3
- FLAC
- WAV
- M4A
- AAC
- OGG
- WMA

## Building the Application

To package the application for distribution:

```bash
npm run package
```

To create installers:

```bash
npm run make
```

## Security Notes

- Credentials are only stored in memory during the session
- Always use HTTPS when accessing your NAS remotely
- Consider using a dedicated music-only account with limited permissions

## Troubleshooting

### Cannot connect to NAS

- Verify your NAS IP address and port
- Ensure File Station is enabled on your NAS
- Check if your firewall allows the connection
- Verify your username and password

### Music files not loading

- Check if the music folder path is correct
- Ensure your account has read permissions for the music folder
- Verify the files are in supported formats

### Playback issues

- Check your internet connection (for remote access)
- Ensure your NAS has sufficient resources
- Try reducing the audio quality settings on your NAS

## Development

### Project Structure

```
nas-music-player/
├── src/
│   ├── index.ts          # Main process
│   ├── renderer.ts       # Renderer process
│   ├── nas-service.ts    # NAS connection service
│   ├── preload.ts        # Preload script
│   ├── index.html        # HTML template
│   └── index.css         # Styles
├── package.json
└── README.md
```

### Technologies Used

- **Electron**: Desktop application framework
- **TypeScript**: Programming language
- **Axios**: HTTP client for API requests
- **Webpack**: Module bundler
- **Electron Forge**: Build and packaging tool

## Future Enhancements

- [ ] Playlist management
- [ ] Audio metadata display (album art, artist info)
- [ ] Equalizer
- [ ] Shuffle and repeat modes
- [ ] Offline caching
- [ ] Multiple NAS support
- [ ] Dark/Light theme toggle

## License

MIT

## Author

dingrui
