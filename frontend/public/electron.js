const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const windowStateKeeper = require('electron-window-state');
const isDev = require('electron-is-dev'); 
const path = require('path'); 

require('./store');
require('./timerSystem.js');
require('./breakSystem.js');
require('./notificationSystem.js');
require('./popupWindows');

const DEFAULT_WINDOW_SIZE = {
    defaultWidth: 860,
    defaultHeight: 550,
}

const MAX_WINDOW_SIZE = {
    width: 1280,
    height: 800,
}


global.mainWindow;

/**
 * Configure event listeners and connect the various systems
 */
// Start break when timer ends
timerSystem.on('timer-end', () => breakSystem.start()); 

// Create notification windows when timer ends
timerSystem.on('timer-end', () => notificationSystem.createWindows());  

// Minimize notification when the break time is set/reset
breakSystem.on('break-times-set', () => notificationSystem.minimize()); 

// Expand notification when the break time is past the intermediate point
breakSystem.on('break-intermediate', () => notificationSystem.maximize());

// Start timer when break ends
breakSystem.on('break-end', () => timerSystem.start());

// Close notification windows when break ends
breakSystem.on('break-end', () => notificationSystem.closeWindows());


/**
 * Functions for creating windows
 */
// Main window
function createWindow() {

    // Main window
    let mainWindowState = windowStateKeeper(DEFAULT_WINDOW_SIZE);

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        center: true,
        minWidth: DEFAULT_WINDOW_SIZE.defaultWidth,
        minHeight: DEFAULT_WINDOW_SIZE.defaultHeight,
        maxWidth: MAX_WINDOW_SIZE.width,
        maxHeight: MAX_WINDOW_SIZE.height,
        maximizable: false,
        title: "iCare",
        backgroundColor: '#222222',
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,

            // Allow dev tools (for dev) and remote module (for testing) if isDev
            devTools: isDev,
            enableRemoteModule: isDev
        },
    });

    mainWindowState.manage(mainWindow);

    mainWindow.menuBarVisible = false;

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    );

    global.mainWindow.on('ready-to-show', () => global.mainWindow.show());

    // Prevent opening new windows
    mainWindow.webContents.on('new-window', (e, url) => {
        e.preventDefault()
    })

    // Handle closing through a confirmation dialog
    mainWindow.on('close', (e) => {
        if (isDev) {    // Just exit the app if isDev
            app.exit();
            return;
        }

        e.preventDefault();
        const closeConfirm = dialog.showMessageBoxSync(mainWindow, {
            type: 'question',
            title: 'iCare',
            message: 'Close iCare?',
            detail: 'You will not receive notifications when the app is closed.',
            buttons: ['Yes', 'No'],
            defaultId: 1
        })
        
        if (closeConfirm === 0) app.exit(); // Exit app if selected button is 'Yes'
    })

}


/**
 * Ensure that only one instance of iCare is open at a time
 */
const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) app.quit()

/**
 * Show first instance if a second instance is requested
 */
 app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
})

/**
 * App settings for when user logs in
 */
app.setLoginItemSettings({
    openAtLogin: global.store.get('preferences.startup.startAppOnLogin'),
    enabled: global.store.get('preferences.startup.startAppOnLogin'),
    path: app.getPath('exe')
})

/**
 * Application event handlers
 */
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

})

/**
 * Handle closing all windows behavior for macOS
 */
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// Prevent loading of new websitess
app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        event.preventDefault()
    })
})


/**
 * IPC event handlers
 * These event handlers are executed when another process invokes the event.
 */

// Log to main process's console
ipcMain.handle('log-to-console', (event, message) => {
    console.log(message);
})

// Get info about the app
ipcMain.on('get-about-info', (event) => {
    let aboutInfo = {
        appInfo: {
            name: app.getName(),
            version: app.getVersion()
        },
        contributors: [
            "Elise Hoang",
            "Jalen Ng",
            "Julie Loi",
            "Shiyun Lian",
            "Zuby Javed"
        ],
        openSourceLibraries: [
            "axios",
            "chart.js",
            "electron",
            "electron-builder",
            "electron-is-dev",
            "electron-store",
            "electron-window-state",
            "hazardous",
            "react",
            "react-chart",
            "react-charts",
            "react-circle",
            "sound-play"
        ]
    }
    event.reply('receive-about-info', aboutInfo);
})