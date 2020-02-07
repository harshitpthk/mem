const game = (function gameCreator() {
    function _prepareTile(i, j, memorised) {
        return {
            originalColor: 'yellow',
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

    // Render
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

    const publicAPI = {
        gameGrid: [],
        toBeMemorisedPositionMap: {},
        init: level => {
            const { grid, toBeMemorisedPositionMap } = _createGridForLevel(
                level
            );
            publicAPI.gameGrid = grid;
            publicAPI.toBeMemorisedPositionMap = toBeMemorisedPositionMap;
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
            for (let position in publicAPI.toBeMemorisedPositionMap) {
                let tileHTML = document.getElementById(position);
                tileHTML.classList.add('revealedTile');
            }
            setTimeout(() => {
                for (let position in publicAPI.toBeMemorisedPositionMap) {
                    let tileHTML = document.getElementById(position);
                    tileHTML.classList.remove('revealedTile');
                }
            }, 800);
        },
    };
    return publicAPI;
})();

(function init() {
    const level = 1;
    const gameGridContainer = document.getElementById('gameGrid');
    game.init(level);
    game.renderGridForLevel(gameGridContainer);

    document
        .getElementById('startLevelButton')
        .addEventListener('click', () => game.revealTiles());
})();
