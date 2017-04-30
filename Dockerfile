FROM mhart/alpine-node
MAINTAINER @DenisCarriere

# Install Dependencies
WORKDIR /src
ADD package.json /src/package.json
RUN npm install -g yarn
ADD yarn.lock /src/yarn.lock
RUN yarn

# Install AWS
RUN apk -v --update add \
        python \
        py-pip \
        groff \
        less \
        mailcap \
        && \
    pip install --upgrade awscli s3cmd python-magic && \
    apk -v --purge del py-pip && \
    rm /var/cache/apk/*

VOLUME /root/.aws
ADD extents/ /src/extents
ADD index.js /src/index.js

# Run App
CMD npm restart && npm run upload-s3