// Terminal state
const state = {
  history: [],
  historyIndex: -1,
  theme: localStorage.getItem("terminal-theme") || "midnight",
  commandCount: 0,
};

// Fun vibes that rotate (changes every 8 seconds + on each command)
const vibes = [
  "building things",
  "searching for a better way",
  "caffeinated ☕",
  "in the zone",
  "thinking...",
  "exploring ideas",
  "data driven",
  "connecting data",
  "debugging work",
  "ctrl+c ctrl+v",
  "reducing 4-eye checks",
  "preventative controls",
  "sprinkling ai",
  "detecting anomalies",
  "iterating",
  "foundations in data",
  "test everything",
  "enhancing...",
  "fixing things",
  "agent supervision",
  "refactoring",
  "deep work",
  "sending fewer emails",
  "under control",
];

// Available themes
const themes = ["midnight", "contrast", "as400"];

// Commands registry
const commands = {
  help: {
    desc: "show available commands",
    fn: () => {
      const lines = [
        "",
        '  <span class="bold white">Available Commands</span>',
        "",
        '  <span class="muted">--- about ---</span>',
        '  <span class="cmd">whoami</span>        who is marc lanson',
        '  <span class="cmd">tldr</span>          ultra-short bio',
        '  <span class="cmd">projects</span>      notable projects',
        "",
        '  <span class="muted">--- content ---</span>',
        '  <span class="cmd">tools</span>         tools i use daily',
        '  <span class="cmd">blog</span>          read the blog',
        '  <span class="cmd">games</span>         play games',
        '  <span class="cmd">search [term]</span> search site content',
        "",
        '  <span class="muted">--- contact ---</span>',
        '  <span class="cmd">contact</span>       find me online',
        '  <span class="cmd">tweet</span>         tweet at me',
        "",
        '  <span class="muted">--- terminal ---</span>',
        '  <span class="cmd">theme</span>         list/change themes',
        '  <span class="cmd">clear</span>         clear the terminal',
        "",
        '  <span class="muted">tip: shift+tab to cycle themes</span>',
        "",
      ];
      return lines.join("\n");
    },
  },
  whoami: {
    desc: "who is marc lanson",
    fn: () => {
      return `
  <span class="bold white">marc lanson</span>
  <span class="bold white">financial services operations specialist</span>
  technically non-technical, but I love to code and build.

  <span class="bold white">experience:</span>
  macquarie bank, nomura, barclays, socgen, goldman sachs
  sydney, singapore, hong kong, london, tokyo
 
  <span class="bold white">expertise:</span>
  automation, regulatory compliance, financial management,
  operational risk, project management, process improvement,
  product ownership, data analytics, technology innovation,
  vendor oversight, executive leadership, governance, ai, agents

  <span class="bold white">products:</span>
  listed derivatives, otc clearing, fx, prime brokerage,
  private wealth, asset management, stock loan and borrow
`;
    },
  },
  about: {
    desc: "alias for whoami",
    fn: () => commands.whoami.fn(),
  },
  contact: {
    desc: "find me",
    fn: () => {
      return `
  <span class="bold white">contact:</span>

  • <a href="https://linkedin.com/in//marclanson/" target="_blank" rel="noopener">linkedin</a>
  • <a href="https://x.com/marclanson" target="_blank" rel="noopener">twitter/x</a>

`;
    },
  },
  social: {
    desc: "alias for contact",
    fn: () => commands.contact.fn(),
  },
  theme: {
    desc: "change theme",
    fn: (args) => {
      if (!args || args.length === 0) {
        let output = '\n  <span class="bold white">Available Themes</span>\n\n';
        themes.forEach((t) => {
          const current =
            t === state.theme ? ' <span class="muted">(current)</span>' : "";
          output += `  • <span class="cmd">${t}</span>${current}\n`;
        });
        output +=
          '\n  usage: <span class="cmd">theme [name]</span> or shift+tab to cycle\n';
        return output;
      }
      const themeName = args[0].toLowerCase();
      if (themes.includes(themeName)) {
        setTheme(themeName);
        return `\n  theme changed to <span class="accent">${themeName}</span>\n`;
      }
      return `\n  <span class="error">unknown theme: ${themeName}</span>\n  type <span class="cmd">theme</span> to see available themes.\n`;
    },
  },
  clear: {
    desc: "clear terminal",
    fn: () => {
      setTimeout(() => {
        document.getElementById("output").innerHTML = "";
      }, 10);
      return "";
    },
  },
  tools: {
    desc: "tools i use",
    fn: () => {
      return `
  <span class="bold white">tools:</span>

  • <a href="https://factory.ai" target="_blank" rel="noopener">Factory</a> <span class="accent">[droid]</span>
  • <a href="https://cursor.com/" target="_blank" rel="noopener">Cursor</a>
  • <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
`;
    },
  },
  blog: {
    desc: "read the blog",
    fn: () => {
      window.location.href = "/blog/";
      return '\n  <span class="muted">opening blog...</span>\n';
    },
  },
  sudo: {
    desc: "nice try",
    fn: () =>
      '\n  <span class="error">nice try, but you don\'t have sudo access here.</span>\n',
  },
  rm: {
    desc: "nice try",
    fn: (args) => {
      if (args && args.join(" ").includes("-rf")) {
        return '\n  <span class="error">NICE TRY! this terminal is protected.</span>\n';
      }
      return '\n  <span class="error">rm: command not available in this terminal</span>\n';
    },
  },
  exit: {
    desc: "exit terminal",
    fn: () =>
      '\n  <span class="muted">there is no escape. you\'re stuck here with me.</span>\n',
  },
  vim: {
    desc: "editor wars",
    fn: () =>
      '\n  <span class="accent">vim is great.</span> but this isn\'t that kind of terminal.\n',
  },
  emacs: {
    desc: "editor wars",
    fn: () => '\n  <span class="muted">emacs users... i see you.</span>\n',
  },
  ls: {
    desc: "list files",
    fn: () =>
      '\n  README.md  tools.md\n\n  <span class="muted">try: whoami, tools</span>\n',
  },
  cat: {
    desc: "cat file",
    fn: (args) => {
      if (!args || args.length === 0) {
        return '\n  <span class="error">cat: missing file argument</span>\n';
      }
      const file = args[0].toLowerCase();
      if (file.includes("readme")) {
        return commands.whoami.fn();
      }
      if (file.includes("investment")) {
        return '\n  <span class="error">no investments page configured</span>\n';
      }
      if (file.includes("tool")) {
        return commands.tools.fn();
      }
      return `\n  <span class="error">cat: ${args[0]}: no such file</span>\n`;
    },
  },
  cd: {
    desc: "change directory",
    fn: () => '\n  <span class="muted">you\'re already home.</span>\n',
  },
  pwd: {
    desc: "print working directory",
    fn: () => "\n  /home/marc\n",
  },
  echo: {
    desc: "echo text",
    fn: (args) => (args ? "\n  " + args.join(" ") + "\n" : "\n"),
  },
  date: {
    desc: "show date",
    fn: () => "\n  " + new Date().toString() + "\n",
  },
  neofetch: {
    desc: "system info",
    fn: () => `
  <span class="accent">       _</span>          marc@lanson
  <span class="accent">      (_)</span>         -----------
  <span class="accent">   ___ _  ___</span>     OS: Human 1.0
  <span class="accent">  / __| |/ _ \\</span>    Host: Earth
  <span class="accent">  \\__ \\ |  __/</span>    Kernel: Coffee-powered
  <span class="accent">  |___/_|\\___|</span>    Uptime: ${getAge()} years
                    Shell: bash
                    Terminal: marclanson
`,
  },
  claude: {
    desc: "ai assistant",
    fn: () => '\n  try a better cli: <a href="https://factory.ai" target="_blank" rel="noopener">droid</a>\n',
  },
  codex: {
    desc: "ai assistant",
    fn: () => commands.claude.fn(),
  },
  cal: {
    desc: "book a call",
    fn: () => '\n  <span class="muted">sorry, calls are tough for me.</span>\n  try the contact command to reach out.\n',
  },
  book: {
    desc: "alias for cal",
    fn: () => commands.cal.fn(),
  },
  tweet: {
    desc: "tweet at me",
    fn: () => {
      window.open('https://twitter.com/intent/tweet?text=@marclanson%20');
      return '\n  <span class="success">opening twitter...</span>\n';
    },
  },
  copy: {
    desc: "copy email",
    fn: async (args) => {
      await navigator.clipboard.writeText('marc.lanson@gmail.com');
      return '\n  <span class="success">copied marc.lanson@gmail.com to clipboard</span>\n';
    },
  },
  projects: {
    desc: "notable projects",
    fn: () => {
      return `
  <span class="bold white">projects:</span>

  • <a href="https://github.com/marclanson/marclanson" target="_blank" rel="noopener">this website</a> <span class="muted">terminal user interface style personal site</span> <span class="accent">[open source]</span>

`;
    },
  },
  search: {
    desc: "search site content",
    fn: (args) => {
      if (!args || args.length === 0) {
        return '\n  usage: <span class="cmd">search [term]</span>\n  example: <span class="cmd">search supabase</span>\n';
      }
      const term = args.join(' ').toLowerCase();
      const searchable = [
        { cmd: 'whoami', keywords: ['marc', 'lanson', 'non-technical'] },
        { cmd: 'tools', keywords: ['factory', 'github', 'droid', 'cursor'] },
        { cmd: 'contact', keywords: ['twitter', 'linkedin', 'github', 'email', 'social'] },
        { cmd: 'projects', keywords: ['marclanson', 'website', 'interface'] },
      ];
      const matches = searchable.filter(s => s.keywords.some(k => k.includes(term) || term.includes(k)));
      if (matches.length === 0) {
        return `\n  <span class="muted">no results for "${term}"</span>\n  try: tools, contact\n`;
      }
      let output = `\n  <span class="bold white">results for "${term}":</span>\n\n`;
      matches.forEach(m => {
        output += `  • type <span class="cmd">${m.cmd}</span>\n`;
      });
      return output;
    },
  },
  tldr: {
    desc: "ultra-short bio",
    fn: () => {
      return `
  <span class="bold white">marc lanson</span> — reengineering financial ops with ai.
  prev: 25+ years in financial services operations.
`;
    },
  },
  game: {
    desc: "list available games",
    fn: () => {
      return `
  <span class="bold white">GAMES</span>

  <span class="cmd">space</span>       space invaders
  <span class="cmd">snake</span>       classic snake
  <span class="cmd">tetris</span>      tetris

  <span class="muted">type</span> <span class="cmd">leaderboard [game]</span> <span class="muted">to see high scores</span>
`;
    },
  },
  games: {
    desc: "alias for game",
    fn: () => commands.game.fn(),
  },
  space: {
    desc: "play space invaders",
    fn: () => {
      startSpaceInvaders();
      return '';
    },
  },
  snake: {
    desc: "play snake",
    fn: () => {
      startSnakeGame();
      return '';
    },
  },
  tetris: {
    desc: "play tetris",
    fn: () => {
      startTetris();
      return '';
    },
  },
  leaderboard: {
    desc: "game high scores",
    fn: (args) => {
      const game = args && args[0] ? args[0].toLowerCase() : null;
      if (game === 'space') {
        return showLeaderboard('space-invaders', 'SPACE INVADERS');
      } else if (game === 'snake') {
        return showLeaderboard('snake', 'SNAKE');
      } else if (game === 'tetris') {
        return showLeaderboard('tetris', 'TETRIS');
      } else {
        let output = '\n  <span class="bold white">LEADERBOARDS</span>\n\n';
        output += '  <span class="cmd">leaderboard space</span>  space invaders scores\n';
        output += '  <span class="cmd">leaderboard snake</span>  snake scores\n';
        output += '  <span class="cmd">leaderboard tetris</span> tetris scores\n';
        return output;
      }
    },
  },
  scores: {
    desc: "alias for leaderboard",
    fn: (args) => commands.leaderboard.fn(args),
  },
};

