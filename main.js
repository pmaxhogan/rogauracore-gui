// Modules to control application life and create native browser window
const {app, Menu, Tray, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs')
const which = require('which')
const child_process = require("child_process")

// needs to be declared globally to avoid being garbage collected
// https://stackoverflow.com/questions/58594357/nodejs-electron-tray-icon-disappearing-after-a-minute
let tray

// Menu.setApplicationMenu(Menu.buildFromTemplate([{
//     label: 'File',
//         submenu: [
//             { icon: path.join(__dirname, "red.png") , label: ""}
// ]
// }]))

// function createWindow () {
//     // Create the browser window.
//     const mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             preload: path.join(__dirname, 'preload.js')
//         }
//     })
//
//     // and load the index.html of the app.
//     mainWindow.loadFile('index.html')
//
//     // Open the DevTools.
//     // mainWindow.webContents.openDevTools()
// }

const checkSuid = () => {
    return fs.statSync(which.sync("rogauracore")).mode.toString(8)[2] > 3;
};

const runCommand = (args) => {
    try{
    child_process.execSync(`rogauracore ${args}`);
}catch(e){console.error(e, e.stdout.toString(), e.stderr.toString())}
};

const initalize = () => {
    console.log(`Initalizing`);
child_process.execSync("echo hi");
try{
    runCommand("initialize_keyboard");
}catch(e){console.error(e, e.stdout.toString(), e.stderr.toString())}
};

let brightness = 0;
const setBrightness = num => {
    brightness = num;
    console.log(`Setting brightness to ${num}`);
    runCommand(`brightness ${num}`);
    if(!currentColor || currentColor === "black"){
        setColor("white");
    }
};

let currentColor;
const setRainbow = speed => {
    currentColor = "rainbow";
    console.log(`Setting rainbow to ${speed}`);
    runCommand(`single_colorcycle ${speed}`);

};
const setColor = color => {
    currentColor = color;
    // if you set a color you probably want to see it
    if(brightness === 0 && color !== "black") setBrightness(3);
    console.log(`Setting color to ${color}`);
    runCommand(color);
};

const promptForSetUID = () => {
    child_process.execSync(`pkexec chmod u+s "${which.sync("rogauracore")}"`);
};

if(!checkSuid()){
    promptForSetUID();
}
initalize();

const capitalizeFirstLetter = letter => letter.slice(0, 1).toUpperCase() + letter.slice(1);

const colors = `
white
red
gold
yellow
green
cyan
blue
magenta
`.trim().split("\n")

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    tray = new Tray(path.join(__dirname, "rainbow.png"))
    tray.setToolTip("Rogauracore GUI");
    tray.setIgnoreDoubleClickEvents(true);
    const contextMenu = Menu.buildFromTemplate([
        { enabled: false, label: "Rogauracore GUI" },
        {type: "separator"},
        {label: "Off", click: () => setColor("black")},
        {type: "separator"},
        {icon: path.join(__dirname, "rainbow.png"), label: "Rainbow", submenu: [1, 2, 3].map(speed => ({
                label: `Speed: ${speed.toString()}`,
                click: () => setRainbow(speed)
            }))
        },
        {type: "separator"},
    ].concat(colors.map(color => (
        { /* type: "radio", */ icon: path.join(__dirname, "colors", color + ".png"), label: capitalizeFirstLetter(color), click: () => setColor(color)}
    ))).concat([
        {type: "separator"},
        {label: "Brightness",
            submenu: [
            // {
            //     label: "0",
            //     click: () => setBrightness(0)
            // },
            {
                label: "1",
                click: () => setBrightness(1)
            },
            {
                label: "2",
                click: () => setBrightness(2)
            },
            {
                label: "3",
                click: () => setBrightness(3)
            }
        ]},
        {type: "separator"},
        {label: "Quit", click: () => app.quit()}
    ]));
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        if(currentColor === "black") {
            setRainbow(1);
        }else{
            setColor("black");
        }
    });

    // app.on('activate', function () {
    //     // On macOS it's common to re-create a window in the app when the
    //     // dock icon is clicked and there are no other windows open.
    //     if (BrowserWindow.getAllWindows().length === 0) createWindow()
    // })
})

// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on('window-all-closed', function () {
//     if (process.platform !== 'darwin') app.quit()
// })
