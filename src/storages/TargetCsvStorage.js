import CSVStorage from 'web_audit/dist/storage/csv/CSVStorage.js'
import targetHandler from 'web_audit/dist/target/TargetHandler.js'

import fs from 'fs';
import path, { parse } from 'path'

/**
 * TargetCsvStorage class.
 */
class TargetCsvStorageClass extends CSVStorage {

    /**
     * {@inheritdoc}
     */
    get id() {
        return `target_csv_storage`;
    }
    /**
     * {@inheritdoc}
     */

    get name() {
        return `TargetCsvStorage`;
    }

    add(stored, group_id, context, data) {
        super.add(stored, group_id, context, data);

        this.initErrorStorage(stored, group_id, context, data);
    }

    initErrorStorage(stored, group_id, context, data){
        const parsedData = targetHandler.parseErrorData(stored, group_id, context, data);
        
        
        if( parsedData.lineError ){
            const groupPath = 'error/' + this.getGroupPath(stored, group_id);
            const filePath = this.getFilePath(groupPath, context);
           
            this.createFile(filePath, stored, group_id);

            const header = Object.keys(stored.getSchema().structure[group_id].structure);
            fs.appendFileSync(filePath, this.getCSVLine(data, header, groupPath));
        }
    }

    getStringifiedValue(key, value, data){
        return super.getStringifiedValue(key, value?.value || value, data)
    }

}

const storage = new TargetCsvStorageClass;
export default storage;