// Space Invaders Game
let gameActive = false;
let gameInterval = null;
let gameState = null;

function startSpaceInvaders() {
  const terminalBody = document.getElementById("terminal-body");
  const output = document.getElementById("output");
  const inputLine = document.querySelector(".terminal-input");
  const commandInput = document.getElementById("command-input");
  
  // Hide input and save terminal content
  const savedContent = output.innerHTML;
  inputLine.style.display = "none";
  
  // Calculate game dimensions based on terminal size
  const charWidth = 8;
  const charHeight = 16;
  const width = Math.floor(terminalBody.clientWidth / charWidth) - 4;
  const height = Math.floor(terminalBody.clientHeight / charHeight) - 4;
  
  // Initialize game state
  gameState = {
    width: Math.min(width, 60),
    height: Math.min(height, 25),
    player: { x: Math.floor(Math.min(width, 60) / 2), lives: 3 },
    bullets: [],
    aliens: [],
    alienBullets: [],
    alienDirection: 1,
    alienMoveCounter: 0,
    score: 0,
    gameOver: false,
    won: false,
    enteringName: false,
    playerName: '',
    saved: false,
  };
  
  // Create aliens - fit within borders
  const alienRows = 4;
  const alienCols = Math.min(Math.floor((gameState.width - 6) / 4), 10);
  const startX = 3;
  for (let row = 0; row < alienRows; row++) {
    for (let col = 0; col < alienCols; col++) {
      gameState.aliens.push({
        x: col * 4 + startX,
        y: row * 2 + 2,
        type: row === 0 ? 2 : row === 1 ? 1 : 0,
      });
    }
  }
  
  gameActive = true;
  
  // Game key handler
  const gameKeyHandler = (e) => {
    if (!gameActive) return;
    
    if (e.key === "Escape") {
      endGame(savedContent, inputLine, gameKeyHandler);
      return;
    }
    
    if (gameState.gameOver) {
      if (gameState.enteringName) {
        e.preventDefault();
        if (e.key === "Enter" && gameState.playerName.trim()) {
          saveScore(gameState.playerName.trim(), gameState.score);
          gameState.saved = true;
          gameState.enteringName = false;
          renderGame(output);
        } else if (e.key === "Backspace") {
          gameState.playerName = gameState.playerName.slice(0, -1);
          renderGame(output);
        } else if (e.key.length === 1 && gameState.playerName.length < 10) {
          gameState.playerName += e.key;
          renderGame(output);
        }
      } else if (!gameState.saved && e.key !== "Escape") {
        gameState.enteringName = true;
        renderGame(output);
      } else if (e.key === "Enter") {
        endGame(savedContent, inputLine, gameKeyHandler);
      }
      return;
    }
    
    if (e.key === "ArrowLeft" || e.key === "a") {
      e.preventDefault();
      gameState.player.x = Math.max(1, gameState.player.x - 1);
    } else if (e.key === "ArrowRight" || e.key === "d") {
      e.preventDefault();
      gameState.player.x = Math.min(gameState.width - 2, gameState.player.x + 1);
    } else if (e.key === " " || e.key === "ArrowUp") {
      e.preventDefault();
      if (gameState.bullets.length < 3) {
        gameState.bullets.push({ x: gameState.player.x, y: gameState.height - 3 });
      }
    }
  };
  
  document.addEventListener("keydown", gameKeyHandler);
  
  // Game loop
  gameInterval = setInterval(() => {
    if (!gameActive) return;
    updateGame();
    renderGame(output);
  }, 120);
}

