const chalk = require('chalk');
const { loadWebconfig } = require('./functions');
const webconfig = loadWebconfig();

async function getDate() {
	const date_ob = new Date();
	const date = ('0' + date_ob.getDate()).slice(-2);
	const month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
	const year = date_ob.getFullYear();
	const hours = date_ob.getHours();
	const minutes = date_ob.getMinutes();
	const seconds = date_ob.getSeconds();

	const dateLog = `[${year}-${month}-${date} ${hours}:${minutes}:${seconds}]`;

	return dateLog;
}

exports.info = async (data) => {
	const dateLog = await getDate();
	console.log(chalk.cyan(dateLog + ' [INFO] ' + data));
};

exports.discord = async (data) => {
	const dateLog = await getDate();
	console.log(chalk.blue(dateLog + ' [DISCORD BOT] ' + data));
};

exports.lavalink = async (data) => {
	const dateLog = await getDate();
	console.log(chalk.red(dateLog + ' [LAVALINK] ' + data));
};

exports.debug = async (data) => {
	if (webconfig.debug === false) {
		return;
	} else if (webconfig.debug === true) {
        const dateLog = await getDate();
        console.log(chalk.blue(dateLog + ' [DEBUG] ' + data));
    } else {
        this.error("The debug level was set to neither true or false! Please set this in webconfig.yml.").then(() => {
            process.exit(1)
        })
    }
};

exports.web = async (data) => {
	const dateLog = await getDate();
	console.log(chalk.blue(dateLog + ' [WEBSITE] ' + data));
};

exports.router = async (data) => {
	const dateLog = await getDate();
	console.log(chalk.blue(dateLog + ' [ROUTER] ' + data));
};

exports.API = async (data) => {
	const dateLog = await getDate();
	console.log(chalk.green(dateLog + ' [WEBSITE] ' + data));
};

exports.database = async (data) => {
	const dateLog = await getDate();
	console.log(chalk.magenta(dateLog + ' [DATABASE] ' + data));
};

exports.warn = async (data) => {
	const dateLog = await getDate();
	console.log(chalk.yellow(dateLog + ' [WARN] ' + data));
};

exports.error = async (data) => {
	const dateLog = await getDate();
	console.log(chalk.red(dateLog + ' [ERROR] ' + data));
};

exports.critical = async (data) => {
	const dateLog = await getDate();
	console.log(chalk.bold.bgRed(dateLog + ' [CRITICAL] ' + data));
};

exports.success = async (data) => {
	const dateLog = await getDate();
	console.log(chalk.green(dateLog + ' [SUCCESS] ' + data));
};