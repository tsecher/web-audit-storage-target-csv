import fs from 'fs'
import path from 'path'
import colors from 'colors';
import Table from 'cli-table3'
import {ModuleEvents} from 'web_audit/dist/modules/ModuleInterface.js';
import targetHandler from 'web_audit/dist/target/TargetHandler.js';
import {AppConfig} from 'web_audit/dist/app/conf/AppConfig.js';


/**
 * TargetLogger class.
 */
class TargetLoggerClass {

	summaries = {};

	constructor() {
	}

	get id() {
		return `target_logger`;
	}

	get name() {
		return 'TargetLogger';
	}

	prepare(context) {
		// Add summary if error after analyse.
		context.eventBus.on(ModuleEvents.onAnalyseSummary, (data) => {
			const stored = data.data?.module || null;
			const summary = data.data.summary || null;
			const group_id = data.data.group_id || null;


			if (stored && summary) {
				this.onAnalyse(stored, group_id, context, summary);
			}
		});

		// Render at the end of the analysis.
		context.eventBus.on(ModuleEvents.afterAllUrlProcess, () => this.renderSummary());

		// Render HTML part output.
		if (AppConfig.config.targets_settings?.report?.enable) {
			context.eventBus.on(ModuleEvents.afterAllUrlProcess, () => this.renderHTMLSummary(AppConfig.config.targets_settings?.report?.path));
		}
	}

	error(data, id) {
		this.log(data, id, colors.red);
	}

	message(data, id) {
		this.log(data, id);
	}

	success(data, id) {
		this.log(data, id, colors.green);
	}

	warning(data, id) {
		this.log(data, id, colors.yellow);
	}

	exit(data, id) {
		process.exit();
	}

	result(name, values, id) {
	}

	log(data, id, color) {
		const variables = [];
		if (id) {
			variables.push(`[${id}] `);
		}
		variables.push(data);
		if (color) {
			console.log(color(...variables));
		} else {
			console.log(...variables);
		}
	}

	onAnalyse(stored, group_id, context, result) {
		const parsedData = targetHandler.parseErrorData(stored, group_id, context, result);

		if (parsedData.lineError) {
			const summary = {};
			const labels = targetHandler.getStructureLabels(stored, group_id, context);

			Object.entries(labels).forEach(([id, data]) => {
				// summary[labels[id]] = parsedData.data[id]?.value;
				summary[labels[id]] = parsedData.data[id];
			});

			this.addSummaries(stored, group_id, summary);
		}
	}

	addSummaries(stored, group_id, data) {
		if (!this.summaries[stored.id]) {
			this.summaries[stored.id] = {
				stored: stored,
				structures: {}
			}
		}
		if (!this.summaries[stored.id].structures[group_id]) {
			this.summaries[stored.id].structures[group_id] = {
				head: Object.keys(data),
				values: [],
			}
		}

		this.summaries[stored.id].structures[group_id].values.push(Object.values(data));
	}

	renderSummary() {
		Object.entries(this.summaries).forEach(([key, value]) => {
			Object.entries(value.structures).forEach(([group_id, data]) => {
				// Title.
				this.log(colors.blue(`${value.stored.name} : ${group_id}`));

				// Table.
				const table = new Table({
					head: data.head.map( value => colors.bold(colors.grey(value)))
				});
				data.values.forEach(row => {
					table.push(row.map(value => value?.error ? colors.red(value?.value) : value?.value));
				});
				console.log(table.toString());
			});
		});
	}

	renderHTMLSummary(file_path = 'errors.html') {
		let content = ``;
		Object.entries(this.summaries).forEach(([key, value]) => {
			Object.entries(value.structures).forEach(([group_id, data]) => {
				// Title.
				content += `<section><h2>${value.stored.name} (${group_id})</h2>`

				// Table + head
				content += `<table><thead><tr>${data.head.map(value => `<th>${value}</th>`).join('')}</tr></thead><tbody>`;

				// Rows;
				data.values.forEach(row => {
					content += `<tr>${Object.values(row).map(value => {
						return value?.error ?  `<td class="error">${value?.value || ''}</td>` : `<td>${value?.value || ''}</td>`
					}).join('')}</tr>`
				})

				content += `</tbody></table></section>`;
			});
		});

		if (content.length > 0) {
			content = `<style> table, tr, th, td { border: 1px solid var(--border-color, black); border-collapse: collapse; padding: .5 1rem;} .error{ color: var(--color-error, red);}</style>` + content;

			fs.mkdirSync(path.dirname(file_path), {recursive : true});
			fs.writeFileSync(file_path, content);
		}
	}
}

const logger = new TargetLoggerClass;
export default logger;

