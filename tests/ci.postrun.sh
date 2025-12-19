#!/usr/bin/env bash
echo "::group::Keep session opened if /tmp/debug file is present"
WAIT_DURATION=0
debug_session_timeout=1440; # 2hrs
while [[ -e /tmp/debug ]]; do
    echo "Debug file present - $(( ++ WAIT_DURATION ))s - waiting for file removal..."
    if [ $WAIT_DURATION -gt ${debug_session_timeout} ]; then
    echo "Reached timeout of: ${debug_session_timeout}"
    echo "Exiting the loop"
    break
    fi
    sleep 5;
done
echo "::endgroup::"
