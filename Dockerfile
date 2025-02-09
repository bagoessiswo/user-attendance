# Gunakan Node.js versi terbaru
FROM node:18

# Set direktori kerja di dalam container
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

RUN cd src && npx sequelize-cli db:migrate && cd ..

# Copy semua file proyek ke dalam container
COPY . .

# Ekspose port aplikasi
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]
