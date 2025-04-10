const teams = [
    { name: "Cleveland Cavaliers", record: "63-16" },
    { name: "Boston Celtics", record: "59-21" },
    { name: "New York Knicks", record: "50-29" },
    { name: "Indiana Pacers", record: "48-31" },
    { name: "Milwaukee Bucks", record: "45-34" },
    { name: "Detroit Pistons", record: "43-36" },
    { name: "Orlando Magic", record: "40-40" },
    { name: "Atlanta Hawks", record: "37-42" },
    { name: "Chicago Bulls", record: "36-43" },
    { name: "Miami Heat", record: "36-43" },
    { name: "Toronto Raptors", record: "30-50" },
    { name: "Brooklyn Nets", record: "26-53" },
    { name: "Philadelphia 76ers", record: "24-56" },
    { name: "Charlotte Hornets", record: "19-61" },
    { name: "Washington Wizards", record: "17-63" },
    { name: "Oklahoma City Thunder", record: "65-14" },
    { name: "Houston Rockets", record: "52-27" },
    { name: "Los Angeles Lakers", record: "49-31" },
    { name: "LA Clippers", record: "47-32" },
    { name: "Denver Nuggets", record: "47-32" },
    { name: "Golden State Warriors", record: "47-32" },
    { name: "Memphis Grizzlies", record: "47-32" },
    { name: "Minnesota Timberwolves", record: "46-33" },
    { name: "Sacramento Kings", record: "39-40" },
    { name: "Dallas Mavericks", record: "38-42" },
    { name: "Phoenix Suns", record: "35-44" },
    { name: "Portland Trail Blazers", record: "35-44" },
    { name: "San Antonio Spurs", record: "32-47" },
    { name: "New Orleans Pelicans", record: "21-58" },
    { name: "Utah Jazz", record: "16-63" }
];

// Sort teams by worst record (more losses, fewer wins)
teams.sort((a, b) => {
    const [aWins, aLosses] = a.record.split('-').map(Number);
    const [bWins, bLosses] = b.record.split('-').map(Number);
    return bLosses - aLosses || aWins - bWins;
});

function displayTeams(draftOrder) {
    const teamList = document.getElementById('team-list');
    teamList.innerHTML = '';
    draftOrder.forEach((team, index) => {
        const div = document.createElement('div');
        div.className = 'team';
        const originalRank = teams.findIndex(t => t.name === team.name) + 1;
        const rankChange = originalRank - (index + 1);
        let changeClass = 'same';
        let arrow = '';
        if (rankChange > 0) {
            changeClass = 'up';
            arrow = '↑';
        } else if (rankChange < 0) {
            changeClass = 'down';
            arrow = '↓';
        }
        div.innerHTML = `${index + 1}. ${team.name} (${team.record}) <span class="rank-change ${changeClass}">${arrow} ${Math.abs(rankChange)}</span>`;
        teamList.appendChild(div);
    });
}

function resetDraftOrder() {
    displayTeams(teams); // Display initial team order
    localStorage.removeItem('draftOrder'); // Clear stored draft order
}

document.getElementById('reset-draft').addEventListener('click', resetDraftOrder);

function getRandomInt(max) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
}

function weightedRandom(weights) {
    const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
    const random = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    for (let i = 0; i < weights.length; i++) {
        cumulativeWeight += weights[i];
        if (random < cumulativeWeight) {
            return i;
        }
    }
    return weights.length - 1;
}

function startMockDraft() {
    const teamList = document.getElementById('team-list');
    const startButton = document.getElementById('start-draft');
    const resetButton = document.getElementById('reset-draft');
    
    // Reset to original order
    const originalOrder = [...teams];
    displayTeams(originalOrder);

    // Disable buttons during draft
    startButton.disabled = true;
    resetButton.disabled = true;

    teamList.style.opacity = 0; // Start fade out
    setTimeout(() => {
        // Separate lottery teams (14 worst records)
        const lotteryTeams = teams.slice(0, 14);
        const otherTeams = teams.slice(14);

        // Assign weights based on official odds
        const weights = [14, 14, 14, 12.5, 10.5, 9, 7.5, 6, 4.5, 3, 2, 1.5, 1, 0.5];

        // Simulate lottery for top 4 picks
        const topPicks = [];
        while (topPicks.length < 4) {
            const teamIndex = weightedRandom(weights);
            const selectedTeam = lotteryTeams.splice(teamIndex, 1)[0];
            topPicks.push(selectedTeam);
            weights.splice(teamIndex, 1);
        }

        // Assign picks 5-14 based on inverse order
        const remainingLotteryTeams = [...lotteryTeams];
        remainingLotteryTeams.sort((a, b) => parseInt(a.record.split('-')[0]) - parseInt(b.record.split('-')[0]));

        // Combine top picks and remaining lottery teams
        const draftOrder = topPicks.concat(remainingLotteryTeams, otherTeams);

        displayTeams(draftOrder); // Display the draft order
        localStorage.setItem('draftOrder', JSON.stringify(draftOrder));

        teamList.style.opacity = 1; // Fade back in

        // Re-enable buttons after draft
        startButton.disabled = false;
        resetButton.disabled = false;
    }, 500); // Shorter duration for fade out
}

document.getElementById('start-draft').addEventListener('click', startMockDraft);

function saveTeamRecords() {
    localStorage.setItem('teamRecords', JSON.stringify(teams));
}

function loadTeamRecords() {
    const storedRecords = localStorage.getItem('teamRecords');
    if (storedRecords) {
        const parsedRecords = JSON.parse(storedRecords);
        if (Array.isArray(parsedRecords) && parsedRecords.length === teams.length) {
            parsedRecords.forEach((record, index) => {
                teams[index].record = record.record;
            });
        }
    }
}

function enterManageMode() {
    const teamList = document.getElementById('team-list');
    teamList.innerHTML = '';
    teams.forEach((team, index) => {
        const div = document.createElement('div');
        div.className = 'team';
        const input = document.createElement('input');
        input.type = 'text';
        input.value = team.record;
        input.onchange = (e) => {
            teams[index].record = e.target.value;
            saveTeamRecords();
        };
        div.appendChild(document.createTextNode(team.name + ': '));
        div.appendChild(input);
        teamList.appendChild(div);
    });
}

loadTeamRecords();
displayTeams(teams);
