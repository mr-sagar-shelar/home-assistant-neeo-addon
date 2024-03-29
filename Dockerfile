ARG BUILD_FROM
FROM $BUILD_FROM

# ENV LANG C.UTF-8
# SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# ARG TEMPIO_VERSION BUILD_ARCH

RUN apk add --no-cache \
    nodejs \
    npm

COPY package.json /
COPY devices/ /devices/
COPY lib/ /lib/
RUN cd / && npm install

COPY run.sh /
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]