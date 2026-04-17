# Pali Digital Twin

A web-based 3D digital twin and interactive map viewer for visualizing geospatial data of Pali collected by the Masters of Urban Design Studio at the DY Patil School of Architecture, Navi Mumbai. This repository collects various layers of Pali data (contours, buildings, roads, drainage, vegetation, administrative boundaries, etc.) and publishes them in a web viewer using Mapbox GL JS and Vite.

## Live Demo
🌍 **[https://pali-digital-twin.netlify.app/](https://pali-digital-twin.netlify.app/)**

## Features
- Interactive 3D web map using Mapbox GL JS.
- Multiple open data layers visualized simultaneously (Gaothan, Topography, Water Bodies, Transportation, Buildings, and more).

## Tech Stack
- Frontend Tooling: Vite (Typescript)
- Map rendering: Mapbox GL JS

## Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/datsvarun/pali-viewer.git
   cd pali-digital-twin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Mapbox Access Token**
   - Head over to [Mapbox](https://www.mapbox.com/) to create a free account and get an Access Token.
   - Open `src/main.ts` and replace `'YOUR_MAPBOX_ACCESS_TOKEN_HERE'` with your actual Mapbox public token.

4. **Run the development server**
   ```bash
   npm run dev
   ```
   This will start the local server, typically available at `http://localhost:5173`.

5. **Build for production**
   ```bash
   npm run build
   ```

## Data Assets
All geospatial `.geojson` files powering the frontend viewer are located in the `public/data` directory. 
