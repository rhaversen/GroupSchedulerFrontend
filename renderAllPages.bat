setlocal enabledelayedexpansion

start /B curl http://localhost:3000/ > NUL 2>&1

set pages=404 confirm login reset-password signup

for %%p in (%pages%) do (
    start /B curl http://localhost:3000/%%p > NUL 2>&1
)
