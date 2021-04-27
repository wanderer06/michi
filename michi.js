let TILE_SIZE = 40;
let STAGE_COLS = 16;
let STAGE_ROWS = 16; 

const MOUSE_LEFT = 0;
const MOUSE_RIGHT = 2;

const EDIT_SYMBOL_TEXT_CONTENT = "Aa";
let EDIT_REF = null;


function init() {
    clear_stage();
    add_tile_count(STAGE_COLS * STAGE_ROWS);
    refresh_stage_style();
}

function create_tile() {
    let tile = document.createElement('div');
    tile.classList.add("tile");
    tile.style.lineHeight = `${TILE_SIZE}px`;
    tile.addEventListener('contextmenu', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
    })
    tile.addEventListener('mouseup', event => {
        if (event.button === MOUSE_LEFT) {
            event.target.dataset.selected = !(event.target.dataset.selected === "true");
        }
        if (event.button === MOUSE_RIGHT) {
            if (EDIT_REF !== null) {
                EDIT_REF.dataset.edit = false;
            }

            if (EDIT_REF === event.target) {
                clear_edit_ref();
                return;
            }

            EDIT_REF = event.target;
            EDIT_REF.dataset.edit = true;

            document.getElementById('edit-text').value = EDIT_REF.dataset.text || "";

            if (EDIT_REF.dataset.selected !== "true") {
                EDIT_REF.dataset.selected = true;
            }
        }
    })
    tile.addEventListener('mouseover', event => {
        if (event.target.dataset.text !== undefined && event.target.dataset.text !== "") {
            const tooltip = document.getElementById('tooltip')
            tooltip.classList.remove('invisible');
            tooltip.innerHTML = parse_text_formatting(event.target.dataset.text);
        }
    });
    tile.addEventListener('mouseout', event => {
        const tooltip = document.getElementById('tooltip');
        tooltip.classList.add('invisible');
    });
    tile.addEventListener('mousemove', event => {
        const tooltip = document.getElementById('tooltip');
        tooltip.style.left = `${event.pageX + 60}px`;
        tooltip.style.top = `${event.pageY - 12}px`;
    });

    return tile;
}

function parse_text_formatting(text) {
    return text
        .replace(/\*(.+)\*/g, "<strong>$1</strong>") // bold
        .replace(/_(.+)_/g, "<em>$1</em>") // itallic
        .replace(/~(.+)~/g, "<s>$1</s>") // striked through
        .replace(/#\[(.+),\s?(.+)\]/g, "<span class='$1'>$2</span>"); // add class
}

function tile_has_text(el) {
    return el.dataset.text !== undefined && el.dataset.text !== "";
}

function clear_stage() {
    const stage = document.getElementById("stage");
    while (stage.lastChild) {
        stage.removeChild(stage.lastChild);
    }
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
    document.getElementById("stage")[method](fragment);
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

function save() {
    const name = prompt("Name?");
    localStorage.setItem(name, JSON.stringify(serialize()));
}

function load() {
    const name = prompt("Name?");

    try {
        const map_string = localStorage.getItem(name);
        if (!map_string) {
            throw new Error(`No such map object: ${name}`);
        }

        const map = JSON.parse(map_string);
        TILE_SIZE = map.tile_size;
        STAGE_COLS = map.cols;
        STAGE_ROWS = map.rows;
        init();

        const children = Array.from(document.querySelectorAll(".tile"));
        for (const [index, tile] of Object.entries(map.tiles)) {
            if (tile.selected) {
                children[index].dataset.selected = true;
            }
            if (tile.text) {
                children[index].dataset.text = tile.text;
                children[index].textContent = EDIT_SYMBOL_TEXT_CONTENT;
            }
        }
    } catch (err) {
        alert(`Error loading map: ${err}`);
    }
}

function serialize() {
    return Array.from(document.querySelectorAll("#stage .tile")).reduce((accum, curr, index) => {
        if (curr.dataset.text !== undefined && curr.dataset.text !== "") {
            accum.tiles[index] = accum.tiles[index] || {};
            accum.tiles[index].text = curr.dataset.text;
        }
        if (curr.dataset.selected === "true") {
            accum.tiles[index] = accum.tiles[index] || {};
            accum.tiles[index].selected = true;
        }
        return accum;
    }, {tiles: {}, rows: STAGE_ROWS, cols: STAGE_COLS, tile_size: TILE_SIZE});
}

function update_tile_text() {
    if (EDIT_REF !== null) {
        const text_area = document.getElementById("edit-text");
        EDIT_REF.dataset.text = text_area.value;

        if (tile_has_text(EDIT_REF)) {
            EDIT_REF.textContent = EDIT_SYMBOL_TEXT_CONTENT;
        } else {
            EDIT_REF.textContent = "";
        }

        clear_edit_ref();
    }
}

function clear_edit_ref() {
    if (EDIT_REF !== null) {
        EDIT_REF.dataset.edit = false;
        document.getElementById("edit-text").value = "";
        EDIT_REF = null;
    }
}