function updateGame() {
  if (gameState.gameOver) return;
  
  // Move bullets up
  gameState.bullets = gameState.bullets.filter(b => {
    b.y--;
    return b.y > 0;
  });
  
  // Move alien bullets down
  gameState.alienBullets = gameState.alienBullets.filter(b => {
    b.y++;
    return b.y < gameState.height - 1;
  });
  
  // Check bullet-alien collisions
  gameState.bullets.forEach((bullet, bi) => {
    gameState.aliens.forEach((alien, ai) => {
      if (Math.abs(bullet.x - alien.x) <= 1 && Math.abs(bullet.y - alien.y) <= 1) {
        gameState.bullets.splice(bi, 1);
        gameState.aliens.splice(ai, 1);
        gameState.score += (alien.type + 1) * 10;
      }
    });
  });
  
  // Check alien bullet-player collision
  gameState.alienBullets.forEach((bullet, i) => {
    if (Math.abs(bullet.x - gameState.player.x) <= 1 && bullet.y >= gameState.height - 2) {
      gameState.alienBullets.splice(i, 1);
      gameState.player.lives--;
      if (gameState.player.lives <= 0) {
        gameState.gameOver = true;
      }
    }
  });
  
  // Move aliens
  gameState.alienMoveCounter++;
  if (gameState.alienMoveCounter >= 8) {
    gameState.alienMoveCounter = 0;
    
    // Check if any alien would hit edge
    let hitEdge = false;
    gameState.aliens.forEach(alien => {
      if (alien.x + gameState.alienDirection <= 2 || alien.x + gameState.alienDirection >= gameState.width - 3) {
        hitEdge = true;
      }
    });
    
    if (hitEdge) {
      gameState.alienDirection *= -1;
      gameState.aliens.forEach(alien => {
        alien.y++;
        if (alien.y >= gameState.height - 4) {
          gameState.gameOver = true;
        }
      });
    } else {
      gameState.aliens.forEach(alien => {
        alien.x += gameState.alienDirection;
      });
    }
    
    // Random alien shooting
    if (gameState.aliens.length > 0 && Math.random() < 0.2) {
      const shooter = gameState.aliens[Math.floor(Math.random() * gameState.aliens.length)];
      gameState.alienBullets.push({ x: shooter.x, y: shooter.y + 1 });
    }
  }
  
  // Check win condition
  if (gameState.aliens.length === 0) {
    gameState.gameOver = true;
    gameState.won = true;
  }
}

