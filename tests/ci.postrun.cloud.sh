#!/usr/bin/env bash

# This script controls the startup of the container environment
# It can be used as an alternative to having docker-compose up started by the CI environment

source ./set-env.sh

echo " == Printing the most important environment variables"
echo " MANIFEST: ${MANIFEST}"
echo " TESTS_IMAGE: ${TESTS_IMAGE}"
echo " CLOUD_ENVNAME: ${CLOUD_ENVNAME}"
echo " JAHIA_URL: ${JAHIA_URL}"

echo " == Shutting down environment in Jahia Cloud"
curl -i https://jahia.cloud/cms/render/live/en/sites/cloud/home.deleteEnv.do \
    -X POST \
    -H "Accept: application/json" \
    -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
    -H "Cookie: DISTRIBUTED_JSESSIONID=${CLOUD_JSESSIONID}" \
    -d "shortDomain=${CLOUD_ENVNAME}-${CLOUD_DOMAINSUFFIX}"
