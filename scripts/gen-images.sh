#!/bin/bash
# Generate Climbix-style dark 3D service card images with orange accents
cd /home/z/my-project/growthora

z-ai image -p "Dark navy 3D isometric illustration of website development devices, laptop and smartphone floating with glowing orange UI elements, code brackets icon, dark background with subtle grid, premium tech aesthetic, orange glow accents, high quality render" -o ./public/images/service-build.png -s 1344x768
z-ai image -p "Dark navy 3D isometric illustration of marketing analytics dashboard with rising line charts and bar graphs, glowing orange data visualization, rocket icon, dark background with subtle grid, premium tech aesthetic, orange glow accents, high quality render" -o ./public/images/service-scale.png -s 1344x768
z-ai image -p "Dark navy 3D isometric illustration of SEO search optimization, large magnifying glass over search results pages, glowing orange ranking charts upward arrow, dark background with subtle grid, premium tech aesthetic, orange glow accents, high quality render" -o ./public/images/service-rank.png -s 1344x768
echo "All service images done"