function renderGame(output) {
  const g = gameState;
  let screen = [];
  
  // Initialize empty screen
  for (let y = 0; y < g.height; y++) {
    screen[y] = new Array(g.width).fill(' ');
  }
  
  // Draw borders
  for (let x = 0; x < g.width; x++) {
    screen[0][x] = '─';
    screen[g.height - 1][x] = '─';
  }
  for (let y = 0; y < g.height; y++) {
    screen[y][0] = '│';
    screen[y][g.width - 1] = '│';
  }
  screen[0][0] = '┌';
  screen[0][g.width - 1] = '┐';
  screen[g.height - 1][0] = '└';
  screen[g.height - 1][g.width - 1] = '┘';
  
  // Draw aliens - use ASCII chars for consistent width
  const alienChars = ['W', 'M', 'X'];
  g.aliens.forEach(alien => {
    if (alien.y > 0 && alien.y < g.height - 1 && alien.x > 0 && alien.x < g.width - 1) {
      screen[alien.y][alien.x] = alienChars[alien.type] || 'X';
    }
  });
  
  // Draw bullets
  g.bullets.forEach(b => {
    if (b.y > 0 && b.y < g.height - 1 && b.x > 0 && b.x < g.width - 1) {
      screen[b.y][b.x] = '│';
    }
  });
  
  // Draw alien bullets
  g.alienBullets.forEach(b => {
    if (b.y > 0 && b.y < g.height - 1 && b.x > 0 && b.x < g.width - 1) {
      screen[b.y][b.x] = '·';
    }
  });
  
  // Draw player
  if (g.player.x > 0 && g.player.x < g.width - 1) {
    screen[g.height - 2][g.player.x] = '▲';
    if (g.player.x > 1) screen[g.height - 2][g.player.x - 1] = '◄';
    if (g.player.x < g.width - 2) screen[g.height - 2][g.player.x + 1] = '►';
  }
  
  // Build output string
  let html = '<pre style="line-height: 1.2; margin: 0;">';
  html += `<span class="accent">SPACE INVADERS</span>  Score: <span class="success">${g.score}</span>  Lives: <span class="error">${'♥'.repeat(g.player.lives)}</span>\n\n`;
  
  for (let y = 0; y < g.height; y++) {
    html += screen[y].join('') + '\n';
  }
  
  html += '\n<span class="muted">← → move  SPACE shoot  ESC quit</span>';
  
  if (g.gameOver) {
    html += '\n\n';
    if (g.won) {
      html += '<span class="success">*** YOU WIN! ***</span>';
    } else {
      html += '<span class="error">*** GAME OVER ***</span>';
    }
    
    if (g.enteringName) {
      html += `\n\n<span class="bold white">Enter your name:</span> <span class="accent">${g.playerName}</span><span class="cursor">_</span>`;
      html += '\n<span class="muted">Press ENTER to save</span>';
    } else if (g.saved) {
      html += `\n\n<span class="success">Score saved!</span>`;
      html += '\n<span class="muted">Press ENTER to exit, or type</span> <span class="cmd">leaderboard</span>';
    } else {
      html += '\n<span class="muted">Press any key to save score, ESC to skip</span>';
    }
  }
  
  html += '</pre>';
  output.innerHTML = html;
}

function saveScore(name, score, game = 'space-invaders') {
  const key = `leaderboard-${game}`;
  const scores = JSON.parse(localStorage.getItem(key) || '[]');
  scores.push({ name, score, date: new Date().toISOString() });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem(key, JSON.stringify(scores.slice(0, 50)));
}

function showLeaderboard(game, title) {
  const key = `leaderboard-${game}`;
  const scores = JSON.parse(localStorage.getItem(key) || '[]');
  if (scores.length === 0) {
    return `\n  <span class="muted">no ${title.toLowerCase()} scores yet.</span>\n`;
  }
  let output = `\n  <span class="bold white">${title} LEADERBOARD</span>\n\n`;
  scores.slice(0, 10).forEach((entry, i) => {
    const medal = i === 0 ? '1.' : i === 1 ? '2.' : i === 2 ? '3.' : `${i + 1}.`;
    output += `  <span class="accent">${medal.padStart(3)}</span> ${entry.name.padEnd(10)} <span class="success">${String(entry.score).padStart(5)}</span>\n`;
  });
  return output;
}

function endGame(savedContent, inputLine, keyHandler) {
  gameActive = false;
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
  document.removeEventListener("keydown", keyHandler);
  document.getElementById("output").innerHTML = savedContent;
  inputLine.style.display = "flex";
  document.getElementById("command-input").focus();
  appendOutput('\n  <span class="muted">game ended. score: ' + (gameState?.score || 0) + '</span>\n\n');
}

// Snake Game
let snakeState = null;

