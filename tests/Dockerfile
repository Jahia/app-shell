FROM cypress/base:13.8.0

ADD . /tmp
WORKDIR /tmp
#CI=true reduces the verbosity of the installation logs
RUN cd /tmp && CI=true yarn install
RUN CI=true /tmp/node_modules/.bin/cypress install

# Jahia-cli is used to warmup the environment at startup
RUN PUPPETEER_SKIP_DOWNLOAD=true yarn add jahia-cli@0.0.47

CMD ["/bin/bash", "-c", "/tmp/env.run.sh"]
