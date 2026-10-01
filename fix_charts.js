const fs = require('fs');

function fixIntensity() {
  const file = 'src/app/dashboard/parent/_components/ChildIntensityChart.tsx';
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/const barData = \[\.\.\.sessions\].*?\}\);/s, `  const chronologicalSessions = [...sessions].reverse();
  const groupedData = chronologicalSessions.reduce((acc, s) => {
    const date = new Date((s as any).start_time).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
    const totalSeconds = Math.round((s as any).duration || 0);
    if (!acc[date]) {
      acc[date] = { date, duration: 0 };
    }
    acc[date].duration += totalSeconds;
    return acc;
  }, {} as Record<string, any>);

  const barData = Object.values(groupedData).slice(-7).map((item: any) => {
    const mins = Math.floor(item.duration / 60);
    const secs = item.duration % 60;
    return {
      date: item.date,
      duration: item.duration,
      formattedTime: \`\${mins}p \${secs}s\`
    };
  });`);
  fs.writeFileSync(file, code);
}

function fixIndependence() {
  const file = 'src/app/dashboard/parent/_components/ChildIndependenceChart.tsx';
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/const data = \[\.\.\.sessions\].*?\}\);/s, `  const chronologicalSessions = [...sessions].reverse();
  const groupedData = chronologicalSessions.reduce((acc, s) => {
    const date = new Date((s as any).start_time).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
    
    const logs = (s as any).quest_logs || [];
    let verbal = 0;
    let visual = 0;
    let physical = 0;

    logs.forEach((log: any) => {
      verbal += (log.hints_verbal || 0);
      visual += (log.hints_visual || 0);
      physical += (log.hints_physical || 0);
    });

    if (!acc[date]) {
      acc[date] = { date, verbal: 0, visual: 0, physical: 0, total: 0 };
    }
    acc[date].verbal += verbal;
    acc[date].visual += visual;
    acc[date].physical += physical;
    acc[date].total += (verbal + visual + physical);
    return acc;
  }, {} as Record<string, any>);

  const data = Object.values(groupedData).slice(-7);`);
  fs.writeFileSync(file, code);
}

function fixProgress() {
  const file = 'src/app/dashboard/parent/_components/ChildProgressChart.tsx';
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/const data = \[\.\.\.sessions\].*?\}\);/s, `  const chronologicalSessions = [...sessions].reverse();
  const groupedData = chronologicalSessions.reduce((acc, s) => {
    const date = new Date((s as any).start_time).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
    const fullDate = new Date((s as any).start_time).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    if (!acc[date]) {
      acc[date] = { date, fullDate, scoreSum: 0, count: 0 };
    }
    acc[date].scoreSum += ((s as any).score || 0);
    acc[date].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const data = Object.values(groupedData)
    .slice(-10) // 10 buổi học gần nhất (10 ngày học gần nhất)
    .map((item: any) => ({
      date: item.date,
      fullDate: item.fullDate,
      score: Math.round(item.scoreSum / item.count)
    }));`);
  fs.writeFileSync(file, code);
}

fixIntensity();
fixIndependence();
fixProgress();
console.log("Done");
