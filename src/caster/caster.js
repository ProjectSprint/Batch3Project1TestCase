/**
 * @param {import("k6").JSONValue} value
 * @returns {value is Department}
 */
export function isDepartment(value) {
  return typeof value === 'object' &&
    value !== null &&
    'departmentId' in value &&
    typeof value.departmentId === 'string' &&
    'name' in value &&
    typeof value.name === 'string';
}

/**
 * @param {import("k6").JSONValue} value
 * @returns {value is Employee}
 */
export function isEmployee(value) {
  return typeof value === 'object' &&
    value !== null &&
    'identityNumber' in value && typeof value.identityNumber === 'string' &&
    'name' in value && typeof value.name === 'string' &&
    'employeeImageUri' in value && typeof value.employeeImageUri === 'string' &&
    'gender' in value && typeof value.gender === 'string' &&
    'departmentId' in value && typeof value.departmentId === 'string'
    ;
}

/**
 * @param {import("k6").JSONValue} value
 * @returns {value is User}
 */
export function isUser(value) {
  // Basic checks for object and required fields
  if (typeof value !== 'object' || value === null ||
    !('token' in value) ||
    typeof value.token !== 'string') {
    return false;
  }

  // Optional fields type checking
  const fieldTypes = {
    name: 'string',
    companyName: 'string',
    companyImageUri: 'string',
    userImageUri: 'string'
  };

  // Check each optional field's type if it exists
  for (const [field, expectedType] of Object.entries(fieldTypes)) {
    if (field in value && typeof value[field] !== expectedType) {
      return false;
    }
  }

  return true;
}
