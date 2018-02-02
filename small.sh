#!/bin/sh
rm -rf build
echo 'build polymer 2 site...'
polymer build

echo 'cleanup'



mkdir build/polymer2
mv build/es5 build/es6 build/polymer.json build/polymer2



echo 'deploy'
firebase deploy
