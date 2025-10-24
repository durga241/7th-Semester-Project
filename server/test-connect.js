/* Standalone connectivity test for MongoDB and SMTP */
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });

async function testMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing');
  mongoose.set('bufferCommands', false);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const ok = mongoose.connection.readyState === 1;
  await mongoose.disconnect();
  return ok;
}

async function testSMTP() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) throw new Error('SMTP envs missing');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  return await transporter.verify();
}

(async () => {
  try {
    const mongoOk = await testMongo();
    console.log('[mongo] ok =', mongoOk);
  } catch (e) {
    console.error('[mongo] error:', e?.message || e);
  }
  try {
    const smtpOk = await testSMTP();
    console.log('[smtp] ok =', !!smtpOk);
  } catch (e) {
    console.error('[smtp] error:', e?.message || e);
  }
})();


