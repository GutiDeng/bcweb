#!/bin/bash

script_dir=`cd "$(dirname "${BASH_SOURCE[0]}")"; pwd`

cd $script_dir/src

cat \
    core.js \
    dom.js \
    loader.js \
    viewport.js \
    group.js \
    app.js \
    ua.js \
    ui.js \
    cookie.js \
    ajax.js \
> ../build/bcweb-dev.js

sed -e 's/console.log/\/\/console.log/g' ../build/bcweb-dev.js > ../build/bcweb.js
    
cd -

