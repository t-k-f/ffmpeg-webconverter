FROM node:lts

# Update OS

RUN apt-get update && apt-get upgrade -y
RUN apt-get install ffmpeg zip cron -y

# Copy to workdir

WORKDIR /home/node
COPY app .

# Add cron to delete old files

RUN echo "0 * * * * root find /home/node/public/downloads* -mtime +1 -type f -delete" > /etc/crontab
RUN echo "#" >> /etc/crontab
RUN cat /etc/crontab

# Own files as node

RUN chown -R node:node /home/node

# Switch to node user

USER node
RUN npm install

CMD [ "node", "./app.js"]
