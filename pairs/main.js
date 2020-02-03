const colors = [
    'red',
    'green',
    'blue',
    'cyan',
    'black',
    'brown',
    'orange',
    'pink',
    'white',
    'blueviolet',
    'aqua',
    'darkgreen',
    'olive',
    'teal',
    'silver',
    'rosybrown',
    'navy',
    'wheat',
];

const game = {
    gameEngine: undefined,
    init: (user, gameEngine) => {
        game.gameEngine = gameEngine;
        game.gameEngine.init();
    },
};

const gameEngine = {
    lastClickedTile: undefined, // Clicked first Tile
    lastClickedTileHTML: undefined, // Clicked first Tile HTML Element Reference
    matchingMode: false, // Mode to check when
    currentLevelMoves: 0,
    currentLevel: 1,
    maxLevel: 3,
    gameGrid: undefined,
    reset: () => {
        gameEngine.lastClickedTile = undefined;
        gameEngine.lastClickedTileHTML = undefined;
        gameEngine.matchingMode = undefined;
        gameEngine.currentLevelMoves = 0;
        gameEngine.currentLevel = 1;
        gameEngine.maxLevel = 3;
    },
    init: () => {
        gameEngine.reset();
        gameEngine.startLevel(1);
    },
    startLevel: level => {
        let startingLevel = level || gameEngine.currentLevel;
        gameEngine.renderLevel(startingLevel);
    },
    renderLevel: level => {
        gameEngine.gameGrid = gameEngine.prepareGridForLevel(level);
        gameEngine.renderGrid(gameEngine.gameGrid);
        gameEngine.renderLevelNotifier(level);
    },
    prepareGridForLevel: level => {
        // Grid starts with level multiplier
        // Level 1 = 2*2 ==== colors required 4/2 = 2
        // Level 2 = 4*4 ==== colors required 16/2 = 8
        // Level 3 = 6*6 ==== colors required 36/2 = 18
        let numberOfGrids = level * 2;
        let numberOfColorRequired = (numberOfGrids * numberOfGrids) / 2;
        // colors that we will use for tiles
        let colorsForLevel = colors.slice(0, numberOfColorRequired);
        let colorForTiles = colorsForLevel.concat(colorsForLevel);

        let gameGrid = [];

        let i = 0;
        let j = 0;

        for (i = 0; i < numberOfGrids; i++) {
            let gameTilesRow = [];
            for (j = 0; j < numberOfGrids; j++) {
                let randomIndex = Math.floor(
                    Math.random() * colorForTiles.length
                );
                let colorForCurrentTile = colorForTiles[randomIndex];
                colorForTiles.splice(randomIndex, 1);
                let tile = gameEngine.prepareTile(i, j, colorForCurrentTile);
                gameTilesRow.push(tile);
            }
            gameGrid.push(gameTilesRow);
        }

        return gameGrid;
    },
    prepareTile: (i, j, revealColor) => {
        return {
            originalColor: 'yellow',
            revealColor: revealColor,
            row: i,
            column: j,
            memorised: false,
        };
    },
    renderGrid: gameGrid => {
        let gameGridContainer = document.getElementById('gameGrid');
        for (let i = 0; i < gameGrid.length; i++) {
            let tileRowHTML = document.createElement('div');
            for (let j = 0; j < gameGrid[i].length; j++) {
                let tile = gameGrid[i][j];
                let tileHTML = gameEngine.prepareTileHTML(tile);
                tileRowHTML.appendChild(tileHTML);
            }
            gameGridContainer.appendChild(tileRowHTML);
        }
    },
    prepareTileHTML: tile => {
        let tileHTML = document.createElement('span');
        let tileClassAttribute = document.createAttribute('class');
        tileClassAttribute.value = 'tile';
        tileHTML.setAttributeNode(tileClassAttribute);
        tileHTML.addEventListener('click', function onClick() {
            let titleHTMLElem = this;
            gameEngine.decide(tile, titleHTMLElem);
        });
        return tileHTML;
    },
    renderLevelNotifier: level => {
        let levelNotifierElem = document.getElementById('levelNotifier');
        let levelTextElem = document.createTextNode(`Level ${level}`);
        levelNotifierElem.appendChild(levelTextElem);
    },
    decide: (tile, tileHTMLElem) => {
        if (tile.memorised) {
            // if the tile is memorised we return immediately
            return;
        }

        // method to reveal current clicked tile color
        let revealTileColor = () => {
            tileHTMLElem.style.backgroundColor = tile.revealColor;
        };

        if (gameEngine.matchingMode) {
            revealTileColor();
        } else {
            // both tiles are revealed and timer isn't over yet
            if (gameEngine.lastClickedTile) {
                return;
            } else {
                revealTileColor();
            }
        }

        if (gameEngine.lastClickedTile) {
            // if the lastClickedTile and currentTile are equal in colour we need to mark the tiles as marked memorised otherwise we need to
            // hide them
            if (tile.revealColor === gameEngine.lastClickedTile.revealColor) {
                tile.memorised = true;
                gameEngine.lastClickedTile.memorised = true;
            } else {
                tile.memorised = false;
                gameEngine.lastClickedTile.memorised = false;
                let lastTileClickedHTMl = gameEngine.lastClickedTileHTML;
                setTimeout(() => {
                    lastTileClickedHTMl.style.backgroundColor = 'yellow';
                    tileHTMLElem.style.backgroundColor = 'yellow';
                }, 500);
            }
            gameEngine.lastClickedTile = undefined;
            gameEngine.lastClickedTileHTML = undefined;
            matchingMode = false;
            gameEngine.currentLevelMoves++;
        } else {
            gameEngine.lastClickedTile = tile;
            gameEngine.lastClickedTileHTML = tileHTMLElem;
            gameEngine.matchingMode = true;
        }
    },
    nextLevel: () => {},
};

(function init() {
    gameEngine.init();
})();
