# Target (Web audit Storage and logger)

Provides target logger and storage for web_audit.

## Install
1. Install with your favorite package manager
2. Add the module in your web-audit.config.js 
```
export const config = {
	loggers: [
        ...
        'node_modules/web-audit-storage-target_csv_storage/src/loggers/TargetLogger.js'
    ],
    storages: [
        ...
        'node_modules/web-audit-storage-target-csv/src/storages/TargetCsvStorage.js',
    ]
},
```
3. Configure the targets on your web-audit.config.js file :
```
export const config = {
	...
    targets: {
        {{module_id}}:
            {{group_id}}: 
                {{field_id}}: {{value}}

    }
```

example: 
```
export const config = {
    ...
    targets: {
        ecoindex:{
            ecoindex: {
                grade: 'B',
                ecoIndex: '75',
            }
        },
        page_speed: {
            page_speed: {
                'first-contentful-paint': 300,
            },
            page_speed_details: {
                'total-byte-weight': 500,
            }
        }
    }
    
```

4. Configure the report file (html) on your web-audit.config.js file :
```
export const config = {
	...
    targets_settings: {
		report: {
			enable: true,
			path: `./analyses/errors.html`,
		}
	},
```
