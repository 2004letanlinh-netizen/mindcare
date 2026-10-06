const path = require('node:path');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`MindCare is running at http://localhost:${port}`);
});
