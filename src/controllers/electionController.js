const prisma = require('../lib/prisma');

async function quickCount(req, res, next) {
  try {
    res.set('Refresh', '15');
    const [candidates, totalVotes, config] = await Promise.all([
      prisma.candidate.findMany({ orderBy: { nomorUrut: 'asc' } }),
      prisma.voteAudit.count(),
      prisma.electionConfig.findUnique({ where: { id: 1 } }),
    ]);
    res.render('election/quick-count', { title: 'Quick count', candidates, totalVotes, config });
  } catch (error) { next(error); }
}

async function report(req, res, next) {
  try {
    const [candidates, totalVotes, config] = await Promise.all([
      prisma.candidate.findMany({ orderBy: { nomorUrut: 'asc' } }),
      prisma.voteAudit.count(),
      prisma.electionConfig.findUnique({ where: { id: 1 } }),
    ]);
    res.render('election/report', { title: 'Berita acara rekapitulasi', candidates, totalVotes, config });
  } catch (error) { next(error); }
}

module.exports = { quickCount, report };
