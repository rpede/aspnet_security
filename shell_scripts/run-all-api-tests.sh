#!/usr/bin/env bash

for file in ../tests/api/*.json
do
  newman run "$file"
done