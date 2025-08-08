setlocal enabledelayedexpansion

start /B curl http://localhost:3000/ > NUL 2>&1

set pages=TODO

for %%p in (%pages%) do (
    start /B curl http://localhost:3000/%%p > NUL 2>&1
)