function startSnakeGame() {
  const terminalBody = document.getElementById("terminal-body");
  const output = document.getElementById("output");
  const inputLine = document.querySelector(".terminal-input");
  
  const savedContent = output.innerHTML;
  inputLine.style.display = "none";
  
  const charWidth = 8;
  const charHeight = 16;
  const width = Math.floor(terminalBody.clientWidth / charWidth) - 4;
  const height = Math.floor(terminalBody.clientHeight / charHeight) - 6;
  
  snakeState = {
    width: Math.min(width, 50),
    height: Math.min(height, 20),
    snake: [{ x: Math.floor(Math.min(width, 50) / 2), y: Math.floor(Math.min(height, 20) / 2) }],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: null,
    score: 0,
    gameOver: false,
    enteringName: false,
    playerName: '',
    saved: false,
    tick: 0,
    speed: 150,
  };
  
  spawnFood();
  gameActive = true;
  
  const snakeKeyHandler = (e) => {
    if (!gameActive) return;
    
    if (e.key === "Escape") {
      endSnakeGame(savedContent, inputLine, snakeKeyHandler);
      return;
    }
    
    if (snakeState.gameOver) {
      if (snakeState.enteringName) {
        e.preventDefault();
        if (e.key === "Enter" && snakeState.playerName.trim()) {
          saveScore(snakeState.playerName.trim(), snakeState.score, 'snake');
          snakeState.saved = true;
          snakeState.enteringName = false;
          renderSnake(output);
        } else if (e.key === "Backspace") {
          snakeState.playerName = snakeState.playerName.slice(0, -1);
          renderSnake(output);
        } else if (e.key.length === 1 && snakeState.playerName.length < 10) {
          snakeState.playerName += e.key;
          renderSnake(output);
        }
      } else if (!snakeState.saved && e.key !== "Escape") {
        snakeState.enteringName = true;
        renderSnake(output);
      } else if (e.key === "Enter") {
        endSnakeGame(savedContent, inputLine, snakeKeyHandler);
      }
      return;
    }
    
    const s = snakeState;
    if ((e.key === "ArrowUp" || e.key === "w") && s.direction.y === 0) {
      e.preventDefault();
      s.nextDirection = { x: 0, y: -1 };
    } else if ((e.key === "ArrowDown" || e.key === "s") && s.direction.y === 0) {
      e.preventDefault();
      s.nextDirection = { x: 0, y: 1 };
    } else if ((e.key === "ArrowLeft" || e.key === "a") && s.direction.x === 0) {
      e.preventDefault();
      s.nextDirection = { x: -1, y: 0 };
    } else if ((e.key === "ArrowRight" || e.key === "d") && s.direction.x === 0) {
      e.preventDefault();
      s.nextDirection = { x: 1, y: 0 };
    }
  };
  
  document.addEventListener("keydown", snakeKeyHandler);
  
  function snakeLoop() {
    if (!gameActive) return;
    updateSnake();
    renderSnake(output);
    gameInterval = setTimeout(snakeLoop, snakeState.speed);
  }
  snakeLoop();
}

function spawnFood() {
  const s = snakeState;
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * (s.width - 2)) + 1,
      y: Math.floor(Math.random() * (s.height - 2)) + 1,
    };
  } while (s.snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  s.food = pos;
}

function updateSnake() {
  const s = snakeState;
  if (s.gameOver) return;
  
  s.tick++;
  
  // Vertical movement is every 2 ticks to compensate for taller chars
  const isVertical = s.nextDirection.y !== 0;
  if (isVertical && s.tick % 2 !== 0) return;
  
  s.direction = s.nextDirection;
  const head = s.snake[0];
  let newHead = { x: head.x + s.direction.x, y: head.y + s.direction.y };
  
  // Wrap through walls
  if (newHead.x <= 0) newHead.x = s.width - 2;
  if (newHead.x >= s.width - 1) newHead.x = 1;
  if (newHead.y <= 0) newHead.y = s.height - 2;
  if (newHead.y >= s.height - 1) newHead.y = 1;
  
  // Check self collision
  if (s.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
    s.gameOver = true;
    return;
  }
  
  s.snake.unshift(newHead);
  
  // Check food
  if (newHead.x === s.food.x && newHead.y === s.food.y) {
    s.score += 10;
    spawnFood();
    // Speed up! Reduce interval by 5ms per food, min 50ms
    s.speed = Math.max(50, s.speed - 5);
  } else {
    s.snake.pop();
  }
}

function renderSnake(output) {
  const s = snakeState;
  let screen = [];
  
  for (let y = 0; y < s.height; y++) {
    screen[y] = new Array(s.width).fill(' ');
  }
  
  // Draw borders
  for (let x = 0; x < s.width; x++) {
    screen[0][x] = '─';
    screen[s.height - 1][x] = '─';
  }
  for (let y = 0; y < s.height; y++) {
    screen[y][0] = '│';
    screen[y][s.width - 1] = '│';
  }
  screen[0][0] = '┌';
  screen[0][s.width - 1] = '┐';
  screen[s.height - 1][0] = '└';
  screen[s.height - 1][s.width - 1] = '┘';
  
  // Draw food
  if (s.food && s.food.y > 0 && s.food.y < s.height - 1) {
    screen[s.food.y][s.food.x] = '*';
  }
  
  // Draw snake
  s.snake.forEach((seg, i) => {
    if (seg.y > 0 && seg.y < s.height - 1 && seg.x > 0 && seg.x < s.width - 1) {
      screen[seg.y][seg.x] = i === 0 ? '@' : 'o';
    }
  });
  
  let html = '<pre style="line-height: 1.2; margin: 0;">';
  html += `<span class="accent">SNAKE</span>  Score: <span class="success">${s.score}</span>  Length: ${s.snake.length}\n\n`;
  
  for (let y = 0; y < s.height; y++) {
    html += screen[y].join('') + '\n';
  }
  
  html += '\n<span class="muted">WASD/Arrows to move  ESC quit</span>';
  
  if (s.gameOver) {
    html += '\n\n<span class="error">*** GAME OVER ***</span>';
    
    if (s.enteringName) {
      html += `\n\n<span class="bold white">Enter your name:</span> <span class="accent">${s.playerName}</span><span class="cursor">_</span>`;
      html += '\n<span class="muted">Press ENTER to save</span>';
    } else if (s.saved) {
      html += `\n\n<span class="success">Score saved!</span>`;
      html += '\n<span class="muted">Press ENTER to exit</span>';
    } else {
      html += '\n<span class="muted">Press any key to save score, ESC to skip</span>';
    }
  }
  
  html += '</pre>';
  output.innerHTML = html;
}

