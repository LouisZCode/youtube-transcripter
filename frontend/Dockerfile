FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ENV NEXT_PUBLIC_API_URL=https://api.tubetext.app
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]