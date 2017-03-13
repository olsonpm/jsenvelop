#! /usr/bin/env sh

cmd="${1}"
shift

if [ "${cmd}" = 'test' ]; then
  glob="${1}"
  shift
  node_modules/mocha/bin/mocha --ui tdd "test/${glob}" "${@}"
else
  echo "No case for command: '${cmd}'"
fi