function endSnakeGame(savedContent, inputLine, keyHandler) {
  gameActive = false;
  if (gameInterval) {
    clearTimeout(gameInterval);
    gameInterval = null;
  }
  document.removeEventListener("keydown", keyHandler);
  document.getElementById("output").innerHTML = savedContent;
  inputLine.style.display = "flex";
  document.getElementById("command-input").focus();
  appendOutput('\n  <span class="muted">game ended. score: ' + (snakeState?.score || 0) + '</span>\n\n');
}

// Tetris Game
let tetrisState = null;

const TETRIS_PIECES = [
  { shape: [[1,1,1,1]], color: 'I' },           // I
  { shape: [[1,1],[1,1]], color: 'O' },         // O
  { shape: [[0,1,0],[1,1,1]], color: 'T' },     // T
  { shape: [[1,0,0],[1,1,1]], color: 'L' },     // L
  { shape: [[0,0,1],[1,1,1]], color: 'J' },     // J
  { shape: [[0,1,1],[1,1,0]], color: 'S' },     // S
  { shape: [[1,1,0],[0,1,1]], color: 'Z' },     // Z
];

function startTetris() {
  const terminalBody = document.getElementById("terminal-body");
  const output = document.getElementById("output");
  const inputLine = document.querySelector(".terminal-input");
  
  const savedContent = output.innerHTML;
  inputLine.style.display = "none";
  
  tetrisState = {
    width: 10,
    height: 20,
    board: Array(20).fill(null).map(() => Array(10).fill(0)),
    piece: null,
    pieceX: 0,
    pieceY: 0,
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    enteringName: false,
    playerName: '',
    saved: false,
    speed: 500,
  };
  
  spawnTetrisPiece();
  gameActive = true;
  
  const tetrisKeyHandler = (e) => {
    if (!gameActive) return;
    
    if (e.key === "Escape") {
      endTetris(savedContent, inputLine, tetrisKeyHandler);
      return;
    }
    
    if (tetrisState.gameOver) {
      if (tetrisState.enteringName) {
        e.preventDefault();
        if (e.key === "Enter" && tetrisState.playerName.trim()) {
          saveScore(tetrisState.playerName.trim(), tetrisState.score, 'tetris');
          tetrisState.saved = true;
          tetrisState.enteringName = false;
          renderTetris(output);
        } else if (e.key === "Backspace") {
          tetrisState.playerName = tetrisState.playerName.slice(0, -1);
          renderTetris(output);
        } else if (e.key.length === 1 && tetrisState.playerName.length < 10) {
          tetrisState.playerName += e.key;
          renderTetris(output);
        }
      } else if (!tetrisState.saved && e.key !== "Escape") {
        tetrisState.enteringName = true;
        renderTetris(output);
      } else if (e.key === "Enter") {
        endTetris(savedContent, inputLine, tetrisKeyHandler);
      }
      return;
    }
    
    const t = tetrisState;
    if (e.key === "ArrowLeft" || e.key === "a") {
      e.preventDefault();
      if (canMove(t.piece, t.pieceX - 1, t.pieceY)) t.pieceX--;
    } else if (e.key === "ArrowRight" || e.key === "d") {
      e.preventDefault();
      if (canMove(t.piece, t.pieceX + 1, t.pieceY)) t.pieceX++;
    } else if (e.key === "ArrowDown" || e.key === "s") {
      e.preventDefault();
      if (canMove(t.piece, t.pieceX, t.pieceY + 1)) {
        t.pieceY++;
        t.score += 1;
      }
    } else if (e.key === "ArrowUp" || e.key === "w") {
      e.preventDefault();
      const rotated = rotatePiece(t.piece);
      if (canMove(rotated, t.pieceX, t.pieceY)) t.piece = rotated;
    } else if (e.key === " ") {
      e.preventDefault();
      while (canMove(t.piece, t.pieceX, t.pieceY + 1)) {
        t.pieceY++;
        t.score += 2;
      }
    }
    renderTetris(output);
  };
  
  document.addEventListener("keydown", tetrisKeyHandler);
  
  function tetrisLoop() {
    if (!gameActive || tetrisState.gameOver) return;
    updateTetris();
    renderTetris(output);
    gameInterval = setTimeout(tetrisLoop, tetrisState.speed);
  }
  tetrisLoop();
}

function spawnTetrisPiece() {
  const t = tetrisState;
  const piece = TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)];
  t.piece = piece.shape.map(row => [...row]);
  t.pieceX = Math.floor((t.width - t.piece[0].length) / 2);
  t.pieceY = 0;
  
  if (!canMove(t.piece, t.pieceX, t.pieceY)) {
    t.gameOver = true;
  }
}

function canMove(piece, x, y) {
  const t = tetrisState;
  for (let py = 0; py < piece.length; py++) {
    for (let px = 0; px < piece[py].length; px++) {
      if (piece[py][px]) {
        const newX = x + px;
        const newY = y + py;
        if (newX < 0 || newX >= t.width || newY >= t.height) return false;
        if (newY >= 0 && t.board[newY][newX]) return false;
      }
    }
  }
  return true;
}

