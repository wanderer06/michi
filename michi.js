const TILE_SIZE = 40;
let STAGE_COLS = 16;
let STAGE_ROWS = 16; 

function init() {
    add_tile_count(STAGE_COLS * STAGE_ROWS)
    refresh_stage_style();
}

function create_tile() {
    let tile = document.createElement('div');
    tile.classList.add("tile");
    tile.addEventListener('click', event => {
        event.target.dataset.selected = event.target.dataset.selected === "1" ? 0 : 1;
    })
    return tile;
}

function refresh_stage_style() {
    const stage = document.getElementById("stage");
    stage.style.gridTemplateColumns = `repeat(${STAGE_COLS}, ${TILE_SIZE}px)`;
    stage.style.gridTemplateRows = `repeat(${STAGE_ROWS}, ${TILE_SIZE}px)`;

    const style = document.createElement('style');
    const half_cols = Math.floor(STAGE_COLS / 2);
    const half_rows = Math.floor(STAGE_ROWS / 2);

    style.id = "global";
    style.textContent = `
        #stage .tile:nth-child(${STAGE_COLS}n-${half_cols}) {
            border-right: 1px solid var(--tile-border-inactive-axis);
        }

        #stage .tile:nth-child(n+${STAGE_COLS * half_rows + 1}):nth-child(-n+${STAGE_COLS * half_rows + STAGE_COLS}) {
            border-top: 1px solid var(--tile-border-inactive-axis);
        }
    `;

    const existing_style = document.getElementById("global");
    if (existing_style) {
        document.head.removeChild(existing_style);
    }
    document.head.appendChild(style);
}

function add_tile_count(count, method = "append") {
    console.assert(method === "prepend" || method === "append");

    const fragment = document.createDocumentFragment();
    for (let it = 0; it < count; it++) {
        fragment.append(create_tile());
    }
    document.getElementById("stage")[method](fragment)
}

function add_row_above() {
    add_tile_count(STAGE_COLS, "prepend");
    STAGE_ROWS++;
    refresh_stage_style();
}

function add_row_below() {
    add_tile_count(STAGE_COLS, "append");
    STAGE_ROWS++;
    refresh_stage_style();
}

function add_col_right() {
    get_right_col_children().forEach(el => el.after(create_tile()));
    STAGE_COLS++;
    refresh_stage_style();
}

function add_col_left() {
    get_left_col_children().forEach(el => el.before(create_tile()));
    STAGE_COLS++;
    refresh_stage_style();
}

function get_right_col_children() {
    return document.querySelectorAll(`#stage .tile:nth-child(${STAGE_COLS}n)`);
}

function get_left_col_children() {
    return document.querySelectorAll(`#stage .tile:nth-child(${STAGE_COLS}n - ${STAGE_COLS - 1})`);
}

function remove_row_above() {
    remove_row("first");
    STAGE_ROWS--;
    refresh_stage_style();
}

function remove_row_below() {
    remove_row("last");
    STAGE_ROWS--;
    refresh_stage_style();
}

function remove_col_left() {
    get_left_col_children().forEach(el => el.parentNode.removeChild(el));
    STAGE_COLS--;
    refresh_stage_style();
}

function remove_col_right() {
    get_right_col_children().forEach(el => el.parentNode.removeChild(el));
    STAGE_COLS--;
    refresh_stage_style();
}

function remove_row(direction) {
    const stage = document.getElementById("stage");
    for (let it = 0; it < STAGE_COLS; it++) {
        stage.removeChild(stage[`${direction}Child`]);
    }
}
