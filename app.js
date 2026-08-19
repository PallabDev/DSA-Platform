const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 7853;

const problems = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'dsa_roadmap_problems.json'), 'utf8'));
const roadmap = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'dsa_roadmap_30days.json'), 'utf8'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('onboarding');
});

app.get('/dashboard', (req, res) => {
  const problemsMap = {};
  problems.forEach(p => { problemsMap[p.id] = p; });

  const enrichedDays = roadmap.days.map(day => ({
    ...day,
    problems: day.problem_ids.map(id => problemsMap[id]).filter(Boolean)
  }));

  res.render('dashboard', {
    roadmap: { ...roadmap, days: enrichedDays },
    problems
  });
});

app.listen(PORT, () => {
  console.log(`Chai and Code running at http://localhost:${PORT}`);
});
