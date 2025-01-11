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
