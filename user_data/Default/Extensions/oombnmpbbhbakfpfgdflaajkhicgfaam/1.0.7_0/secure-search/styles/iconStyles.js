const safetyIconStyleSheet = new CSSStyleSheet();

const safetyIconStylesCSS = /*CSS*/ `
.icon-img {
    height: 22px;
    width: 22px;
    margin-right: 5px;
    margin-left: 5px;
}

.icon-container {
    height: 22px;
    width: 22px;
    z-index: 21;
    margin: 0px 25px;
    margin-top: auto;
    position: relative;
    cursor: pointer;
    visibility: visible;
}

.icon-ad-container {
    height: 22px;
    width: 22px;
    z-index: 21;
    position: relative;
    cursor: pointer;
    top: 18px;
}

.icon-img-wrapper {
    display: inline-flex;
    align-items: center;
}
`;

safetyIconStyleSheet.replaceSync(safetyIconStylesCSS);
