#!/usr/bin/env bash

# This script controls the startup of the container environment
# It can be used as an alternative to having docker-compose up started by the CI environment

source ./set-env.sh

echo " == Printing the most important environment variables"
echo " MANIFEST: ${MANIFEST}"
echo " TESTS_IMAGE: ${TESTS_IMAGE}"
echo " CLOUD_ENVNAME: ${CLOUD_ENVNAME}"
echo " JAHIA_URL: ${JAHIA_URL}"

echo " == Starting environment in Jahia Cloud"
curl -i https://jahia.cloud/cms/render/live/en/sites/cloud/home.createJahiaEnv.do \
    -X POST \
    -H "Accept: application/json" \
    -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" \
    -H "Cookie: DISTRIBUTED_JSESSIONID=${CLOUD_JSESSIONID}" \
    -d "envName=${CLOUD_ENVNAME}&shortDomain=${CLOUD_ENVNAME}-${CLOUD_DOMAINSUFFIX}&productVersion=${CLOUD_JAHIA_VERSION}&rootPassword=${SUPER_USER_PASSWORD}&subscriptionItemId=${CLOUD_SUBSCRIPTIONITEMID}&regionId=${CLOUD_REGIONID}&bandId=${CLOUD_BANDID}"

docker run --name cypress -e MANIFEST=${MANIFEST} -e SUPER_USER_PASSWORD=${SUPER_USER_PASSWORD} -e JAHIA_URL=${JAHIA_URL} -e NEXUS_USERNAME=${NEXUS_USERNAME} -e NEXUS_PASSWORD=${NEXUS_PASSWORD} ${TESTS_IMAGE}
