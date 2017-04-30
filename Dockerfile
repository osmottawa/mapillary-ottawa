FROM mhart/alpine-node
MAINTAINER @DenisCarriere

# Install Dependencies
WORKDIR /src
ADD package.json /src/package.json
RUN npm install -g yarn
ADD yarn.lock /src/yarn.lock
RUN yarn

# Run App
ADD . /src
CMD npm start && npm run upload-s3