function rotatePiece(piece) {
  const rows = piece.length;
  const cols = piece[0].length;
  const rotated = [];
  for (let c = 0; c < cols; c++) {
    rotated[c] = [];
    for (let r = rows - 1; r >= 0; r--) {
      rotated[c].push(piece[r][c]);
    }
  }
  return rotated;
}

function lockPiece() {
  const t = tetrisState;
  for (let py = 0; py < t.piece.length; py++) {
    for (let px = 0; px < t.piece[py].length; px++) {
      if (t.piece[py][px]) {
        const boardY = t.pieceY + py;
        const boardX = t.pieceX + px;
        if (boardY >= 0) t.board[boardY][boardX] = 1;
      }
    }
  }
  clearLines();
  spawnTetrisPiece();
}

function clearLines() {
  const t = tetrisState;
  let cleared = 0;
  for (let y = t.height - 1; y >= 0; y--) {
    if (t.board[y].every(cell => cell)) {
      t.board.splice(y, 1);
      t.board.unshift(Array(t.width).fill(0));
      cleared++;
      y++;
    }
  }
  if (cleared > 0) {
    const points = [0, 100, 300, 500, 800];
    t.score += points[cleared] * t.level;
    t.lines += cleared;
    t.level = Math.floor(t.lines / 10) + 1;
    t.speed = Math.max(100, 500 - (t.level - 1) * 50);
  }
}

function updateTetris() {
  const t = tetrisState;
  if (t.gameOver) return;
  
  if (canMove(t.piece, t.pieceX, t.pieceY + 1)) {
    t.pieceY++;
  } else {
    lockPiece();
  }
}

function renderTetris(output) {
  const t = tetrisState;
  let screen = t.board.map(row => [...row]);
  
  // Draw current piece
  if (t.piece && !t.gameOver) {
    for (let py = 0; py < t.piece.length; py++) {
      for (let px = 0; px < t.piece[py].length; px++) {
        if (t.piece[py][px]) {
          const y = t.pieceY + py;
          const x = t.pieceX + px;
          if (y >= 0 && y < t.height && x >= 0 && x < t.width) {
            screen[y][x] = 2;
          }
        }
      }
    }
  }
  
  let html = '<pre style="line-height: 1.2; margin: 0;">';
  html += `<span class="accent">TETRIS</span>  Score: <span class="success">${t.score}</span>  Lines: ${t.lines}  Level: ${t.level}\n\n`;
  
  // Top border
  html += '┌' + '──'.repeat(t.width) + '┐\n';
  
  for (let y = 0; y < t.height; y++) {
    html += '│';
    for (let x = 0; x < t.width; x++) {
      if (screen[y][x] === 2) {
        html += '[]';
      } else if (screen[y][x] === 1) {
        html += '##';
      } else {
        html += '  ';
      }
    }
    html += '│\n';
  }
  
  // Bottom border
  html += '└' + '──'.repeat(t.width) + '┘\n';
  
  html += '\n<span class="muted">← → move  ↑ rotate  ↓ soft drop  SPACE hard drop  ESC quit</span>';
  
  if (t.gameOver) {
    html += '\n\n<span class="error">*** GAME OVER ***</span>';
    
    if (t.enteringName) {
      html += `\n\n<span class="bold white">Enter your name:</span> <span class="accent">${t.playerName}</span><span class="cursor">_</span>`;
      html += '\n<span class="muted">Press ENTER to save</span>';
    } else if (t.saved) {
      html += `\n\n<span class="success">Score saved!</span>`;
      html += '\n<span class="muted">Press ENTER to exit</span>';
    } else {
      html += '\n<span class="muted">Press any key to save score, ESC to skip</span>';
    }
  }
  
  html += '</pre>';
  output.innerHTML = html;
}

function endTetris(savedContent, inputLine, keyHandler) {
  gameActive = false;
  if (gameInterval) {
    clearTimeout(gameInterval);
    gameInterval = null;
  }
  document.removeEventListener("keydown", keyHandler);
  document.getElementById("output").innerHTML = savedContent;
  inputLine.style.display = "flex";
  document.getElementById("command-input").focus();
  appendOutput('\n  <span class="muted">game ended. score: ' + (tetrisState?.score || 0) + '</span>\n\n');
}

function getAge() {
  const birth = new Date(1990, 7, 21);
  const now = new Date();
  return Math.floor((now - birth) / (365.25 * 24 * 60 * 60 * 1000));
}

function clearLastLine() {
  const output = document.getElementById("output");
  const lines = output.innerHTML.split("\n");
  lines.pop();
  lines.pop();
  output.innerHTML = lines.join("\n");
}

function appendOutput(text) {
  const output = document.getElementById("output");
  output.innerHTML += text;
  scrollToBottom();
}

function scrollToBottom() {
  const terminal = document.getElementById("terminal-body");
  terminal.scrollTop = terminal.scrollHeight;
}

function setTheme(themeName) {
  document.body.className = `theme-${themeName}`;
  state.theme = themeName;
  localStorage.setItem("terminal-theme", themeName);
}

function cycleTheme() {
  const currentIndex = themes.indexOf(state.theme);
  const nextIndex = (currentIndex + 1) % themes.length;
  setTheme(themes[nextIndex]);
  appendOutput(
    `\n  <span class="muted">theme: ${themes[nextIndex]}</span>\n\n`,
  );
  scrollToBottom();
}

function updateUKTime() {
  const timeEl = document.getElementById("status-time");
  if (timeEl) {
    const sydTime = new Date().toLocaleTimeString("en-AU", {
      timeZone: "Australia/Sydney",
      hour: "2-digit",
      minute: "2-digit",
    });
    timeEl.textContent = sydTime + " SYD";
  }
}

