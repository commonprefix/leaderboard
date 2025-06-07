# Running
* `npm install`
* Create GOOGLE_AUTH key:
 - Go to the Google Cloud Console for Common Prefix.
 - Go to the APIs & Services → Credentials page and click on the "Create credentials" button.
 - Select the "Service account" responsible for the leaderboard
 - Click on "Keys"
 - Download the JSON file
* Create an Upstash Redis database:
* Create a `.env` file in the root of this repository:
 - Set GOOGLE_AUTH='...'. The '...' should be the whole JSON-encoded file that you downloaded, without new lines, so that it can be decoded using JSON.parse. Be careful when converting: The JSON file you download from Google is not JSON. It is executable JS (it contains string concatenations).
 - Set the UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN variables.
* For dev:
  - `npm run dev`
* For production
  - Build using `npm run build`
  - Run using `npm run start`, or, for persistence, use `pm2 start npm --name 'common-prefix-leaderboard' -- start`
