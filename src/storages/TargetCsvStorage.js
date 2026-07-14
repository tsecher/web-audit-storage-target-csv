import CSVStorage from 'web_audit/dist/storage/csv/CSVStorage.js'
import targetHandler from 'web_audit/dist/target/TargetHandler.js'

import fs from 'fs';
import path from 'path'
import { DefaultDeserializer } from 'v8';

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
            if( !fs.existsSync(filePath)){
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
                    
                fs.appendFileSync(
                    filePath, 
                    this.getCSVLine(
                        targetHandler.getStructureLabels(stored, group_id, context),
                         groupPath
                    )
                );
            }
            fs.appendFileSync(filePath, this.getCSVLine(data, groupPath));
        }
    }

    getStringifiedValue(key, value, data){
        return super.getStringifiedValue(key, value?.value || value, data)
    }

}

const storage = new TargetCsvStorageClass;
export default storage;
