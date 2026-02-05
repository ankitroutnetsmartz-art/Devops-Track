# Use the stable alpine version for the smallest security footprint
FROM nginx:stable-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy your local static files to the nginx html directory
# Ensure filenames match: index.html, style.css, script.js
COPY . /usr/share/nginx/html/

# Expose port 80 for traffic
EXPOSE 80

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
