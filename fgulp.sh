#!/bin/sh
rm -rf build
echo 'build polymer 2 site...'
polymer build

echo 'moving stuff around...'
mv build build_tmp
mv polymer.json polymer_tmp.json
mv polymer-1.x.json polymer.json
mv bower_components bower_components_tmp
mv bower_components-1.x bower_components
mv index.html index_tmp.html
mv index-1x.html index.html

echo 'build polymer 1 site...'
polymer build

echo 'cleanup'
mv polymer.json polymer-1.x.json
mv polymer_tmp.json polymer.json
mv bower_components bower_components-1.x
mv bower_components_tmp bower_components
mv index.html index-1x.html
mv index_tmp.html index.html

mkdir build/polymer1
mkdir build/polymer2
mv build/es5 build/es6 build/polymer.json build/polymer1
mv build_tmp/es5 build_tmp/es6 build_tmp/polymer.json build/polymer2
rm -rf build_tmp


echo 'deploy'
firebase deploy
