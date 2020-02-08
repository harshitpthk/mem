const game = (function gameCreator() {
    let _isRevealMode = false;
    let _isTilesDisabled = true;
    let _wrongRevealColor = 'red';

    function _enableTiles() {
        const tiles = document.getElementsByClassName('tile');
        for (tile of tiles) {
            tile.classList.remove('disabled');
        }
        _isTilesDisabled = false;
    }

    function _disableTiles() {
        const tiles = document.getElementsByClassName('tile');
        for (tile of tiles) {
            tile.classList.add('disabled');
        }
        _isTilesDisabled = true;
    }

    function _prepareTile(i, j, memorised) {
        return {
            originalColor: 'yellow',
            revealColor: 'green',
            row: i,
            column: j,
            memorised: memorised,
        };
    }

    function _createPositionMap(levelDimension) {
        let positionsMap = [];
        for (let i = 0; i < levelDimension; i++) {
            for (let j = 0; j < levelDimension; j++) {
                positionsMap.push(`${i}-${j}`);
            }
        }
        return positionsMap;
    }

    function _createGridForLevel(level) {
        // _levelDimension is 1 more than the current level
        let _levelDimension = level + 1;

        // initialise tileMemoryMap also
        let numberofTilesToBeMemorised = Math.floor(
            (_levelDimension * _levelDimension) / 2
        );

        let positionsMap = _createPositionMap(_levelDimension);
        let toBeMemorisedPositionMap = {};

        for (let k = 0; k < numberofTilesToBeMemorised; k++) {
            let randomIndex = Math.floor(Math.random() * positionsMap.length);
            toBeMemorisedPositionMap[positionsMap[randomIndex]] = true;
            positionsMap.splice(randomIndex, 1);
        }

        // [[{0,0},{0,1}], [{1,0},{1,1}]]
        let grid = [];

        for (let i = 0; i < _levelDimension; i++) {
            let tileRow = [];
            for (let j = 0; j < _levelDimension; j++) {
                let tileToBeMemorised = false;
                if (toBeMemorisedPositionMap[`${i}-${j}`]) {
                    tileToBeMemorised = true;
                }
                let tile = _prepareTile(i, j, tileToBeMemorised);
                tileRow.push(tile);
            }
            grid.push(tileRow);
        }

        return {
            grid: grid,
            toBeMemorisedPositionMap: toBeMemorisedPositionMap,
        };
    }

    function _createTileRowHTML() {
        let rowHTML = document.createElement('div');
        rowHTML.classList.add('tileRow');
        return rowHTML;
    }

    function _createTileHTML(tile) {
        let tileHTML = document.createElement('span');
        tileHTML.classList.add('tile');
        tileHTML.id = `${tile.row}-${tile.column}`;
        return tileHTML;
    }

    function _getDisplayTimeForLevel(level) {
        const displayTime = 800 + (level - 1) * 200;
        return displayTime;
    }

    function _markTile(event) {
        const tileId = event.target.id;
        // only proceed if the click is on tile inside the grid container
        if (tileId && event.target.classList.contains('tile')) {
            const tilePosition = tileId.split('-');
            const tile = publicAPI.gameGrid[tilePosition[0]][tilePosition[1]];
            if (publicAPI.clickedTiles[`${tile.row}-${tile.column}`] != tile) {
                publicAPI.clickedTiles[`${tile.row}-${tile.column}`] = tile;
            } else {
                return false;
            }
            if (publicAPI.toBeMemorisedPositionMap[tileId]) {
                // raise event for tile clicked
                tile.memorised = true;
                const tileHTML = document.getElementById(tileId);
                tileHTML.style.backgroundColor = tile.revealColor;
            } else {
                const tileHTML = document.getElementById(tileId);
                tileHTML.style.backgroundColor = _wrongRevealColor;
            }
            return true;
        }
    }

    function _showNextLevelButton() {
        const nextLevelButton = document.getElementById(`nextLevelButton`);
        nextLevelButton.classList.remove('hidden');
    }

    function _hideNextLevelButton() {
        const nextLevelButton = document.getElementById(`nextLevelButton`);
        nextLevelButton.classList.add('hidden');
    }

    function _showStartButton() {
        const startLevelButton = document.getElementById('startLevelButton');
        startLevelButton.classList.remove('hidden');
    }

    function _hideStartButton() {
        const startLevelButton = document.getElementById('startLevelButton');
        startLevelButton.classList.add('hidden');
    }

    function _renderLevelNotifier(level) {
        let levelNotifierElem = document.getElementById('levelNotifier');
        let levelTextElem = document.createTextNode(`Level ${level}`);
        levelNotifierElem.appendChild(levelTextElem);
    }

    function _clearLevelNotifier() {
        let levelNotifierElem = document.getElementById('levelNotifier');
        levelNotifierElem.innerHTML = '';
    }

    function _decide(gameGridContainer) {
        if (publicAPI.totalClicksForCurrentLevel !== 0) {
            return;
        }
        for (clickedTile in publicAPI.clickedTiles) {
            if (!publicAPI.toBeMemorisedPositionMap[clickedTile]) {
                // mistakes were made, show confirmation dialog
                setTimeout(() => {
                    const restartLevel = confirm('Game Over, Restart Level?');
                    if (restartLevel) {
                        // Restart Level
                        publicAPI.restartLevel(
                            publicAPI.currentLevel,
                            gameGridContainer
                        );
                    } else {
                        // Stop show score etc.
                    }
                }, 200);
                return;
            }
        }
        _hideStartButton();
        // show next level button as the game was finished
        _showNextLevelButton();
    }

    function _addEventHandlers(gameGridContainer) {
        document
            .getElementById('startLevelButton')
            .addEventListener('click', () => publicAPI.revealTiles());
        const nextLevelButton = document.getElementById(`nextLevelButton`);
        nextLevelButton.addEventListener('click', () => {
            publicAPI.nextLevel(gameGridContainer);
            _hideNextLevelButton();
        });
        gameGridContainer.addEventListener(
            'click',
            publicAPI.handleUserClicks(gameGridContainer)
        );
    }

    const publicAPI = {
        currentLevel: 0,
        gameGrid: [],
        toBeMemorisedPositionMap: {},
        clickedTiles: {},
        totalClicksForCurrentLevel: 0,
        reset: gameGridContainer => {
            publicAPI.gameGrid = [];
            publicAPI.toBeMemorisedPositionMap = {};
            publicAPI.clickedTiles = {};
            publicAPI.totalClicksForCurrentLevel = 0;
            gameGridContainer.innerHTML = '';
            _clearLevelNotifier();
        },
        init: (gameGridContainer, level) => {
            publicAPI.currentLevel = level || 1;
            _addEventHandlers(gameGridContainer);
            publicAPI.reset(gameGridContainer);
            publicAPI.startGameForLevel(
                publicAPI.currentLevel,
                gameGridContainer
            );
        },
        startGameForLevel: (level, gameGridContainer) => {
            const { grid, toBeMemorisedPositionMap } = _createGridForLevel(
                level
            );
            publicAPI.gameGrid = grid;
            publicAPI.toBeMemorisedPositionMap = toBeMemorisedPositionMap;
            publicAPI.setTotalClicksForLevel(level);
            publicAPI.renderGridForLevel(gameGridContainer);
            _renderLevelNotifier(level);
            _disableTiles();
        },
        restartLevel: (level, gameGridContainer) => {
            _showStartButton();
            publicAPI.reset(gameGridContainer);
            publicAPI.startGameForLevel(level, gameGridContainer);
        },
        renderGridForLevel: gameGridContainer => {
            if (gameGrid.length == 0) {
                console.error('Game Init has not been called');
                return;
            }
            for (let i = 0; i < publicAPI.gameGrid.length; i++) {
                // prepare HTML for row
                let rowHTML = _createTileRowHTML();
                for (let j = 0; j < publicAPI.gameGrid.length; j++) {
                    // prepare HTML for tile at i,j
                    // append tile html into row html
                    let tileHTML = _createTileHTML(publicAPI.gameGrid[i][j]);
                    rowHTML.appendChild(tileHTML);
                }
                // append row HTML into gameGridContainer
                gameGridContainer.appendChild(rowHTML);
            }
        },
        revealTiles: () => {
            _enableTiles();
            _isRevealMode = true;
            setTimeout(() => {
                for (let position in publicAPI.toBeMemorisedPositionMap) {
                    let tileHTML = document.getElementById(position);
                    tileHTML.classList.add('revealedTile');
                }
                setTimeout(() => {
                    for (let position in publicAPI.toBeMemorisedPositionMap) {
                        let tileHTML = document.getElementById(position);
                        tileHTML.classList.remove('revealedTile');
                    }
                    _isRevealMode = false;
                }, _getDisplayTimeForLevel(publicAPI.currentLevel));
            }, 500);
        },
        setTotalClicksForLevel: level => {
            // Code for setting total clicks for level
            publicAPI.totalClicksForCurrentLevel = Math.floor(
                ((level + 1) * (level + 1)) / 2
            );
            // when this call is made we also show that in the html
            publicAPI.showClicksLeft();
        },
        handleUserClicks: gameGridContainer => {
            const clickHandler = event => {
                if (
                    _isTilesDisabled ||
                    _isRevealMode ||
                    !event.target.classList.contains('tile') ||
                    publicAPI.totalClicksForCurrentLevel === 0
                ) {
                    return;
                }

                // mark the tile whether correctly clicked or not
                let markTileResult = _markTile(event);
                if (!markTileResult) {
                    // Already clicked tile was clicked
                    return;
                }
                // decrement the count of chances left
                publicAPI.totalClicksForCurrentLevel--;
                // send the trigger to update the count
                publicAPI.showClicksLeft();
                // decide whether game proceeds to nextLevel();
                _decide(gameGridContainer);
            };
            return clickHandler;
        },
        showClicksLeft: () => {
            document.getElementById('movesNotifier').innerHTML =
                publicAPI.totalClicksForCurrentLevel;
        },
        nextLevel: gameGridContainer => {
            publicAPI.reset(gameGridContainer);
            publicAPI.currentLevel++;
            publicAPI.startGameForLevel(
                publicAPI.currentLevel,
                gameGridContainer
            );
            publicAPI.revealTiles();
        },
    };
    return publicAPI;
})();

(function init() {
    // Pass the div where you want to game to be initialised
    const gameGridContainer = document.getElementById('gameGrid');
    game.init(gameGridContainer);
})();
