const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 7853;

const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'dsa_roadmap_problems.json'), 'utf8'));
const roadmap30 = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'dsa_roadmap_30days.json'), 'utf8'));
const roadmap60 = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'dsa_roadmap_60days.json'), 'utf8'));

// Build flat questions map from the new structure
const questionsMap = {};
const allQuestions = [];
rawData.sheets.topics.forEach(topic => {
  topic.questions.forEach(q => {
    const enriched = {
      id: q.id,
      name: q.questionName,
      slug: q.questionSlug,
      leetcode: q.problemLink,
      solutionLink: q.solutionLink,
      level: q.level,
      avgTime: q.avgTime,
      companyTags: (q.companyTags || []).map(c => c.name),
      topic: topic.topicName
    };
    questionsMap[q.id] = enriched;
    allQuestions.push(enriched);
  });
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('onboarding');
});

app.get('/dashboard', (req, res) => {
  const mode = req.query.mode === '60' ? '60' : '30';
  const roadmap = mode === '60' ? roadmap60 : roadmap30;

  const enrichedDays = roadmap.days.map(day => ({
    ...day,
    problems: day.problem_ids.map(id => questionsMap[id]).filter(Boolean)
  }));

  res.render('dashboard', {
    roadmap: { ...roadmap, days: enrichedDays },
    allProblems: allQuestions,
    mode
  });
});

app.listen(PORT, () => {
  console.log(`AlgoFlow running at http://localhost:${PORT}`);
});
