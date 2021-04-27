const TILE_SIZE = 40;
const STAGE_COLS = 16;
const STAGE_ROWS = 16;

function init() {
    const fragment = document.createDocumentFragment();
    for (let tileIndex = 0; tileIndex < STAGE_COLS * STAGE_ROWS; tileIndex++) {
        fragment.appendChild(create_tile());
    }

    const stage = document.getElementById("stage");
    stage.style.gridTemplateColumns = `repeat(${STAGE_COLS}, ${TILE_SIZE}px)`;
    stage.style.gridTemplateRows = `repeat(${STAGE_ROWS}, ${TILE_SIZE}px)`;
    stage.appendChild(fragment);

    add_global_style();
}

function create_tile() {
    let tile = document.createElement('div');
    tile.classList.add("tile");
    tile.addEventListener('click', event => {
        event.target.dataset.selected = event.target.dataset.selected === "1" ? 0 : 1;
    })
    return tile;
}

function add_global_style() {
    const style = document.createElement('style');
    style.textContent = `
        #stage .tile:nth-child(${STAGE_COLS}n-${STAGE_COLS / 2}) {
            border-right: 1px solid var(--tile-border-inactive-axis);
        }

        #stage .tile:nth-child(n+${STAGE_COLS * STAGE_ROWS / 2 + 1}):nth-child(-n+${STAGE_COLS * STAGE_ROWS / 2 + STAGE_COLS}) {
            border-top: 1px solid var(--tile-border-inactive-axis);
        }
    `;
    document.head.appendChild(style);
}