# **************** Documentation for Use **************** 

Deployment Base URL: howtobuildweek.herokuapp.com/

## Endpoints

POST: /api/register
- requires username and password
- success will return the created account information (201)
- failure to provide either username or password will throw error 400
- failure to provide a unique username will throw error 500


POST: /api/login
- requires a valid username and password
- success will return a json web token (authentication)
- incorrect username or password will throw error 401
- failure to provide a username or password will throw error 400
- if anything else goes wrong it will throw error 500

