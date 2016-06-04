This is my attempt to build from scratch a version of angular

Actually it is based on book "Tero Parviainen - Build Your Own Angularjs"

#Issue with testem
atal error: spawn phantomjs ENOENT

https://github.com/teropa/build-your-own-angularjs/issues/88

in file:
node_modules\grunt-contrib-testem\node_modules\testem\lib\browser_launcher.js

it was the line line 120 (not 123 as mentioned above)
exe: 'phantomjs', ---> exe: 'phantomjs.cmd',