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
    const originalOrder = JSON.parse(localStorage.getItem('draftOrder')) || teams;
    
    const listItems = draftOrder.map((team, index) => {
        const originalIndex = originalOrder.findIndex(t => t.name === team.name);
        let movement = '';
        
        // Only show movement for lottery teams (top 14 picks)
        if (index < 14) {
            const rankChange = originalIndex - index;
            if (rankChange > 0) {
                movement = `<span class="up">↑</span> ${rankChange}`;
            } else if (rankChange < 0) {
                movement = `<span class="down">↓</span> ${Math.abs(rankChange)}`;
            }
        }
        
        // Add separator after pick 14
        if (index === 14) {
            return `<div class="separator">
                <hr>
                <span>Non-Lottery Teams</span>
                <hr>
            </div>`;
        }
        
        return `<div class="team">
            ${index + 1}. ${team.name} (${team.record}) ${movement}
        </div>`;
    });
    
    teamList.innerHTML = listItems.join('');
}

function resetDraftOrder() {
    // Clear stored draft order
    localStorage.removeItem('draftOrder');
    
    // Clear draft process display
    const draftProcessElement = document.getElementById('draft-process');
    draftProcessElement.innerHTML = '';
    
    // Display teams in original order
    const teamList = document.getElementById('team-list');
    const listItems = teams.map((team, index) => {
        return `<div class="team">
            ${index + 1}. ${team.name} (${team.record})
        </div>`;
    });
    teamList.innerHTML = listItems.join('');
}

document.getElementById('reset-draft').addEventListener('click', resetDraftOrder);

function drawPingPongBalls() {
    // Simulate drawing 4 balls from 14, without regard to order
    const balls = Array(4).fill().map(() => Math.floor(Math.random() * 14) + 1);
    return balls.sort((a, b) => a - b); // Sort to match NBA's process
}

function createLotteryCombinations() {
    // Generate all possible combinations of 4 balls drawn from 14
    const combinations = new Set();
    while (combinations.size < 1000) {
        combinations.add(drawPingPongBalls().join(','));
    }
    return Array.from(combinations);
}

function assignCombinations(teams, combinations) {
    const odds = [140, 140, 140, 125, 105, 90, 75, 60, 45, 30, 20, 15, 10, 5];
    let assignedCombinations = 0;
    const teamCombinations = teams.map((team, index) => {
        const teamWeight = odds[index];
        const teamCombos = combinations.slice(assignedCombinations, assignedCombinations + teamWeight);
        assignedCombinations += teamWeight;
        return { team, combinations: teamCombos };
    });
    return teamCombinations;
}

function drawLottery(teamCombinations) {
    const drawnCombinations = new Set();
    const maxAttempts = 1000;
    let attempts = 0;
    const results = [];
    const selectedTeams = new Set();
    
    // Draw combinations for all 4 picks
    while (results.length < 4 && attempts < maxAttempts) {
        const combination = drawPingPongBalls().join(',');
        
        // Check if this is the unassigned combination (1001)
        if (combination === '1,2,3,4') { // This is just an example - in reality it would be a different combination
            continue;
        }
        
        const selectedTeam = teamCombinations.find(tc => tc.combinations.includes(combination));
        
        if (selectedTeam && !drawnCombinations.has(combination) && !selectedTeams.has(selectedTeam.team)) {
            drawnCombinations.add(combination);
            selectedTeams.add(selectedTeam.team);
            results.push({ team: selectedTeam.team, combination });
        }
        attempts++;
    }
    
    if (results.length < 4) {
        console.warn('Could not complete drawing after maximum attempts. Using remaining teams.');
        return teamCombinations.slice(0, 4).map(tc => ({ 
            team: tc.team, 
            combination: tc.combinations[0] 
        }));
    }
    
    return results;
}

function displayDraftProcess(results) {
    const draftProcessElement = document.getElementById('draft-process');
    
    const process = results.map((result, index) => {
        const balls = result.combination.split(',').map(n => parseInt(n));
        return `
            <div class="draft-step">
                <div class="step-number">Pick ${index + 1}</div>
                <div class="step-details">
                    <div class="balls-drawn">
                        <strong>Ping Pong Balls Drawn:</strong> ${balls.join(', ')}
                    </div>
                    <div class="team-selected">
                        <strong>Team:</strong> ${result.team.name}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    draftProcessElement.innerHTML = `
        <div class="draft-process-container">
            <h3>Draft Order Selection Process:</h3>
            <div class="lottery-info">
                <p><strong>Lottery System:</strong> 1,000 combinations assigned to teams based on their regular-season record.</p>
                <ul>
                    <li>Top 3 teams: 140 combinations each</li>
                    <li>Team 4: 125 combinations</li>
                    <li>Team 5: 105 combinations</li>
                    <li>Remaining teams: Decreasing combinations based on record</li>
                </ul>
            </div>
            <div class="draft-steps">
                ${process}
            </div>
        </div>
    `;
}

function startMockDraft() {
    const teamList = document.getElementById('team-list');
    const startButton = document.getElementById('start-draft');
    const resetButton = document.getElementById('reset-draft');

    // Reset draft order and display teams in original order
    localStorage.removeItem('draftOrder');
    const listItems = teams.map((team, index) => {
        return `<div class="team">
            ${index + 1}. ${team.name} (${team.record})
        </div>`;
    });
    teamList.innerHTML = listItems.join('');

    // Disable buttons during draft
    startButton.disabled = true;
    resetButton.disabled = true;

    teamList.style.opacity = 0; // Start fade out
    setTimeout(() => {
        // Create all possible combinations
        const combinations = createLotteryCombinations();
        // Assign combinations to teams
        const teamCombinations = assignCombinations(teams, combinations);
        // Draw the lottery
        const lotteryResults = drawLottery(teamCombinations);
        // Display the process
        displayDraftProcess(lotteryResults);
        
        // Get the lottery teams in order
        const lotteryTeams = lotteryResults.map(result => result.team);
        
        // Get all remaining teams (excluding lottery teams) in inverse order of their records
        const remainingTeams = teams
            .filter(t => !lotteryTeams.includes(t))
            .sort((a, b) => parseInt(a.record.split('-')[0]) - parseInt(b.record.split('-')[0]));
        
        // Combine lottery teams and remaining teams
        const draftOrder = lotteryTeams.concat(remainingTeams);
        
        displayTeams(draftOrder); // Display the draft order
        localStorage.setItem('draftOrder', JSON.stringify(draftOrder));

        teamList.style.opacity = 1; // Fade back in

        // Re-enable buttons after draft
        startButton.disabled = false;
        resetButton.disabled = false;
    }, 500);
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

document.getElementById('manage-mode').addEventListener('click', enterManageMode);
