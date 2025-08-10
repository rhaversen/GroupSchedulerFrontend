setlocal enabledelayedexpansion

start /B curl http://localhost:3000/ > NUL 2>&1

set pages=confirm-deletion confirm-email dashboard events events/id events/browse events/my-events events/participating login people people/id profile reset-password service signup

for %%p in (%pages%) do (
    start /B curl http://localhost:3000/%%p > NUL 2>&1
)
