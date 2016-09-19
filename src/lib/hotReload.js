import fs from 'fs';
import path from 'path';

import { logger } from './logger';


/**
 * Return the path of the hot reload file.
 */
const getFilePath = () => {
  const rootPath = path.resolve('.');
  return path.join(rootPath, '.bouchonHotReload');
};

/**
 * Save the state into a file.
 */
export const saveState = state => {
  const hotReloadFile = getFilePath();
  const fileContent = JSON.stringify(state, null, 2);

  fs.writeFile(hotReloadFile, fileContent, (err) => {
    if (err) {
      logger.error(err);
      return;
    }
  });
};

/**
 * Read the file to return the latest state and used as the store initial state
 * if its content is not empty.
 */
export const readState = () => {
  const hotReloadFile = getFilePath();

  return new Promise((resolve) => {
    if (!fs.existsSync(hotReloadFile)) {
      resolve({});
      return;
    }

    fs.readFile(hotReloadFile, 'utf8', (err, data) => {
      if (err) {
        logger.warn(`Can't read the hot-reload file (${hotReloadFile}). Error: ${String(err)}`);
        resolve({});
        return;
      }

      let initialState = {};
      try {
        initialState = JSON.parse(data);
        resolve(initialState);
      } catch (parseErr) {
        fs.truncate(hotReloadFile, 0, (truncateErr) => {
          if (err) {
            logger.error(
              `Can't write the hot-reload file (${hotReloadFile}). `
              `Error: ${String(truncateErr)}`
            );
            return;
          }
        });

        logger.warn('The hot-reload file has invalid JSON data. Its content has been removed.');
        resolve({});
      }
    });
  });
};

/**
 * Remove the file. Called when the process is exiting.
 */
export const cleanup = () => {
  const hotReloadFile = getFilePath();

  try {
    fs.unlinkSync(hotReloadFile);
  } catch (err) {
    // do nothing specific here...
  }
};
