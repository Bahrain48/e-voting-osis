require('dotenv').config();
const path = require('node:path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const methodOverride = require('method-override');
const routes = require('./routes');
const locals = require('./middleware/locals');
const prisma = require('./lib/prisma');

const app = express();
const port = Number(process.env.PORT || 3000);
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET wajib diatur saat NODE_ENV=production.');
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(session({
  name: 'osis.sid',
  secret: process.env.SESSION_SECRET || 'development-only-change-this-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 8 },
}));
app.use(flash());
app.use(locals);
app.use(routes);
app.use((req, res) => res.status(404).render('errors/404', { title: 'Halaman tidak ditemukan' }));
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(500).render('errors/500', { title: 'Terjadi gangguan' });
});

const server = app.listen(port, () => console.log(`Suara OSIS berjalan di http://localhost:${port}`));

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = app;
