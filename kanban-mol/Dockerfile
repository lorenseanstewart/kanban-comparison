FROM node:20-alpine

RUN apk add --no-cache git

WORKDIR /mam

# Init MAM workspace: clone the root repo so mol/ and node/ are available
RUN git init && git remote add origin https://github.com/hyoo-ru/mam.git && git pull origin master

# Copy our kanban app into the workspace
RUN mkdir -p /mam/kanban
COPY kanban/ /mam/kanban/

RUN npm exec mam kanban

EXPOSE 9080

# docker compose up --build
# http://localhost:9080/kanban/-/test.html
