const teams = [
    { name: "Cleveland Cavaliers", record: "64-18" },
    { name: "Boston Celtics", record: "61-21" },
    { name: "New York Knicks", record: "51-31" },
    { name: "Indiana Pacers", record: "50-32" },
    { name: "Milwaukee Bucks", record: "48-34" },
    { name: "Detroit Pistons", record: "44-38" },
    { name: "Orlando Magic", record: "41-41" },
    { name: "Atlanta Hawks", record: "40-42" },
    { name: "Chicago Bulls", record: "39-43" },
    { name: "Miami Heat", record: "37-45" },
    { name: "Toronto Raptors", record: "30-52" },
    { name: "Brooklyn Nets", record: "26-56" },
    { name: "Philadelphia 76ers", record: "24-58" },
    { name: "Charlotte Hornets", record: "19-63" },
    { name: "Washington Wizards", record: "18-64" },
    { name: "Oklahoma City Thunder", record: "68-14" },
    { name: "Houston Rockets", record: "52-30" },
    { name: "Los Angeles Lakers", record: "50-32" },
    { name: "LA Clippers", record: "50-32" },
    { name: "Denver Nuggets", record: "50-32" },
    { name: "Golden State Warriors", record: "48-34" },
    { name: "Memphis Grizzlies", record: "48-34" },
    { name: "Minnesota Timberwolves", record: "49-33" },
    { name: "Sacramento Kings", record: "40-42" },
    { name: "Dallas Mavericks", record: "39-43" },
    { name: "Phoenix Suns", record: "36-46" },
    { name: "Portland Trail Blazers", record: "36-46" },
    { name: "San Antonio Spurs", record: "34-48" },
    { name: "New Orleans Pelicans", record: "21-61" },
    { name: "Utah Jazz", record: "17-65" }
];

// Load records from localStorage if present, else use hardcoded teams
function loadTeamRecords() {
    const storedRecords = localStorage.getItem('teamRecords');
    if (storedRecords) {
        const parsedRecords = JSON.parse(storedRecords);
        if (Array.isArray(parsedRecords)) {
            parsedRecords.forEach(record => {
                const team = teams.find(t => t.name === record.name);
                if (team) {
                    team.record = record.record;
                }
            });
        }
    }
    // Always sync both teamRecords and draftOrder to latest teams
    localStorage.setItem('teamRecords', JSON.stringify(teams));
    localStorage.setItem('draftOrder', JSON.stringify(teams));
    console.log('Synced teamRecords and draftOrder:', teams);
}

// Sort teams by record if desired:
// Uncomment one of the following lines to change display order:
// 1. Worst-to-best (lottery style):
teams.sort((a, b) => {
    const [aWins, aLosses] = a.record.split('-').map(Number);
    const [bWins, bLosses] = b.record.split('-').map(Number);
    return bLosses - aLosses || aWins - bWins;
});
// 2. Best-to-worst:
// teams.sort((a, b) => {
//     const [aWins, aLosses] = a.record.split('-').map(Number);
//     const [bWins, bLosses] = b.record.split('-').map(Number);
//     return bWins - aWins || aLosses - bLosses;
// });
// 3. Franchise/original order (default): do not sort

// Always display from the current sorted teams array
function displayTeams(draftOrder) {
    const teamList = document.getElementById('team-list');
    const originalOrder = teams;
    const list = draftOrder || teams;
    const listItems = list.map((team, index) => {
        // Only show movement for lottery teams (top 14 picks)
        let movement = '';
        if (index < 14) {
            const originalIndex = originalOrder.findIndex(t => t.name === team.name);
            const rankChange = originalIndex - index;
            if (rankChange > 0) {
                movement = `<span class="up">↑</span> ${rankChange}`;
            } else if (rankChange < 0) {
                movement = `<span class="down">↓</span> ${Math.abs(rankChange)}`;
            }
        }
        // Add separator after pick 14 and show team 15
        if (index === 14) {
            return `<div class="separator">
                <hr>
                <span>Non-Lottery Teams</span>
                <hr>
            </div>\n<div class=\"team\">${index + 1}. ${team.name} (${team.record}) ${movement}</div>`;
        }
        return `<div class="team">${index + 1}. ${team.name} (${team.record}) ${movement}</div>`;
    });
    teamList.innerHTML = listItems.join('');
}

loadTeamRecords();
displayTeams();

// Update Manage Mode and Reset Draft Order to always use and sync the latest teams
function resetDraftOrder() {
    localStorage.setItem('draftOrder', JSON.stringify(teams));
    localStorage.setItem('teamRecords', JSON.stringify(teams));
    displayTeams();
    console.log('Draft order and records reset');
}
document.getElementById('reset-draft').addEventListener('click', resetDraftOrder);

// Update saveTeamRecords to always sync both
function saveTeamRecords() {
    localStorage.setItem('teamRecords', JSON.stringify(teams));
    localStorage.setItem('draftOrder', JSON.stringify(teams));
    displayTeams();
    console.log('Saved and synced records');
}

// Update Manage Mode to use the current teams array
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
document.getElementById('manage-mode').addEventListener('click', enterManageMode);

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
    try {
        localStorage.removeItem('draftOrder');
        console.log('localStorage cleared');
    } catch (e) {
        console.error('localStorage error:', e);
    }
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
        try {
            localStorage.setItem('draftOrder', JSON.stringify(draftOrder));
            console.log('localStorage updated:', localStorage.getItem('draftOrder'));
        } catch (e) {
            console.error('localStorage error:', e);
        }

        teamList.style.opacity = 1; // Fade back in

        // Re-enable buttons after draft
        startButton.disabled = false;
        resetButton.disabled = false;
    }, 500);
}

document.getElementById('start-draft').addEventListener('click', startMockDraft);
