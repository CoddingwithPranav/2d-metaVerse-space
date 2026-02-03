FROM node:22

WORKDIR /usr/app/metaverse

# Install global dev tools
RUN npm install -g nodemon

# Copy root-level files for dependency resolution
COPY package*.json turbo.json ./
COPY apps/ws/package*.json apps/ws/
COPY packages/db/package*.json packages/db/
COPY packages/typescript-config/package*.json packages/typescript-config/

# Install workspace dependencies
RUN npm install --workspaces

# Install ws app dependencies explicitly
RUN cd apps/ws && npm install

# Now copy source files (after installing deps to avoid cache busting)
COPY apps apps
COPY packages packages

EXPOSE 3000

# Run the HTTP app using the workspace-aware script
CMD ["npm", "run", "--workspace=ws", "dev"]
