# Gunakan Node.js versi terbaru
FROM node:18

# Set direktori kerja di dalam container
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua file proyek ke dalam container
COPY . .

# Jalankan aplikasi
CMD ["node", "server.js"]

# Ekspose port aplikasi
EXPOSE 3000
