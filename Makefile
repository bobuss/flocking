publish:
	rsync --delete -dav --exclude-from=.rsyncexclude . bobuss@tornil.net:~/www/flocking/
