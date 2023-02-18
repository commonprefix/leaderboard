# Running
* `npm install`
* Create a `./libs/credentials.json` file:
 - Go to the Google Cloud Console for Common Prefix.
 - Go to the APIs & Services → Credentials page and click on the "Create credentials" button.
 - Select the "Service account" responsible for the leaderboard
 - Click on "Keys"
 - Download the JSON file and place it at `./libs/credentials.json`
 - Do not commit this file
* For dev:
  - `npm run dev`
* For production
  - Build using `run run build`
  - Run using `npm run start`, or, for persistence, use `pm2 start npm --name 'common-prefix-leaderboard' -- start`
