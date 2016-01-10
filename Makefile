all:
	tsc -p .
	node --harmony sync_test.js