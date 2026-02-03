# 2D Metaverse Space 🌐

A real-time multiplayer 2D metaverse platform where users can create avatars, interact in virtual spaces, and communicate in real-time. Built with modern web technologies using a microservices architecture.

## 🚀 Features

- **Real-time Multiplayer**: WebSocket-based real-time interactions
- **Avatar System**: Create and customize your virtual presence
- **Virtual Spaces**: Interactive 2D environments
- **User Authentication**: Secure JWT-based authentication
- **Microservices Architecture**: Scalable and maintainable design

## 🏗️ Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Node.js, Express.js, WebSocket
- **Database**: PostgreSQL with Prisma ORM
- **Infrastructure**: Docker, Turborepo Monorepo

## 📖 Getting Started

For detailed setup instructions, development guidelines, and complete documentation, please refer to:

👉 **[Full Documentation in metaverse/README.md](./metaverse/README.md)**

## ⚡ Quick Start

```bash
cd metaverse
cp .env.example .env
./setup-local.sh
npm run dev
```

Access the platform at http://localhost:3001

## 📁 Project Structure

```
├── metaverse/          # Main application (Turborepo monorepo)
│   ├── apps/          # Frontend, HTTP API, WebSocket server
│   ├── packages/      # Shared packages and utilities
│   └── README.md      # Detailed documentation
└── tests/             # Test suites
```

## 📚 Learn More

For comprehensive information about:
- Architecture and design
- Setup and installation
- Development workflow
- API documentation
- Contributing guidelines

Please visit the **[metaverse/README.md](./metaverse/README.md)** file.

## 📄 License

MIT License