function updateVibe() {
  const vibeEl = document.getElementById("status-vibe");
  if (vibeEl) {
    const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];
    vibeEl.textContent = randomVibe;
  }
}

async function executeCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return;

  state.history.push(trimmed);
  state.historyIndex = state.history.length;
  state.commandCount++;

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Command text in orange
  appendOutput(
    `<span class="prompt">∴</span> <span class="accent">${escapeHtml(trimmed)}</span>\n`,
  );

  if (commands[cmd]) {
    const result = await commands[cmd].fn(args);
    if (result) {
      appendOutput(result + "\n");
    }
  } else {
    appendOutput(
      `\n  <span class="error">command not found: ${cmd}</span>\n  type <span class="cmd">help</span> for available commands.\n\n`,
    );
  }

  scrollToBottom();
  updateVibe();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getCompletions(partial) {
  const cmdNames = Object.keys(commands);
  return cmdNames.filter((c) => c.startsWith(partial.toLowerCase()));
}

async function fetchLatestPR() {
  try {
    const res = await fetch('https://api.github.com/repos/marclanson/marclanson/pulls?state=closed&sort=updated&direction=desc&per_page=1');
    const prs = await res.json();
    const merged = prs.find(pr => pr.merged_at);
    if (merged) {
      return { number: merged.number, title: merged.title, merged_at: merged.merged_at };
    }
  } catch (e) {}
  return null;
}

async function boot() {
  const output = document.getElementById("output");
  const lines = [
    "initializing terminal...",
    "loading modules... done",
    "connecting to marc.lanson... connected",
  ];

  for (const line of lines) {
    output.innerHTML += `<span class="muted">${line}</span>\n`;
    await sleep(150);
    scrollToBottom();
  }

  const latestPR = await fetchLatestPR();
  const lastSeenPR = localStorage.getItem('last-seen-pr');
  if (latestPR && latestPR.number.toString() !== lastSeenPR) {
    output.innerHTML += `<span class="success">downloading update... ${latestPR.title}</span>\n`;
    localStorage.setItem('last-seen-pr', latestPR.number.toString());
    await sleep(300);
    scrollToBottom();
  }
  output.innerHTML += '\n';

  output.innerHTML += '<span class="accent ascii-art">███╗   ███╗  █████╗  ██████╗   ██████╗ \n' +
    '████╗ ████║ ██╔══██╗ ██╔══██╗ ██╔════╝ \n' +
    '██╔████╔██║ ███████║ ██████╔╝ ██║      \n' +
    '██║╚██╔╝██║ ██╔══██║ ██╔══██║ ██║      \n' +
    '██║ ╚═╝ ██║ ██║  ██║ ██║  ██║ ╚██████╗ \n' +
    '╚═╝     ╚═╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝  ╚═════╝ \n\n' +
    '██╗      █████╗  ███╗   ██╗ ███████╗  ██████╗  ███╗   ██╗\n' +
    '██║     ██╔══██╗ ████╗  ██║ ██╔════╝ ██╔═══██╗ ████╗  ██║\n' +
    '██║     ███████║ ██╔██╗ ██║ ███████╗ ██║   ██║ ██╔██╗ ██║\n' +
    '██║     ██╔══██║ ██║╚██╗██║ ╚════██║ ██║   ██║ ██║╚██╗██║\n' +
    '███████╗██║  ██║ ██║ ╚████║ ███████║ ╚██████╔╝ ██║ ╚████║\n' +
    '╚══════╝╚═╝  ╚═╝ ╚═╝  ╚═══╝ ╚══════╝  ╚═════╝  ╚═╝  ╚═══╝</span>\n';
  await sleep(100);

  output.innerHTML += `
  financial operations. automation. ai.
  welcome to my website interface. type <span class="cmd">help</span> to see commands.

`;
  scrollToBottom();

  document.getElementById("command-input").focus();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("command-input");
  const form = document.getElementById("command-form");

  setTheme(state.theme);
  updateUKTime();
  updateVibe();
  setInterval(updateUKTime, 1000);
  setInterval(updateVibe, 8000); // Change vibe every 8 seconds

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const value = input.value;
    input.value = "";
    await executeCommand(value);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (state.historyIndex > 0) {
        state.historyIndex--;
        input.value = state.history[state.historyIndex] || "";
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        input.value = state.history[state.historyIndex] || "";
      } else {
        state.historyIndex = state.history.length;
        input.value = "";
      }
    } else if (e.shiftKey && e.key === "Tab") {
      e.preventDefault();
      cycleTheme();
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const value = input.value.trim();
      if (value) {
        const completions = getCompletions(value);
        if (completions.length === 1) {
          input.value = completions[0] + " ";
        } else if (completions.length > 1) {
          appendOutput(
            `<span class="prompt">∴</span> <span class="accent">${value}</span>\n`,
          );
          appendOutput(
            `<span class="muted">${completions.join("  ")}</span>\n\n`,
          );
          scrollToBottom();
        }
      }
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      document.getElementById("output").innerHTML = "";
    } else if (e.ctrlKey && e.key === "c") {
      e.preventDefault();
      appendOutput(
        `<span class="prompt">∴</span> <span class="accent">${input.value}</span>^C\n\n`,
      );
      input.value = "";
    }
  });

  document.getElementById("terminal").addEventListener("click", (e) => {
    if (e.target.tagName !== "A" && !e.target.closest(".cmd-shortcut")) {
      input.focus();
    }
  });

  document.querySelectorAll(".cmd-shortcut").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const cmd = btn.dataset.cmd;
      if (cmd) {
        await executeCommand(cmd);
        input.focus();
      }
    });
  });

  document.getElementById("help-btn")?.addEventListener("click", async () => {
    await executeCommand("help");
  });

  boot();
});
