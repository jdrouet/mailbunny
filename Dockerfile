FROM node:lts AS builder

WORKDIR /code
COPY . /code
RUN npm ci

FROM node:lts-alpine

WORKDIR /code
COPY --from=builder /code /code

CMD ["npm", "start"]
