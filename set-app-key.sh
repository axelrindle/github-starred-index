#!/usr/bin/env bash

OLD_KEY=$(grep APP_KEY= .env)
if [ "$OLD_KEY" != "APP_KEY=" ]; then
	read -p "An existing key has been found! Do you want to overwrite it? [y/N] " -n 1 -r
	echo
	if [[ ! $REPLY =~ ^[Yy]$ ]]; then
		echo " >  Cancelled."
		exit 0
	fi
fi

NEW_KEY=$(tr -dc 'a-zA-Z0-9' < /dev/urandom | fold -w 64 | head -n 1)
sed -i.bak "s/^APP_KEY=.*/APP_KEY=$NEW_KEY/" .env
echo " >  New key has been set."
