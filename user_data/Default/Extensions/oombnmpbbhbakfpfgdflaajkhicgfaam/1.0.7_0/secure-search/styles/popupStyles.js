const safetyIconPopupStyleSheet = new CSSStyleSheet();

const safetyIconPopupStylesCSS = /*CSS*/ `
:host {
    --light-bg: #ffffff;
    --dark-bg: #363638;
    --light-text: #373c42;
    --dark-text: #e8ecee;
    --green-border: #659d15;
    --yellow-border: #fbbf01;
    --red-border: #de342b;
    --shadow-color: #00000026;
}

/* The popup styles*/
.popup {
    display: block;
    border-radius: 3px;
    position: absolute;
    z-index: 20;
    box-shadow: 0px 6px 15px 0px var(--shadow-color);
    padding: 9px 13px 10px 9px;
    min-width: 100px;
    border: solid 2px;
}

.light-mode.popup {
    background-color: var(--light-bg);
}

.dark-mode.popup {
    background-color: var(--dark-bg);
}

.popup-hidden {
    display: none;
}

.popup-red {
    border-color: var(--red-border);
}

.popup-yellow {
    border-color: var(--yellow-border);
}

.popup-green {
    border-color: var(--green-border);
}

/* Popup arrow */
.popup::before {
    content: "";
    position: absolute;
    z-index: 19;
    top: 50%;
    left: -6.5px;
    margin-top: -4.8px;
    width: 8.05px;
    height: 8.05px;
    border-left: solid 2px;
    border-bottom: solid 2px;
    transform: rotate(45deg);
    pointer-events: none;
}

.light-mode.popup::before {
    background-color: var(--light-bg);
}

.dark-mode.popup::before {
    background-color: var(--dark-bg);
}

:dir(rtl).popup::before{
    right: -6.5px;
    transform: rotate(225deg);
}

.popup-green::before {
    border-color: var(--green-border);
}

.popup-yellow::before {
    border-color: var(--yellow-border);
}

.popup-red::before {
    border-color: var(--red-border);
}

.popup-content {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.popup-img {
    width: 43px;
    height: 18px;
}

.popup-text {
    font-family: "Segoe UI", Roboto, "Open Sans", -apple-system, BlinkMacSystemFont, Ubuntu, Arial, sans-serif;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    border: none;
    margin: 0px;
    padding: 0px;
}

.light-mode .popup-text {
    color: var(--light-text);
}

.dark-mode .popup-text {
    color: var(--dark-text);
}
`;

safetyIconPopupStyleSheet.replaceSync(safetyIconPopupStylesCSS);
