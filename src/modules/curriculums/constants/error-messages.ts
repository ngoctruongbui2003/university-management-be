export const CURRICULUM_ERROR_MESSAGES = {
  NOT_FOUND: 'Curriculum not found',
  ALREADY_EXISTS: 'Curriculum with this name already exists',
  INVALID_ID: 'Invalid curriculum ID',
  DELETE_FAILED: 'Failed to delete curriculum',
  UPDATE_FAILED: 'Failed to update curriculum',
  CREATE_FAILED: 'Failed to create curriculum',
  INVALID_YEAR: 'Invalid effective year',
};

export const CURRICULUM_SESSION_ERROR_MESSAGES = {
  NOT_FOUND: 'Curriculum session not found',
  ALREADY_EXISTS: 'Session with this name already exists',
  INVALID_ID: 'Invalid session ID',
  DELETE_FAILED: 'Failed to delete session',
  UPDATE_FAILED: 'Failed to update session',
  CREATE_FAILED: 'Failed to create session',
  CURRICULUM_NOT_FOUND: 'Curriculum not found',
  INVALID_TOTAL_ITEMS: 'Invalid total items',
};

export const CURRICULUM_ITEM_ERROR_MESSAGES = {
  NOT_FOUND: 'Curriculum item not found',
  ALREADY_EXISTS: 'Item with this number already exists in this session',
  INVALID_ID: 'Invalid item ID',
  DELETE_FAILED: 'Failed to delete item',
  UPDATE_FAILED: 'Failed to update item',
  CREATE_FAILED: 'Failed to create item',
  SESSION_NOT_FOUND: 'Curriculum session not found',
  INVALID_ITEM_NUMBER: 'Invalid item number',
};

export const SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES = {
  NOT_FOUND: 'Subject curriculum item not found',
  ALREADY_EXISTS: 'Subject already exists in this curriculum item',
  INVALID_ID: 'Invalid subject curriculum item ID',
  DELETE_FAILED: 'Failed to delete subject curriculum item',
  UPDATE_FAILED: 'Failed to update subject curriculum item',
  CREATE_FAILED: 'Failed to create subject curriculum item',
  ITEM_NOT_FOUND: 'Curriculum item not found',
  SUBJECT_NOT_FOUND: 'Subject not found',
  PREREQUISITE_NOT_FOUND: 'Prerequisite subject not found',
  INVALID_CREDITS: 'Invalid credits',
}; 