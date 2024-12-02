# Wordcross Game

A crossword puzzle game built with Phaser.js where words are placed randomly on a grid and intersect with each other.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/darkestsoul99/wordcross-game.git
   cd wordcross-game
   ```

2. Build and run the container:
   ```bash
   docker-compose up --build
   ```

3. Access the game at: `http://localhost:8080`

## Development

### Project Structure

```bash
wordcross-game/
├── public/
│   ├── assets/         # Game assets (images, sprites)
│   ├── js/            # Game logic
│   ├── index.html     # Main HTML file
│   └── styles.css     # Styles
├── server/
│   └── server.js      # Express server
├── Dockerfile
├── docker-compose.yml
└── package.json
```

### Key Features
- Random word placement on grid
- Word intersections
- Interactive grid cells
- Animated background
- Refresh functionality

### Running in Development Mode
The Docker setup includes:
- Hot reloading with nodemon
- Volume mounting for live code updates
- Development environment configuration

### Stopping the Application
```bash
# Stop the containers
docker-compose down
```

### Viewing Logs

```bash
# View logs
docker-compose logs

# Follow logs
docker-compose logs -f
```

## Troubleshooting

### Common Issues

1. **Port 8080 already in use**
   - Stop any services using port 8080
   - Or modify the port in docker-compose.yml and server.js

2. **Docker permission issues on Windows**
   - Run PowerShell/Command Prompt as Administrator
   - Ensure Docker Desktop is running

3. **Changes not reflecting**
   - Ensure Docker volumes are properly mounted
   - Check if nodemon is watching the correct files

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request




