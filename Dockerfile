FROM nvidia/cuda:10.2-runtime

# Set Env to all

ENV NVIDIA_DRIVER_CAPABILITIES all

# Update OS

RUN apt-get update && apt-get upgrade -y
RUN apt-get install ffmpeg zip cron nodejs npm -y

# Copy to workdir

WORKDIR /home/node
COPY app .

# Add cron to delete old files

RUN echo "0 * * * * root find /home/node/public/downloads* -mtime +1 -type f -delete" > /etc/crontab
RUN echo "#" >> /etc/crontab
RUN cat /etc/crontab

# Install packages

RUN npm install

CMD [ "node", "./app.js"]
